const expect = require('chai').expect;
const activeSymbols = require('../active_symbols').ActiveSymbols;
const ws = require('ws');
const LiveApi = require('binary-live-api').LiveApi;
const deep = require('deep-diff');

const api = new LiveApi({ websocket: ws });

/*
    There is a market called forex, which has a submarket called major_pairs, which has a symbol called frxEURUSD
*/

const expected_markets_str = '{"indices":{"name":"Indices","is_active":1,"submarkets":{"europe_africa":{"name":"Europe/Africa","is_active":1,"symbols":{"AEX":{"display":"Dutch Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"europe_africa"},"BFX":{"display":"Belgian Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"europe_africa"},"FCHI":{"display":"French Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"europe_africa"},"GDAXI":{"display":"German Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"europe_africa"},"ISEQ":{"display":"Irish Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"europe_africa"},"OBX":{"display":"Norwegian Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"europe_africa"},"SSMI":{"display":"Swiss Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"europe_africa"},"TOP40":{"display":"South African Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"europe_africa"}}},"asia_oceania":{"name":"Asia/Oceania","is_active":1,"symbols":{"AS51":{"display":"Australian Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"asia_oceania"},"BSESENSEX30":{"display":"Bombay Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"asia_oceania"},"HSI":{"display":"Hong Kong Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"asia_oceania"},"JCI":{"display":"Jakarta Index","symbol_type":"stockindex","is_active":1,"pip":"0.001","market":"indices","submarket":"asia_oceania"},"N225":{"display":"Japanese Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"asia_oceania"},"STI":{"display":"Singapore Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"asia_oceania"}}},"middle_east":{"name":"Middle East","is_active":1,"symbols":{"DFMGI":{"display":"Dubai Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"middle_east"}}},"otc_index":{"name":"OTC Indices","is_active":1,"symbols":{"OTC_AEX":{"display":"Dutch OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_AS51":{"display":"Australian OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_BFX":{"display":"Belgian OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_BSESENSEX30":{"display":"Bombay OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_DJI":{"display":"Wall Street OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_FCHI":{"display":"French OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_FTSE":{"display":"UK OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_GDAXI":{"display":"German OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_HSI":{"display":"Hong Kong OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_IXIC":{"display":"US Tech OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_N225":{"display":"Japanese OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"},"OTC_SPC":{"display":"US OTC Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"otc_index"}}},"americas":{"name":"Americas","is_active":1,"symbols":{"SPC":{"display":"US Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"indices","submarket":"americas"}}}}},"stocks":{"name":"OTC Stocks","is_active":1,"submarkets":{"ge_otc_stock":{"name":"Germany","is_active":1,"symbols":{"DEALV":{"display":"Allianz","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"ge_otc_stock"},"DEDAI":{"display":"Daimler","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"ge_otc_stock"},"DESIE":{"display":"Siemens","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"ge_otc_stock"}}},"uk_otc_stock":{"name":"UK","is_active":1,"symbols":{"UKBARC":{"display":"Barclays","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"uk_otc_stock"},"UKBATS":{"display":"British American Tobacco","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"uk_otc_stock"},"UKHSBA":{"display":"HSBC","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"uk_otc_stock"}}},"us_otc_stock":{"name":"US","is_active":1,"symbols":{"USAAPL":{"display":"Apple","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"us_otc_stock"},"USAMZN":{"display":"Amazon.com","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"us_otc_stock"},"USCT":{"display":"Citigroup","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"us_otc_stock"},"USFB":{"display":"Facebook","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"us_otc_stock"},"USGOOG":{"display":"Alphabet","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"us_otc_stock"},"USMSFT":{"display":"Microsoft","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"us_otc_stock"},"USXOM":{"display":"Exxon Mobil","symbol_type":"individualstock","is_active":1,"pip":"0.01","market":"stocks","submarket":"us_otc_stock"}}}}},"volidx":{"name":"Volatility Indices","is_active":1,"submarkets":{"random_daily":{"name":"Daily Reset Indices","is_active":1,"symbols":{"RDBEAR":{"display":"Bear Market Index","symbol_type":"stockindex","is_active":1,"pip":"0.0001","market":"volidx","submarket":"random_daily"},"RDBULL":{"display":"Bull Market Index","symbol_type":"stockindex","is_active":1,"pip":"0.0001","market":"volidx","submarket":"random_daily"}}},"random_index":{"name":"Continuous Indices","is_active":1,"symbols":{"R_100":{"display":"Volatility 100 Index","symbol_type":"stockindex","is_active":1,"pip":"0.01","market":"volidx","submarket":"random_index"},"R_25":{"display":"Volatility 25 Index","symbol_type":"stockindex","is_active":1,"pip":"0.001","market":"volidx","submarket":"random_index"},"R_50":{"display":"Volatility 50 Index","symbol_type":"stockindex","is_active":1,"pip":"0.0001","market":"volidx","submarket":"random_index"},"R_75":{"display":"Volatility 75 Index","symbol_type":"stockindex","is_active":1,"pip":"0.0001","market":"volidx","submarket":"random_index"}}}}},"forex":{"name":"Forex","is_active":1,"submarkets":{"smart_fx":{"name":"Smart FX","is_active":1,"symbols":{"WLDAUD":{"display":"AUD Index","symbol_type":"smart_fx","is_active":1,"pip":"0.001","market":"forex","submarket":"smart_fx"},"WLDEUR":{"display":"EUR Index","symbol_type":"smart_fx","is_active":1,"pip":"0.001","market":"forex","submarket":"smart_fx"},"WLDGBP":{"display":"GBP Index","symbol_type":"smart_fx","is_active":1,"pip":"0.001","market":"forex","submarket":"smart_fx"},"WLDUSD":{"display":"USD Index","symbol_type":"smart_fx","is_active":1,"pip":"0.001","market":"forex","submarket":"smart_fx"}}},"minor_pairs":{"name":"Minor Pairs","is_active":1,"symbols":{"frxAUDCAD":{"display":"AUD/CAD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxAUDCHF":{"display":"AUD/CHF","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxAUDNZD":{"display":"AUD/NZD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxAUDPLN":{"display":"AUD/PLN","symbol_type":"forex","is_active":1,"pip":"0.0001","market":"forex","submarket":"minor_pairs"},"frxEURNZD":{"display":"EUR/NZD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxGBPCAD":{"display":"GBP/CAD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxGBPCHF":{"display":"GBP/CHF","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxGBPNOK":{"display":"GBP/NOK","symbol_type":"forex","is_active":1,"pip":"0.0001","market":"forex","submarket":"minor_pairs"},"frxGBPNZD":{"display":"GBP/NZD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxGBPPLN":{"display":"GBP/PLN","symbol_type":"forex","is_active":1,"pip":"0.0001","market":"forex","submarket":"minor_pairs"},"frxNZDJPY":{"display":"NZD/JPY","symbol_type":"forex","is_active":1,"pip":"0.001","market":"forex","submarket":"minor_pairs"},"frxNZDUSD":{"display":"NZD/USD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxUSDMXN":{"display":"USD/MXN","symbol_type":"forex","is_active":1,"pip":"0.0001","market":"forex","submarket":"minor_pairs"},"frxUSDNOK":{"display":"USD/NOK","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"},"frxUSDPLN":{"display":"USD/PLN","symbol_type":"forex","is_active":1,"pip":"0.0001","market":"forex","submarket":"minor_pairs"},"frxUSDSEK":{"display":"USD/SEK","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"minor_pairs"}}},"major_pairs":{"name":"Major Pairs","is_active":1,"symbols":{"frxAUDJPY":{"display":"AUD/JPY","symbol_type":"forex","is_active":1,"pip":"0.001","market":"forex","submarket":"major_pairs"},"frxAUDUSD":{"display":"AUD/USD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxEURAUD":{"display":"EUR/AUD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxEURCAD":{"display":"EUR/CAD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxEURCHF":{"display":"EUR/CHF","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxEURGBP":{"display":"EUR/GBP","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxEURJPY":{"display":"EUR/JPY","symbol_type":"forex","is_active":1,"pip":"0.001","market":"forex","submarket":"major_pairs"},"frxEURUSD":{"display":"EUR/USD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxGBPAUD":{"display":"GBP/AUD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxGBPJPY":{"display":"GBP/JPY","symbol_type":"forex","is_active":1,"pip":"0.001","market":"forex","submarket":"major_pairs"},"frxGBPUSD":{"display":"GBP/USD","symbol_type":"forex","is_active":1,"pip":"0.0001","market":"forex","submarket":"major_pairs"},"frxUSDCAD":{"display":"USD/CAD","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxUSDCHF":{"display":"USD/CHF","symbol_type":"forex","is_active":1,"pip":"0.00001","market":"forex","submarket":"major_pairs"},"frxUSDJPY":{"display":"USD/JPY","symbol_type":"forex","is_active":1,"pip":"0.001","market":"forex","submarket":"major_pairs"}}}}},"commodities":{"name":"Commodities","is_active":1,"submarkets":{"energy":{"name":"Energy","is_active":1,"symbols":{"frxBROUSD":{"display":"Oil/USD","symbol_type":"commodities","is_active":1,"pip":"0.01","market":"commodities","submarket":"energy"}}},"metals":{"name":"Metals","is_active":1,"symbols":{"frxXAGUSD":{"display":"Silver/USD","symbol_type":"commodities","is_active":1,"pip":"0.0001","market":"commodities","submarket":"metals"},"frxXAUUSD":{"display":"Gold/USD","symbol_type":"commodities","is_active":1,"pip":"0.01","market":"commodities","submarket":"metals"},"frxXPDUSD":{"display":"Palladium/USD","symbol_type":"commodities","is_active":1,"pip":"0.01","market":"commodities","submarket":"metals"},"frxXPTUSD":{"display":"Platinum/USD","symbol_type":"commodities","is_active":1,"pip":"0.01","market":"commodities","submarket":"metals"}}}}}}';
const set_checks = function(obj) {
    if (obj instanceof Object) {
        delete obj.is_active;
        delete obj.display;
        Object.keys(obj).forEach(function(key) {
            if (obj[key] instanceof Object) {
                set_checks(obj[key]);
            }
        });
    }
    return obj;
};

