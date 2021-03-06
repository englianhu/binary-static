const moment                 = require('moment');
const MarketTimes            = require('../market_timesws');
const State                  = require('../../../base/storage').State;
const showLoadingImage       = require('../../../base/utility').showLoadingImage;
const localize               = require('../../../base/localize').localize;
const Table                  = require('../../../common_functions/attach_dom/table').Table;
const dateValueChanged       = require('../../../common_functions/common_functions').dateValueChanged;
const jqueryuiTabsToDropdown = require('../../../common_functions/common_functions').jqueryuiTabsToDropdown;
const Content                = require('../../../common_functions/content').Content;
const japanese_client        = require('../../../common_functions/country_base').japanese_client;
const toISOFormat            = require('../../../common_functions/string_util').toISOFormat;
const toReadableFormat       = require('../../../common_functions/string_util').toReadableFormat;
const DatePicker             = require('../../../components/date_picker').DatePicker;

const MarketTimesUI = (() => {
    'use strict';

    let $date,
        $container,
        columns,
        active_symbols,
        trading_times,
        is_framed;

    const onLoad = function(config) {
        $date      = $('#trading-date');
        $container = $('#trading-times');
        columns    = ['Asset', 'Opens', 'Closes', 'Settles', 'UpcomingEvents'];
        if (!State.get('is_beta_trading')) active_symbols = trading_times = undefined;

        if ($container.contents().length) return;

        Content.populate();
        showLoadingImage($container);

        is_framed = (config && config.framed);
        if (!trading_times) {
            sendRequest('today', !(active_symbols && active_symbols.length));
        }

        const date = moment.utc();
        $date.val(toReadableFormat(date))
             .attr('data-value', toISOFormat(date));
        const datePickerInst = new DatePicker('#trading-date');
        datePickerInst.show({
            minDate: 'today',
            maxDate: 364,
        });
        $date.change(function() {
            if (!dateValueChanged(this, 'date')) {
                return false;
            }
            $container.empty();
            showLoadingImage($container);
            trading_times = null;
            sendRequest($date.attr('data-value'), !active_symbols);
            return true;
        });

        $container.tabs();
    };

    const populateTable = () => {
        if (!active_symbols || !trading_times) return;

        $('#errorMsg').addClass('hidden');

        const is_japan_trading = japanese_client();

        const markets = trading_times.markets;

        const $ul = $('<ul/>', { class: is_japan_trading ? 'hidden' : '' });
        const $contents = $('<div/>');

        for (let m = 0; m < markets.length; m++) {
            const tabID = 'market_' + (m + 1);

            // contents
            const $market = $('<div/>', { id: tabID });
            $market.append(createMarketTables(markets[m], is_japan_trading));
            if ($market.find('table tr').length) {
                $contents.append($market);

                // tabs
                if (!is_japan_trading) {
                    $ul.append($('<li/>').append($('<a/>', { href: '#' + tabID, text: markets[m].name, id: 'outline' })));
                }
            }
        }

        $container.empty().append($ul).append($contents.children());

        $container.tabs('destroy').tabs();

        if (is_framed) {
            $container.find('ul').hide();
            $('<div/>', { class: 'center-text' }).append(jqueryuiTabsToDropdown($container)).prependTo($container);
        }
    };

    const createMarketTables = (market, is_japan_trading) => {
        const $market_tables = $('<div/>');

        // submarkets of this market
        const submarkets = market.submarkets;
        let should_populate;
        for (let s = 0; s < submarkets.length; s++) {
            should_populate = true;
            // display only "Major Pairs" for Japan
            if (is_japan_trading) {
                const submarket_info = MarketTimes.getSubmarketInfo(active_symbols, submarkets[s].name);
                if (submarket_info.length === 0 || submarket_info[0].submarket !== 'major_pairs') {
                    should_populate = false;
                }
            }

            if (should_populate) {
                // submarket table
                const $submarket_table = createEmptyTable(market.name + '-' + s);

                // submarket name
                $submarket_table.find('thead').prepend(createSubmarketHeader(submarkets[s].name))
                    .find('th.opens, th.closes').addClass('nowrap');

                // symbols of this submarket
                const symbols = submarkets[s].symbols;
                for (let sy = 0; sy < symbols.length; sy++) {
                    if (Object.keys(MarketTimes.getSymbolInfo(symbols[sy].symbol, active_symbols)).length !== 0) {
                        $submarket_table.find('tbody').append(createSubmarketTableRow(market.name, submarkets[s].name, symbols[sy]));
                    }
                }

                if ($submarket_table.find('tbody tr').length) {
                    $market_tables.append($submarket_table);
                }
            }
        }

        return $market_tables;
    };

    const createSubmarketHeader = submarket_name => (
        $('<tr/>', { class: 'flex-tr' })
            .append($('<th/>', { class: 'flex-tr-child submarket-name', colspan: columns.length, text: submarket_name })));

    const createSubmarketTableRow = (market_name, submarket_name, symbol) => {
        const $table_row = Table.createFlexTableRow(
            [
                symbol.name,
                '', // Opens
                '', // Closes
                symbol.times.settlement,
                '',  // UpcomingEvents
            ],
            columns,
            'data');
        $table_row.children('.opens').html(symbol.times.open.join('<br />'));
        $table_row.children('.closes').html(symbol.times.close.join('<br />'));
        $table_row.children('.upcomingevents').html(createEventsText(symbol.events));

        return $table_row;
    };

    const createEventsText = (events) => {
        let result = '';
        for (let i = 0; i < events.length; i++) {
            result += (i > 0 ? '<br />' : '') + localize(events[i].descrip) + ': ' + localize(events[i].dates);
        }
        return result.length > 0 ? result : '--';
    };

    const createEmptyTable = (table_id) => {
        const header = [
            localize('Asset'),
            localize('Opens'),
            localize('Closes'),
            localize('Settles'),
            localize('Upcoming Events'),
        ];

        const metadata = {
            id  : table_id,
            cols: columns,
        };

        return Table.createFlexTable([], metadata, header);
    };

    const sendRequest = (date, should_request_active_symbols) => {
        if (State.get('is_beta_trading')) return;

        const req = { active_symbols: 'brief' };
        if (japanese_client()) {
            req.landing_company = 'japan';
        }
        if (should_request_active_symbols) {
            BinarySocket.send(req).then((response) => {
                MarketTimesUI.setActiveSymbols(response);
            });
        }
        BinarySocket.send({ trading_times: date || 'today' }).then((response) => {
            MarketTimesUI.setTradingTimes(response);
        });
    };

    return {
        onLoad          : onLoad,
        setActiveSymbols: (response) => {
            active_symbols = response.active_symbols.slice(0); // clone
            if (trading_times) populateTable();
        },
        setTradingTimes: (response) => {
            trading_times = response.trading_times;
            if (active_symbols) populateTable();
        },
    };
})();

module.exports = MarketTimesUI;
