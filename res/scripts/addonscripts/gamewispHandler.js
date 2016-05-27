
    /**
     * @event gameWispChange
     */
    $.on('gameWispChange', function(event) {

        var username = event.getUsername().toLowerCase(),
            userstatus = event.getStatus();

        if (userstatus.equals('inactive')) {
            if ($.inidb.exists('subscribed', username)) {
                $.inidb.del('subscribed', username);
            }
        }
    });

    /**
     * @event gameWispBenefits
     */
    $.on('gameWispBenefits', function(event) {

        var username = event.getUsername().toLowerCase(),
            resolvename = $.username.resolve(username),
            tier = parseInt(event.getTier());

        //if (tier > $.getGWTier(username)) {
            //$.addGWSubUsersList(username, tier);
            //if (subShowMessages) {
                $.say("/me " + resolvename + " has just subscribed to " + tier + " via GameWisp2!");
            //}
        //}
    });

    /**
     * @event gameWispSubscribe
     */
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

        //if (subShowMessages) {
            //$.say(subMessage.replace('(name)', resolvename).replace('(tier)', tier.toString()).replace('(reward)', userreward.toString()));
            $.say("/me " + resolvename + " has just *subscribed* to Tier " + tier + " via GameWisp!");
        //}
    });

    /**
     * @event gameWispAnniversary
     */
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
        //if (subShowMessages) {
            //$.inidb.incr('points', username, parseInt(userreward));
            //$.say(reSubMessage.replace('(name)', resolvename).replace('(tier)', tier.toString()).replace('(reward)', userreward.toString()).replace('(months)', months.toString()));
            $.say("/me " + resolvename + " has just **resubscribed** to Tier " + tier + " via GameWisp! They have been subscribed for " + months.toString() + " months in total!");
        //}
    });