describe('ActiveSymbols', function() {
    let active_symbols;
    before(function(done) {
        this.timeout(10000);
        api.getActiveSymbolsBrief().then(function(response) {
            active_symbols = response.active_symbols;
            done();
        });
    });
    it('Should have all functions that are being tested', function() {
        expect(activeSymbols).to.have.any.of.keys(['getMarkets', 'getSubmarkets', 'getMarketsList', 'getTradeUnderlyings', 'getSymbolNames']);
    });
    it('Should getMarkets have forex as a key', function() {
        const markets = activeSymbols.getMarkets(active_symbols);
        expect(markets).to.be.an('Object')
            .and.to.have.property('forex');
        expect(markets.forex).to.have.property('name')
            .and.to.be.a('String');
        expect(markets.forex).to.have.property('is_active')
            .and.to.be.a('Number');
        expect(markets.forex).to.have.property('submarkets')
            .and.to.be.an('Object');
    });
    it('Should getSubmarkets have major_pairs as a key, but not forex', function() {
        const submarkets = activeSymbols.getSubmarkets(active_symbols);
        expect(submarkets).to.be.an('Object')
            .and.to.have.any.of.key('major_pairs')
            .and.not.to.have.any.of.key('forex');
    });
    it('Should getMarketsList have major_pairs and forex as keys', function() {
        const marketList = activeSymbols.getMarketsList(active_symbols);
        expect(marketList).to.be.an('Object')
            .and.to.have.any.of.keys(['forex', 'major_pairs']);
    });
    it('Should getTradeUnderlyings have major_pairs and forex as keys and symbols as values', function() {
        const tradeUnderlyings = activeSymbols.getTradeUnderlyings(active_symbols);
        expect(tradeUnderlyings).to.be.an('Object')
            .and.to.have.property('forex')
            .and.to.have.property('frxEURUSD')
            .and.to.have.any.of.keys(['is_active', 'display', 'market', 'submarket']);
        expect(tradeUnderlyings).to.have.property('major_pairs')
            .and.to.have.property('frxEURUSD')
            .and.to.have.any.of.keys(['is_active', 'display', 'market', 'submarket']);
    });
    it('Should getSymbolNames have all symbol names', function() {
        const names = activeSymbols.getSymbolNames(active_symbols);
        expect(names).to.be.an('Object')
            .and.to.have.property('frxEURUSD');
    });
    it.skip('Should getMarkets output match the market snapshot', function() {
        const markets = activeSymbols.getMarkets(active_symbols);
        const deepDiff = deep(set_checks(markets), set_checks(JSON.parse(expected_markets_str)));
        if (deepDiff) {
            deepDiff.forEach(function(diff) {
                expect(diff).to.have.property('kind')
                    .and.not.to.be.equal('E');
            });
        }
    });
});
