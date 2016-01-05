$.FollowHandler = {
    FollowMessage: ($.inidb.get('settings', 'followmessage') ? $.inidb.get('settings', 'followmessage') : '(name) just followed!'),
    FollowToggle: ($.inidb.get('settings', 'announcefollows') ? $.inidb.get('settings', 'announcefollows') : "false"),
    FollowReward: (parseInt($.inidb.get('settings', 'followreward')) ? parseInt($.inidb.get('settings', 'followreward')) : 100),
    AnnounceFollowsAllowed: false,
    FollowTrain: 0,
    LastFollow: 0,
}

$.getFollowAge = function (user, channel) {
    var follow = $.twitch.GetUserFollowsChannel(user, channel);
    var Followed_At = follow.getString('created_at');
    var FAT = new Date(Followed_At).getTime();

    var followage = "";
    
    function dateDiff (timestamp) {
        var d = Math.abs(timestamp - new Date().getTime()) / 1000;
        var v = '';
        var r = {}; 
        var s = {
            year: 31536000,
            month: 2592000,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };

        Object.keys(s).forEach(function(key){
            v = Math.floor(d / s[key]);
            if (v > 0) {
                followage = followage + v + " " + key + (v > 1 ? "s":"") + ", ";
                r[key] = Math.floor(d / s[key]);
                d -= r[key] * s[key];
            }
        });
        return followage.slice(0, -2);
    };
    return dateDiff(FAT);
};

$.getUserFollowed = function (user, channel) {
    var follows = $.twitch.GetUserFollowsChannel(user, channel);

    if (follows.getInt('_http') != 200) {
        $.say($.lang.get("net.phantombot.followHandler.is-not-following", user, channel));
        return;
    } else {
       $.say($.lang.get("net.phantombot.followHandler.is-following", user, channel)); 
       return;
    }
};

$.on('twitchFollowsInitialized', function (event) {
    if (!$.FollowHandler.AnnounceFollowsAllowed) {
        $.println(">>Enabling new follower announcements");
        $.FollowHandler.AnnounceFollowsAllowed = true;
    }
});

$.on('twitchFollow', function (event) {
    var follower = event.getFollower();
    var s = $.FollowHandler.FollowMessage;
    var r = $.FollowHandler.FollowReward;
    var username = $.username.resolve(follower);

    if (!$.inidb.exists('followed', follower)) {
        $.inidb.set('followed', follower, 1);
        $.FollowHandler.FollowTrain++;
        $.FollowHandler.LastFollow = System.currentTimeMillis();
        $.writeToFile(username + " ", "./addons/latestfollower.txt", false);

        if (r > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            $.inidb.incr('points', follower, r);
            s += " +" + $.getPointsString(r);
        } 
        if ($.FollowHandler.FollowToggle=="true" && $.FollowHandler.AnnounceFollowsAllowed && $.moduleEnabled("./handlers/followHandler.js")) {
            s = $.replaceAll(s, '(name)', username);
            $.say("/me " + s);
            if (!$.timer.hasTimer("./handlers/followHandler.js", "followtrain", true)) {
                $.timer.addTimer("./handlers/followHandler.js", "followtrain", true, function () {
                    $.checkFollowTrain();
                }, 1000);
            } 
        }
    }  
});

$.on('twitchUnfollow', function (event) {
    var follower = event.getFollower();

    if ($.inidb.exists('followed', follower) && $.inidb.get('followed', follower).equalsIgnoreCase(1)) {
        $.inidb.set('followed', follower, 0);
    }
});

