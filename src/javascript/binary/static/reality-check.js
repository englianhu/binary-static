var RealityCheck = (function() {
    "use strict";
    var reality_check_url = page.url.url_for('user/reality_check');
    var reality_freq_url  = page.url.url_for('user/reality_check_frequency');
    var defaultFrequencyInMin = 60;
    var baseTime = Date.now();

    var isInit = false;
    var shouldRealityCheck = function() {
        return page.user.loginid_array.some(function (acc) {
            return acc.id.slice(0, 1) === 'M';
        });
    };

    function currentFrequencyInMS() {
        if (!LocalStore.get('reality_check.interval')) {
            LocalStore.set('reality_check.interval', defaultFrequencyInMin * 60 * 1000);
            return defaultFrequencyInMin * 60 * 1000;
        }
        return LocalStore.get('reality_check.interval');
    }

    function currentTimeInMS() {
        return Date.now();
    }

    function updateFrequency(min) {
        var ms = min * 60 * 1000;
        LocalStore.set('reality_check.interval', ms);
    }

    function displayPopUp(div) {
        if ($('#reality-check').length > 0) {
            return;
        }
        var lightboxDiv = $("<div id='reality-check' class='lightbox'></div>");

        var wrapper = $('<div></div>');
        wrapper = wrapper.append(div);
        wrapper = $('<div></div>').append(wrapper);
        wrapper.appendTo(lightboxDiv);
        lightboxDiv.appendTo('body');

        var inputBox = lightboxDiv.find('#realityDuration');
        inputBox.val(currentFrequencyInMS() / 60 / 1000);
        inputBox.change(function(e) {
            updateFrequency(e.target.value);
        });

        lightboxDiv.find('#continue').click(closePopUp);
        lightboxDiv.find('#btn_logout').click(function(){
            BinarySocket.send({"logout": "1"});
        });
    }

    function closePopUp() {
        $('#reality-check').remove();
    }

    function popUpFrequency() {
        if(!shouldRealityCheck()) {
            return;
        }

        // show pop up to get user approval
        $.ajax({
            url: reality_freq_url,
            dataType: 'html',
            success: function(realityFreqText) {
                displayPopUp($(realityFreqText));
            },
            error: function (xhr) {
                if (xhr.status === 404) return;
            }
        });
    }

    function popUpRealityCheck() {
        $.ajax({
            url: reality_check_url,
            dataType: 'html',
            success: function(realityCheckText) {
                var realityCheckDiv = $(realityCheckText);
                var loginDate = new Date(realityCheckDiv.find('#login-time > p').text());

                // should update session duration too

                displayPopUp(realityCheckDiv);
            },
            error: function (xhr) {
                if (xhr.status === 404) return;
            }
        });
    }

    function popUpWhenIntervalHit() {
        window.setInterval(function() {
            if ((currentTimeInMS() - baseTime) >= currentFrequencyInMS() && shouldRealityCheck()) {
                baseTime = Date.now();
                popUpRealityCheck();
            }
        }, 10000);
    }

    function init() {
        // prevent accident reinitialization
        if (isInit) {
            return;
        }

        isInit = true;
        popUpFrequency();
        popUpWhenIntervalHit();
    }

    return {
        init: init
    };
}());

pjax_config_page(/user\/my_accountws\?loginid=/, function() {
    return {
        onLoad: function() {
            RealityCheck.init();
        }
    };
});
