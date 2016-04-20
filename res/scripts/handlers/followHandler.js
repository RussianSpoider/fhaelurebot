$.FollowHandler = {
    FollowMessage: ($.inidb.get('settings', 'followmessage') ? $.inidb.get('settings', 'followmessage') : $.lang.get("net.quorrabot.followHandler.follows-message")),
    FollowToggle: ($.inidb.get('settings', 'followannounce') ? $.inidb.get('settings', 'followannounce') : "true"),
    FollowTrainToggle: ($.inidb.get('settings', 'followtraintoggle') ? $.inidb.get('settings', 'followtraintoggle') : "true"),
    FollowReward: (parseInt($.inidb.get('settings', 'followreward')) ? parseInt($.inidb.get('settings', 'followreward')) : 100),
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
        $.say($.lang.get("net.quorrabot.followHandler.is-not-following", user, $.username.resolve(channel)));
        return;
    } else {
       $.say($.lang.get("net.quorrabot.followHandler.is-following", user, $.username.resolve(channel))); 
       return;
    }
};

$.on('twitchFollowsInitialized', function (event) {
        $.println(">>Enabling new follower announcements");
});

$.on('twitchFollow', function (event) {
    var follower = event.getFollower();
    var s = $.FollowHandler.FollowMessage;
    var r = $.FollowHandler.FollowReward;
    var username = $.username.resolve(follower);
    if ($.inidb.GetKeyList('followed', '').length == 0 && $.FollowHandler.FollowToggle == "true") {
       $.FollowHandler.FollowToggle = "false";
       var t = setTimeout(function () {
         $.FollowHandler.FollowToggle = "true";
         clearTimeout(t);
       }, 300 * 1000);
     }
    if (!$.inidb.exists('followed', follower)) {
        $.inidb.set('followed', follower, 1);
        $.FollowHandler.FollowTrain++;
        $.FollowHandler.LastFollow = System.currentTimeMillis();
        $.writeToFile(username + " ", "./addons/latestfollower.txt", false);

        if (r > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            $.inidb.incr('points', follower, r);
            s += " +" + $.getPointsString(r);
        } 
        if ($.FollowHandler.FollowToggle=="true" && $.moduleEnabled("./handlers/followHandler.js")) {
            s = $.replaceAll(s, '(name)', username);
            $.say("/me " + s);
            if($.FollowHandler.FollowTrainToggle=="true") {
                if (!$.timer.hasTimer("./handlers/followHandler.js", "followtrain", true)) {
                    $.timer.addTimer("./handlers/followHandler.js", "followtrain", true, function () {
                        $.checkFollowTrain();
                    }, 1000);
                }
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

            var msg = $.FollowHandler.FollowMessage;
            if ($.FollowHandler.FollowReward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
                msg += " +" + $.getPointsString($.FollowHandler.FollowReward);
            }
            $.say($.getWhisperString(sender) + msg);			
		
            var s = $.lang.get("net.quorrabot.followHandler.follows-message-usage");		
		
            $.say($.getWhisperString(sender) + s);		
            return;
            
        }
        $.inidb.set('settings', 'followmessage', argsString);
        $.FollowHandler.FollowMessage = argsString;
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.follow-message-set"));
        return;
    } else if (command.equalsIgnoreCase('followreward')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.follows-reward-usage"));
            return;
        }
        $.inidb.set('settings', 'followreward', parseInt(args[0]));
        $.FollowHandler.FollowReward = parseInt(args[0]);
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.follow-reward-set"));
        return;
    } else if (command.equalsIgnoreCase('followannounce')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }
        if ($.FollowHandler.FollowToggle=="true") {
            $.inidb.set('settings', 'followannounce', "false");
            $.FollowHandler.FollowToggle = "false";
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.follows-toggle-off"));
            return;
        } else {
            $.inidb.set('settings', 'followannounce', "true");
            $.FollowHandler.FollowToggle = "true";
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.follows-toggle-on"));
        }
    } else if (command.equalsIgnoreCase('followed')) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followed-usage"));
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
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.shoutout-usage"));
            return;
        }
        var caster = $.username.resolve(args[0]);
        
        if($.username.resolve(caster)) {
            if ($.isOnline(caster)) {
                $.say($.lang.get("net.quorrabot.followHandler.shoutout-online", caster, $.getGame(caster)));
                return;
            } else {
                $.say($.lang.get("net.quorrabot.followHandler.shoutout-offline", caster, $.getGame(caster)));
                return;
            }
        } else {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.shoutout-not-exist", caster));
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
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followage-is-following", user, channel, $.getFollowAge(user, channel)));
            return;
        } else {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followage-is-not-following", user, channel));
            return
        }
    } else if (command.equalsIgnoreCase('followtrain')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }
        if($.inidb.get("settings","followtraintoggle")=="true") {
            $.inidb.set("settings","followtraintoggle","false");
            $.FollowHandler.FollowTrainToggle=="false";
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followtrain-announce-false"));
            return;
        } else {
            $.inidb.set("settings","followtraintoggle","true");
            $.FollowHandler.FollowTrainToggle=="true";
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followtrain-announce-true"));
            return;
        }
    } else if (command.equalsIgnoreCase('followtrainmsg')) {
        var message = "";
        var trainString = "";
        if(args[0]!=null) {
            trainString = args[0];
        }
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }
        if (trainString.equalsIgnoreCase("default")) {
            for(var i=3;i<8;i++) {
                $.inidb.del("settings", "followtrain" + i.toString() + "msg");
            }
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followtrain-msgs-reset"));
            return;
        }
        if(args[0]==null | args[0]=="" | parseInt(args[0]) < 3 | parseInt(args[0]) > 8) {
           $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followtrain-wrong-count"));
           return;
        }
        if(args.length < 2) {
            if($.inidb.get("settings", "followtrain" + args[0] + "msg")!=null) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followtrain-currentmsg", args[0], $.inidb.get("settings", "followtrain" + args[0] + "msg")));
            }
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followtrain-usage"));
            return;
        }
        if (args.length > 2 && parseInt(trainString)) {
            message = argsString.substring(argsString.indexOf(args[0]) + $.strlen(args[0]) + 1);
            $.inidb.set("settings","followtrain" + args[0] + "msg", message);
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.followHandler.followtrain-message-set", args[0]));
            return;
        }
    }
    
});