$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();

    if (command.equalsIgnoreCase('followmessage')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.follows-message-usage"));
            return;
        }
        $.inidb.set('settings', 'followmessage', argsString);
        $.FollowHandler.FollowMessage = argsString;
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.follow-message-set"));
        return;
    } else if (command.equalsIgnoreCase('followreward')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.follows-reward-usage"));
            return;
        }
        $.inidb.set('settings', 'followreward', parseInt(args[0]));
        $.FollowHandler.FollowReward = parseInt(args[0]);
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.follow-reward-set"));
        return;
    } else if (command.equalsIgnoreCase('followannounce')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }
        if ($.FollowHandler.FollowToggle=="true") {
            $.inidb.set('settings', 'announcefollows', false);
            $.FollowHandler.FollowToggle = "false";
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.follows-toggle-off"));
            return;
        } else {
            $.inidb.set('settings', 'announcefollows', true);
            $.FollowHandler.FollowToggle = "true";
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.follows-toggle-on"));
        }
    } else if (command.equalsIgnoreCase('followed')) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.followed-usage"));
            return;
        }
        var channel = $.channelName;
        if (args.length > 1) {
            channel = $.username.resolve(args[1]);
        }
        $.getUserFollowed($.username.resolve(args[0]), channel);
        return;
    } else if (command.equalsIgnoreCase('follow')) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.shoutout-usage"));
            return;
        }
        var caster = $.username.resolve(args[0]);

        if ($.isOnline(caster)) {
            $.say($.lang.get("net.phantombot.followHandler.shoutout-online", caster, $.getGame(caster)));
            return;
        } else {
            $.say($.lang.get("net.phantombot.followHandler.shoutout-offline", caster, $.getGame(caster)));
            return;
        }
    } else if (command.equalsIgnoreCase('followage')) {
        var user = $.username.resolve(sender);
        var channel = $.channelName;

        if (args.length > 0) {
            user = args[0];
        } 
        if (args.length > 1) {
            channel = args[1];
        }
        var follows = $.twitch.GetUserFollowsChannel(user, channel);
        if (follows.getInt('_http') == 200) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.followage-is-follwing", user, channel, $.getFollowAge(user, channel)));
            return;
        } else {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.followHandler.followage-is-not-following", user, channel));
            return
        }
    }
});

$.checkFollowTrain = function () {
    if (System.currentTimeMillis() - $.FollowHandler.LastFollow > 65 * 1000) {
        $.timer.clearTimer("./handlers/followHandler.js", "followtrain", true);
        if ($.FollowHandler.FollowTrain > 1) {
            if ($.FollowHandler.FollowTrain == 3) {
                $.say($.lang.get("net.phantombot.followHandler.triple-follow-train"));
            } else if ($.FollowHandler.FollowTrain == 4) {
                $.say($.lang.get("net.phantombot.followHandler.Quadra-follow-train"));
            } else if ($.FollowHandler.FollowTrain == 5) {
                $.say($.lang.get("net.phantombot.followHandler.penta-follow-train"));
            } else if ($.FollowHandler.FollowTrain > 5 && $.FollowHandler.FollowTrain <= 10) {
                $.say($.lang.get("net.phantombot.followHandler.mega-follow-train", $.FollowHandler.FollowTrain));
            } else if ($.FollowHandler.FollowTrain > 10 && $.FollowHandler.FollowTrain <= 20) {
                $.say($.lang.get("net.phantombot.followHandler.ultra-follow-train", $.FollowHandler.FollowTrain));
            } else if ($.FollowHandler.FollowTrain > 20) {
                $.say($.lang.get("net.phantombot.followHandler.massive-follow-train", $.FollowHandler.FollowTrain));
            }
        }
        $.FollowHandler.FollowTrain = 0;
    }
};

var keys = $.inidb.GetKeyList('followed', '');
for (var i = 0; i < keys.length; i++) {
    if ($.inidb.get('followed', keys[i]) == 1) {
        Packages.me.mast3rplan.phantombot.cache.FollowersCache.instance($.channelName).addFollower(keys[i]);
    }
}

setTimeout(function () {
    if ($.moduleEnabled('./handlers/followHandler.js')) {
        $.registerChatCommand("./handlers/followHandler.js", "followed", "mod");
        $.registerChatCommand("./handlers/followHandler.js", "follow", "mod");
        $.registerChatCommand("./handlers/followHandler.js", "followannounce", "admin");
        $.registerChatCommand("./handlers/followHandler.js", "followmessage", "admin");
        $.registerChatCommand("./handlers/followHandler.js", "followreward", "admin");
        $.registerChatCommand("./handlers/followHandler.js", "followage");
    }
}, 10 * 1000);
