$.SubscribeHanlder = {
    SubMessage: ($.inidb.get('settings', 'subscribemessage') ? $.inidb.get('settings', 'subscribemessage') : '(name) just subscribed!'),
    ReSubMessage: ($.inidb.get('settings', 'resubscribemessage') ? $.inidb.get('settings', 'resubscribemessage') : '(name) just subscribed for (months) months in a row!'),
    SubWelcomeToggle: ($.inidb.get('settings', 'subscriberwelcometoggle') ? $.inidb.get('settings', 'subscriberwelcometoggle') : false),
    ReSubWelcomeToggle: ($.inidb.get('settings', 'resubscriberwelcometoggle') ? $.inidb.get('settings', 'resubscriberwelcometoggle') : false),
    SubReward: (parseInt($.inidb.get('settings', 'subscriberreward')) ? parseInt($.inidb.get('settings', 'subscriberreward')) : 0),
    AutoSubModeTimer: (parseInt($.inidb.get('settings', 'submodeautotimer')) ? parseInt($.inidb.get('settings', 'submodeautotimer')) : 0),
}

$.on('twitchSubscribesInitialized', function (event) {
    $.println(">>Enabling new subscriber announcements");
});

$.on('twitchSubscribe', function (event) {
    var subscriber = event.getSubscriber();

    if (!$.inidb.exists('subscribed', subscriber)) {
        $.inidb.set('subscribed', subscriber, '1');
    } else if ($.SubscribeHanlder.SubReward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
        $.inidb.incr('points', subscriber, $.SubscribeHanlder.SubReward);
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

    if (command.equalsIgnoreCase('subwelcometoggle')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }
        if ($.SubscribeHanlder.SubWelcomeToggle) {
            $.inidb.set('settings', 'subscriberwelcometoggle', false);
            $.SubscribeHanlder.SubWelcomeToggle = false;
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.new-sub-toggle-off"));
            return;
        } else {
            $.inidb.set('settings', 'subscriberwelcometoggle', true);
            $.SubscribeHanlder.SubWelcomeToggle = true;
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.new-sub-toggle-on"));
            return;
        }
    } else if (command.equalsIgnoreCase('resubwelcometoggle')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }
        if ($.SubscribeHanlder.SubWelcomeToggle) {
            $.inidb.set('settings', 'resubscriberwelcometoggle', false);
            $.SubscribeHanlder.SubWelcomeToggle = false;
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.resub-toggle-off"));
            return;
        } else {
            $.inidb.set('settings', 'resubscriberwelcometoggle', true);
            $.SubscribeHanlder.SubWelcomeToggle = true;
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.resub-toggle-on"));
            return;
        }
    } else if (command.equalsIgnoreCase('submessage')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.sub-msg-usage"));
            return;
        }
        $.inidb.set('settings', 'subscribemessage', argsString);
        $.SubscribeHanlder.SubMessage = argsString;
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.sub-msg-set"));
        return;
    } else if (command.equalsIgnoreCase('resubmessage')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.resub-msg-usage"));
            return;
        } 
        $.inidb.set('settings', 'resubscribemessage', argsString);
        $.SubscribeHanlder.ReSubMessage = argsString;
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.resub-msg-set"));
        return;
    } else if (command.equalsIgnoreCase('subscribereward')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.reward-usage"));
            return;
        }
        $.inidb.set('settings', 'subscriberreward', parseInt(args[0]));
        $.SubscribeHanlder.SubReward = parseInt(args[0]);
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.reward-set"));
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
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.sub-count", subs));
        return;
    } else if (command.equalsIgnoreCase('autosubmodetimer')) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.auto-submode-timer-usage"));
            return;
        } else if (args[0] == 0) {
            $.timer.clearTimer("./handlers/subscribeHandler.js", "AutoSubModeTimer", true);
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.auto-submode-timer-off"));
            return;
        } else if (args[0] < 30) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.auto-submode-timer-404"));
            return;
        }
        $.inidb.set('settings', 'submodeautotimer', parseInt(args[0]));
        $.SubscribeHanlder.AutoSubModeTimer = parseInt(args[0]);
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.subscribeHandler.auto-sub-mode-imterval-set"));
        if ($.SubscribeHanlder.AutoSubModeTimer > 0) {
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
            }, $.SubscribeHanlder.AutoSubModeTimer * 60 * 1000);
        } else {
            $.timer.clearTimer("./handlers/subscribeHandler.js", "AutoSubModeTimer", true);
        }
    }
});

$.on('ircPrivateMessage', function (event) {
    var sender = event.getSender();
    var message = event.getMessage();
    var s = $.SubscribeHanlder.SubMessage;
    var r = $.SubscribeHanlder.ReSubMessage;

    if (message.contains('just subscribed!') && sender.equalsIgnoreCase('twitchnotify')) {
        if ($.SubscribeHanlder.SubWelcomeToggle) {
            var sub = message.substring(0, message.indexOf(" ", 1)).toString();
            s = $.replaceAll(s, '(name)', sub);
            $.say(s);
            return;
        }
    } else if (message.contains('months in a row!') && sender.equalsIgnoreCase('twitchnotify')) {
        if ($.SubscribeHanlder.ReSubWelcomeToggle) {
            var months = message.substring(message.substring(0, message.indexOf(" ", 1)).toString().length() + 20, message.indexOf("months", 1)).toString();
            var sub = message.substring(0, message.indexOf(" ", 1)).toString();
            r = $.replaceAll(r, '(name)', sub);
            r = $.replaceAll(r, '(months)', months);
            r = $.replaceAll(r, '(reward)', $.SubscribeHanlder.SubReward); 
            $.say(r);
            return;
        }
    }
});

setTimeout(function () { 
    if ($.moduleEnabled('./handlers/subscribeHandler.js')) {
        $.registerChatCommand("./handlers/subscribeHandler.js", "subwelcometoggle", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "resubwelcometoggle", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "subscribereward", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "subscribecount", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "submessage", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "resubmessage", "admin");
        $.registerChatCommand("./handlers/subscribeHandler.js", "autosubmodetimer", "admin");
    }
}, 10 * 1000);

var keys = $.inidb.GetKeyList('subscribed', '');
for (var i = 0; i < keys.length; i++) {
    if ($.inidb.get('subscribed', keys[i]).equalsIgnoreCase('1')) {
        Packages.me.mast3rplan.phantombot.cache.SubscribersCache.instance($.channelName).addSubscriber(keys[i]);
    }
}
