$.SubscribeHandler = {
    SubMessage: ($.inidb.get('settings', 'subscribemessage') ? $.inidb.get('settings', 'subscribemessage') : '(name) just subscribed! Their all time sub count is (months) months!'),
    ReSubMessage: ($.inidb.get('settings', 'resubscribemessage') ? $.inidb.get('settings', 'resubscribemessage') : '(name) just resubscribed! Their all time sub count is (months) months!'),
    SubWelcomeToggle: ($.inidb.get('settings', 'sub_announce') ? $.inidb.get('settings', 'sub_announce') : "true"),
    SubReward: (parseInt($.inidb.get('settings', 'subscribereward')) ? parseInt($.inidb.get('settings', 'subscribereward')) : 0),
    AutoSubModeTimer: (parseInt($.inidb.get('settings', 'submodeautotimer')) ? parseInt($.inidb.get('settings', 'submodeautotimer')) : 0),
}

$.on('twitchSubscribesInitialized', function (event) {
    $.println(">>Enabling new subscriber announcements");
});

$.on('twitchSubscribe', function (event) {
    var subscriber = event.getSubscriber();

    if (!$.inidb.exists('subscribed', subscriber)) {
        $.inidb.set('subscribed', subscriber, '1');
    }
    if ($.SubscribeHandler.SubReward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
        $.inidb.incr('points', subscriber, $.SubscribeHandler.SubReward);
    }
});

$.on('twitchUnsubscribe', function (event) {
    var subscriber = event.getSubscriber();

    if ($.inidb.exists('subscribed', subscriber)) {
        $.inidb.del('subscribed', subscriber);
    }
});

$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();

    if (command.equalsIgnoreCase('subannounce')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }
        if ($.SubscribeHandler.SubWelcomeToggle=="true") {
            $.inidb.set('settings', 'sub_announce', "false");
            $.SubscribeHandler.SubWelcomeToggle = "false" ;
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.sub-toggle-off"));
            return;
        } else {
            $.inidb.set('settings', 'sub_announce', "true");
            $.SubscribeHandler.SubWelcomeToggle = "true";
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.sub-toggle-on"));
            return;
        }

    } else if (command.equalsIgnoreCase('submessage')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.sub-msg-usage"));
            return;
        }
        $.inidb.set('settings', 'subscribemessage', argsString);
        $.SubscribeHandler.SubMessage = argsString;
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.sub-msg-set"));
        return;
    } else if (command.equalsIgnoreCase('resubmessage')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.resub-msg-usage"));
            return;
        } 
        $.inidb.set('settings', 'resubscribemessage', argsString);
        $.SubscribeHandler.ReSubMessage = argsString;
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.resub-msg-set"));
        return;
    } else if (command.equalsIgnoreCase('subscribereward')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.reward-usage"));
            return;
        }
        $.inidb.set('settings', 'subscriberreward', parseInt(args[0]));
        $.SubscribeHandler.SubReward = parseInt(args[0]);
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.reward-set"));
        return;
    } else if (command.equalsIgnoreCase('subscribercount')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }
        var keys = $.inidb.GetKeyList('subscribed', '');
        var subs = 0;
        for (var i = 0; i < keys.length; i++) {
            subs++;
        }
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.sub-count", subs));
        return;
    } else if (command.equalsIgnoreCase('autosubmodetimer')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.auto-submode-timer-usage"));
            return;
        } else if (args[0] == 0) {
            $.timer.clearTimer("./handlers/subscribeHandler.js", "AutoSubModeTimer", true);
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.auto-submode-timer-off"));
            return;
        } else if (args[0] < 30) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.auto-submode-timer-404"));
            return;
        }
        $.inidb.set('settings', 'submodeautotimer', parseInt(args[0]));
        $.SubscribeHandler.AutoSubModeTimer = parseInt(args[0]);
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.subscribeHandler.auto-sub-mode-imterval-set"));
        if ($.SubscribeHandler.AutoSubModeTimer > 0) {
            $.submode = true;
            $.timer.addTimer("./handlers/subscribeHandler.js", "AutoSubModeTimer", true, function () {
                if ($.isOnline($.channelName)) {
                    if ($.submode == true) {
                        $.say('.subscribers');
                        $.submode = false;
                    } else {
                        $.say('.subscribersoff');
                        $.submode = true;
                    }
                }
            }, $.SubscribeHandler.AutoSubModeTimer * 60 * 1000);
        } else {
            $.timer.clearTimer("./handlers/subscribeHandler.js", "AutoSubModeTimer", true);
        }
    }
});

