$.isGameWispSub = function (user) {
    var username = user.toLowerCase();
    if($.inidb.exists('gwsubslist', username)==true) {
        if(parseInt($.inidb.get('gwsubslist', username))>0) {
            return true;
        }
    }
    return false;
};

$.on('gameWispBenefits', function(event) {

        var username = event.getUsername().toLowerCase(),
            resolvename = $.username.resolve(username),
            tier = parseInt(event.getTier());
            $.say($.lang.get("net.quorrabot.gamewisphandler.benefits", resolvename, tier));
});

$.on('gameWispSubscribe', function(event) {
        var username = event.getUsername().toLowerCase(),
            resolvename = $.username.resolve(username),
            months = 0,
            gwmonths = 0,
            tier = parseInt(event.getTier());

            $.inidb.set('gwsubslist', username, '1');
        
        //log gw subs count
        if(!$.inidb.exists("gwsubscount",username)) {
            $.inidb.set("gwsubscount",username, '1');
        } else {
            var gwsubcount = parseInt($.inidb.get("gwsubscount", username));
            gwmonths += gwsubcount;
            $.inidb.set("gwsubscount",username, gwmonths);
        }
        
        if(!$.inidb.exists("subscount",username)) {
            $.inidb.set("subscount",username, '1');
        } else {
            var subcount = parseInt($.inidb.get("subscount", username));
            months += subcount;
            $.inidb.set("subscount",username, months);
        }

        if ($.SubscribeHandler.SubReward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            $.inidb.incr('points', username, $.SubscribeHandler.SubReward);
        }
        
        $.say($.lang.get("net.quorrabot.gamewisphandler.subscribe", resolvename, tier, months.toString()));
});

$.on('gameWispChange', function(event) {
        var username = event.getUsername().toLowerCase();
        $.inidb.set('gwsubslist', username, '0');
        //say nothing, this simply removes someone as a sub if they unsubscribe
});


$.on('gameWispAnniversary', function(event) {
        var username = event.getUsername().toLowerCase(),
            resolvename = $.username.resolve(username),
            gwmonths = 0,
            months = parseInt(event.getMonths()),
            tier = parseInt(event.getTier());
        
        $.inidb.set('gwsubslist', username, '1');
        
        //log gw subs count
        if(!$.inidb.exists("gwsubscount",username)) {
            $.inidb.set("gwsubscount",username, '1');
        } else {
            var gwsubcount = parseInt($.inidb.get("gwsubscount", username));
            gwmonths += gwsubcount;
            $.inidb.set("gwsubscount",username, gwmonths);
        }
        
        if(!$.inidb.exists("subscount",username)) {
            $.inidb.set("subscount",username, '1');
        } else {
            var subcount = parseInt($.inidb.get("subscount", username));
            months += subcount;
            $.inidb.set("subscount",username, months);
        }
        
        if ($.SubscribeHandler.SubReward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            $.inidb.incr('points', username, $.SubscribeHandler.SubReward);
        }
        $.say($.lang.get("net.quorrabot.gamewisphandler.anniversary", resolvename, tier, months.toString()));
});