$.checkFollowTrain = function () {
    $.ftmsg = "";
    if (System.currentTimeMillis() - $.FollowHandler.LastFollow > 65 * 1000) {
        $.timer.clearTimer("./handlers/followHandler.js", "followtrain", true);
        if ($.FollowHandler.FollowTrain > 1) {
            if ($.FollowHandler.FollowTrain == 3) {
                if($.inidb.get("settings","followtrain3msg")!="") {
                    $.ftmsg = $.inidb.get("settings","followtrain3msg");
                    if ($.ftmsg.contains('(followtraincount)')) {
                        $.ftmsg = $.replaceAll($.ftmsg, '(followtraincount)', $.FollowHandler.FollowTrain);
                    } 
                    $.say($.inidb.get("settings","followtrain3msg"));
                } else {
                    $.say($.lang.get("net.quorrabot.followHandler.triple-follow-train"));
                }
            } else if ($.FollowHandler.FollowTrain == 4) {
                if($.inidb.get("settings","followtrain4msg")!="") {
                    $.ftmsg = $.inidb.get("settings","followtrain4msg");
                    if ($.ftmsg.contains('(followtraincount)')) {
                        $.ftmsg = $.replaceAll($.ftmsg, '(followtraincount)', $.FollowHandler.FollowTrain);
                    } 
                    $.say($.inidb.get("settings","followtrain4msg"));
                } else {
                    $.say($.lang.get("net.quorrabot.followHandler.Quadra-follow-train"));
                }
            } else if ($.FollowHandler.FollowTrain == 5) {
                if($.inidb.get("settings","followtrain5msg")!="") {
                    $.ftmsg = $.inidb.get("settings","followtrain5msg");
                    if ($.ftmsg.contains('(followtraincount)')) {
                        $.ftmsg = $.replaceAll($.ftmsg, '(followtraincount)', $.FollowHandler.FollowTrain);
                    } 
                    $.say($.inidb.get("settings","followtrain5msg"));
                } else {
                    $.say($.lang.get("net.quorrabot.followHandler.penta-follow-train"));
                }
            } else if ($.FollowHandler.FollowTrain > 5 && $.FollowHandler.FollowTrain <= 10) {
                if($.inidb.get("settings","followtrain6msg")!="") {
                    $.ftmsg = $.inidb.get("settings","followtrain6msg");
                    if ($.ftmsg.contains('(followtraincount)')) {
                        $.ftmsg = $.replaceAll($.ftmsg, '(followtraincount)', $.FollowHandler.FollowTrain);
                    } 
                    $.say($.inidb.get("settings","followtrain6msg"));
                } else {
                    $.say($.lang.get("net.quorrabot.followHandler.mega-follow-train", $.FollowHandler.FollowTrain));
                }
            } else if ($.FollowHandler.FollowTrain > 10 && $.FollowHandler.FollowTrain <= 20) {
                if($.inidb.get("settings","followtrain7msg")!="") {
                    $.ftmsg = $.inidb.get("settings","followtrain7msg");
                    if ($.ftmsg.contains('(followtraincount)')) {
                        $.ftmsg = $.replaceAll($.ftmsg, '(followtraincount)', $.FollowHandler.FollowTrain);
                    } 
                    $.say($.inidb.get("settings","followtrain7msg"));
                } else {
                    $.say($.lang.get("net.quorrabot.followHandler.ultra-follow-train", $.FollowHandler.FollowTrain));
                }
            } else if ($.FollowHandler.FollowTrain > 20) {
                if($.inidb.get("settings","followtrain8msg")!="") {
                    $.ftmsg = $.inidb.get("settings","followtrain8msg");
                    if ($.ftmsg.contains('(followtraincount)')) {
                        $.ftmsg = $.replaceAll($.ftmsg, '(followtraincount)', $.FollowHandler.FollowTrain);
                    } 
                    $.say($.inidb.get("settings","followtrain8msg"));
                } else {
                    $.say($.lang.get("net.quorrabot.followHandler.massive-follow-train", $.FollowHandler.FollowTrain));
                }

            }
        }
        $.FollowHandler.FollowTrain = 0;
    }
};

var keys = $.inidb.GetKeyList('followed', '');
var kl = 0;
while(kl < keys.length) {
    if(keys[i]!=null || keys[i]!="") {
        if ($.inidb.get('followed', keys[i]).equalsIgnoreCase('1')) {
                Packages.me.gloriouseggroll.quorrabot.cache.FollowersCache.instance($.channelName).addFollower(keys[i]);
        }
    }
    kl++;
}

setTimeout(function () {
    if ($.moduleEnabled('./handlers/followHandler.js')) {
        $.registerChatCommand("./handlers/followHandler.js", "followed", "mod");
        $.registerChatCommand("./handlers/followHandler.js", "follow", "mod");
        $.registerChatCommand("./handlers/followHandler.js", "followannounce", "admin");
        $.registerChatCommand("./handlers/followHandler.js", "followmessage", "admin");
        $.registerChatCommand("./handlers/followHandler.js", "followtrain", "mod");
        $.registerChatCommand("./handlers/followHandler.js", "followtrainmsg", "admin");
        $.registerChatCommand("./handlers/followHandler.js", "followreward", "admin");
        $.registerChatCommand("./handlers/followHandler.js", "followage");
    }
}, 10 * 1000);