$.on('ircPrivateMessage', function (event) {
    var sender = event.getSender();
    var message = event.getMessage();
    var s = $.SubscribeHandler.SubMessage;
    var r = $.SubscribeHandler.ReSubMessage;

    if (message.contains('just subscribed') && sender.equalsIgnoreCase('twitchnotify')) {
        if ($.SubscribeHandler.SubWelcomeToggle=="true") {
            $.println(message);
            $.logEvent(message);
            var sub = message.substring(0, message.indexOf(" ", 1)).toString();
            var months = 0;
            var twmonths = 0;
            
            s = $.replaceAll(s, '(name)', sub);
            
            $.inidb.set('twitchsubslist', sub, '1');
        
            //log gw subs count
            if(!$.inidb.exists("twitchsubscount",sub)) {
                $.inidb.set("twitchsubscount",sub, '1');
            } else {
                var twsubcount = parseInt($.inidb.get("twitchsubscount", sub));
                twmonths += twsubcount;
                $.inidb.set("twitchsubscount",sub, twmonths);
            }
        
            if(!$.inidb.exists("subscount",sub)) {
                $.inidb.set("subscount",sub, '1');
            } else {
                var subcount = parseInt($.inidb.get("subscount", sub));
                months += subcount;
                $.inidb.set("subscount",sub, months);
            }
            
            s = $.replaceAll(r, '(months)', months);
            $.say("/me " + s);
            return;
        }
    } else if (message.contains('months in a row!') && sender.equalsIgnoreCase('twitchnotify')) {
        if ($.SubscribeHandler.SubWelcomeToggle=="true") {
            $.println(message);
            $.logEvent(message);
            var months = message.substring( message.indexOf("months") - 3, message.indexOf("months") - 1 ).toString();
            var sub = message.substring(0, message.indexOf(" ", 1)).toString();
            var twmonths = 0;

            $.inidb.set('twitchsubslist', sub, '1');
        
            //log gw subs count
            if(!$.inidb.exists("twitchsubscount",sub)) {
                $.inidb.set("twitchsubscount",sub, '1');
            } else {
                var twsubcount = parseInt($.inidb.get("twitchsubscount", sub));
                twmonths += twsubcount;
                $.inidb.set("twitchsubscount",sub, twmonths);
            }
        
            if(!$.inidb.exists("subscount",sub)) {
                $.inidb.set("subscount",sub, '1');
            } else {
                var subcount = parseInt($.inidb.get("subscount", sub));
                months += subcount;
                $.inidb.set("subscount",sub, months);
            }
            
            
            r = $.replaceAll(r, '(name)', sub);
            r = $.replaceAll(r, '(months)', months);
            r = $.replaceAll(r, '(reward)', $.SubscribeHandler.SubReward); 
            
            $.say("/me " + r);
            return;
        }
    }
});

setTimeout(function () { 
    if ($.moduleEnabled('./handlers/subscribeHandler.js')) {
        $.registerChatCommand("./handlers/subscribeHandler.js", "subannounce", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "subscribereward", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "subscribecount", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "submessage", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "resubmessage", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "autosubmodetimer", "admin");
    }
}, 10 * 1000);

var keys = $.inidb.GetKeyList('subscribed', '');
var kl = 0;
if(keys!=null || keys!="" || keys!=undefined) {
    while(kl < keys.length) {
        if ($.inidb.get('subscribed', keys[i])!=null) {
            if ($.inidb.get('subscribed', keys[i]).equalsIgnoreCase('1')) {
                Packages.me.gloriouseggroll.quorrabot.cache.SubscribersCache.instance($.channelName).addSubscriber(keys[i]);
            }
        }
        kl++;
    }	
}

