
$.on('gameWispBenefits', function(event) {

        var username = event.getUsername().toLowerCase(),
            resolvename = $.username.resolve(username),
            tier = parseInt(event.getTier());
            $.say($.lang.get("net.quorrabot.gamewisphandler.benefits", resolvename, tier));
});

$.on('gameWispSubscribe', function(event) {
        var username = event.getUsername().toLowerCase(),
            resolvename = $.username.resolve(username),
            tier = parseInt(event.getTier());

        if (!$.inidb.exists('subscribed', username)) {
            $.inidb.set('subscribed', username, '1');
        }
        
        if ($.SubscribeHandler.SubReward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            $.inidb.incr('points', username, $.SubscribeHandler.SubReward);
        }
        
        $.say($.lang.get("net.quorrabot.gamewisphandler.subscribe", resolvename, tier));
});


$.on('gameWispAnniversary', function(event) {
        var username = event.getUsername().toLowerCase(),
            resolvename = $.username.resolve(username),
            months = parseInt(event.getMonths()),
            tier = parseInt(event.getTier());
        if (!$.inidb.exists('subscribed', username)) {
            $.inidb.set('subscribed', username, '1');
        }
        
        if ($.SubscribeHandler.SubReward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            $.inidb.incr('points', username, $.SubscribeHandler.SubReward);
        }
        $.say($.lang.get("net.quorrabot.gamewisphandler.anniversary", resolvename, tier, months.toString()));
});
