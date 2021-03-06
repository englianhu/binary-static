const Url    = require('./url').Url;
const Client = require('./client').Client;
require('../../lib/mmenu/jquery.mmenu.min.all.js');

const Menu = (function() {
    let page_url;

    const init = function (url) {
        page_url = url;
        $(page_url).on('change', function() { activate(); });
    };

    const activate = function() {
        $('#menu-top').find('li').removeClass('active');
        hide_main_menu();

        const active = active_menu_top();
        if (active) {
            active.addClass('active');
        }

        if (Client.is_logged_in() || /\/(cashier|resources|trading|trading_beta|multi_barriers_trading)/i.test(window.location.pathname)) {
            show_main_menu();
        }
    };

    const show_main_menu = function() {
        $('#main-menu').removeClass('hidden');
        activate_main_menu();
    };

    const hide_main_menu = function() {
        $('#main-menu').addClass('hidden');
    };

    const activate_main_menu = function() {
        // First unset everything.
        const $main_menu = $('#main-menu');
        $main_menu.find('li.item').removeClass('active hover');
        $main_menu.find('li.sub_item a').removeClass('a-active');

        const active = active_main_menu();
        if (active.subitem) {
            active.subitem.addClass('a-active');
        }

        if (active.item) {
            active.item.addClass('active');
            active.item.addClass('hover');
        }

        on_mouse_hover(active.item);
    };

    const on_unload = function() {
        $('#main-menu').find('.item').unbind().end()
                       .unbind();
    };

    const on_mouse_hover = function(active_item) {
        const $main_menu = $('#main-menu');
        $main_menu.find('.item').on('mouseenter', function() {
            $('#main-menu').find('li.item').removeClass('hover');
            $(this).addClass('hover');
        });

        $main_menu.on('mouseleave', function() {
            $main_menu.find('li.item').removeClass('hover');
            if (active_item) active_item.addClass('hover');
        });
    };

    const active_menu_top = function() {
        let active = '';
        const path = window.location.pathname;
        $('#menu-top').find('li a').each(function() {
            if (path.indexOf(this.pathname.replace(/\.html/i, '')) >= 0) {
                active = $(this).closest('li');
            }
        });

        return active;
    };

    const active_main_menu = function() {
        let new_url = page_url;
        if (/cashier/i.test(new_url.location.href) && !(/cashier_password/.test(new_url.location.href))) {
            new_url = new Url($('#topMenuCashier').find('a').attr('href'));
        }

        let item = '',
            subitem = '';
        const $main_menu = $('#main-menu');
        // Is something selected in main items list
        $main_menu.find('.items a').each(function () {
            const url = new Url($(this).attr('href'));
            if (url.is_in(new_url)) {
                item = $(this).closest('.item');
            }
        });

        $main_menu.find('.sub_items a').each(function() {
            const link_href = $(this).attr('href');
            if (link_href) {
                const url = new Url(link_href);
                if (url.is_in(new_url)) {
                    item = $(this).closest('.item');
                    subitem = $(this);
                }
            }
        });

        return { item: item, subitem: subitem };
    };

    const make_mobile_menu = function () {
        if ($('#mobile-menu-container').is(':visible')) {
            $('#mobile-menu').mmenu({
                position       : 'right',
                zposition      : 'front',
                slidingSubmenus: false,
                searchfield    : true,
                onClick        : {
                    close: true,
                },
            }, {
                selectedClass: 'active',
            });
        }
    };

    return {
        init            : init,
        on_unload       : on_unload,
        make_mobile_menu: make_mobile_menu,
    };
})();

module.exports = {
    Menu: Menu,
};
