$.HostHandler = {
    HostList: new Array(),
    HostReward: (parseInt($.inidb.get('settings', 'hostreward')) ? parseInt($.inidb.get('settings', 'hostreward')) : 0),
    HostTimeout: (parseInt($.inidb.get('settings', 'hosttimeout')) ? parseInt($.inidb.get('settings', 'hosttimeout')) : 60),
    HostTriggerAmount: (parseInt($.inidb.get('settings', 'hosttriggeramount')) ? parseInt($.inidb.get('settings', 'hosttriggeramount')) : 0),
    HostMessage: ($.inidb.get('settings', 'hostmessage') ? $.inidb.get('settings', 'hostmessage') : '(name) just hosted!'),
}

$.isHostUser = function (user) {
    return $.array.contains($.HostHandler.HostList, user.toLowerCase());
}

$.on('twitchHostsInitialized', function (event) {
    $.println(">>Enabling new hoster announcements");
});

$.on('twitchHosted', function (event) {
    var hoster = event.getHoster();
    var s = $.HostHandler.HostMessage;

    if ($.moduleEnabled("./handlers/hostHandler.js") && !$.HostHandler.HostList[hoster]) {
        if ($.HostHandler.HostTriggerAmount >= $.getViewers(hoster)) {
            if ($.HostHandler.HostReward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
                $.inidb.incr('points', hoster, $.HostHandler.HostReward);
            }
            s = $.replaceAll(s, '(name)', hoster);
            s = $.replaceAll(s, '(reward)', $.HostHandler.HostReward);
            $.say(s);
            $.HostHandler.HostList.push(hoster, System.currentTimeMillis() + ($.HostHandler.HostTimeout * 60 * 1000));
            return;
        }
    }
});

$.on('twitchUnhosted', function (event) {
    var hoster = event.getHoster();

    $.HostHandler.HostList[hoster] = System.currentTimeMillis() + $.HostHandler.HostTimeout;

    for (var i = 0; i < $.HostHandler.HostList.length; i++) {
        if ($.HostHandler.HostList[i].equalsIgnoreCase(hoster)) {
            $.HostHandler.HostList.splice(i, 1);
            break;
        }
    }
});

$.on('command', function (event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();

    if (command.equalsIgnoreCase("hostreward")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }

        if ($.strlen(argsString) == 0) {
            if ($.inidb.exists('settings', 'hostreward')) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-reward-current-and-usage", $.getPointsString($.HostHandler.HostReward)));
                return;
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-reward-current-and-usage", $.getPointsString($.HostHandler.HostReward)));
                return;
            }
        } else {
            if (!parseInt(argsString) < 0) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-reward-error"));
                return;
            }

            $.logEvent("hostHandler.js", 134, username + " changed the host points reward to: " + argsString);

            $.inidb.set('settings', 'hostreward', argsString);
            $.HostHandler.HostReward = parseInt(argsString);
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-reward-set-success"));
            return;
        }
    }

    if (command.equalsIgnoreCase("hosttriggeramount")) {
        if (!$.isAdmin(sender)) {       
            $.say($.getWhisperString(sender) + $.adminmsg);     
            return;     
        } else if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-trigger-usage"));
            return;
        }
        $.inidb.set('settings', 'hosttriggeramount', parseInt(args[0]));
        $.HostHandler.HostTriggerAmount = parseInt(args[0]);
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-trigger-set", parseInt(args[0])));
        return;
    }
    
    if (command.equalsIgnoreCase("hostmessage")) {      
        if (!$.isAdmin(sender)) {       
            $.say($.getWhisperString(sender) + $.adminmsg);     
            return;     
        }       
                
        if ($.strlen(argsString) == 0) {      
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.current-host-message", $.HostHandler.HostMessage));       
        
            var s = $.lang.get("net.phantombot.hosthandler.host-message-usage");        
        
            $.say($.getWhisperString(sender) + s);      
            return;
        } else {        
            $.logEvent("hostHandler.js", 73, username + " changed the new hoster message to: " + argsString);       
            $.inidb.set('settings', 'hostmessage', argsString);
            $.HostHandler.HostMessage = $.inidb.get('settings', 'hostmessage');
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-message-set-success"));      
            return;     
        }       
    }

    if (command.equalsIgnoreCase("hostcount")) {
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-count", $.HostHandler.HostList.length));
        return;
    }

    if (command.equalsIgnoreCase("hosttime")) {
        if (args.length < 1) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-timeout-time", $.HostHandler.HostTimeout));
            return;
        } else if (args.length >= 1) {
            if (!$.isAdmin(sender)) {
                $.say($.getWhisperString(sender) + $.adminmsg);
                return;
            }
            if (parseInt(args[0]) < 30) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-timeout-time-error"));
                return;
            } else {
                $.inidb.set('settings', 'hosttimeout', parseInt(args[0]));
                $.HostHandler.HostTimeout = parseInt(args[0]);
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-timeout-time-set", parseInt(args[0])));
                return;
            }
        }
    }

    if (command.equalsIgnoreCase("hostlist")) {
        var m = "";

        for (var b = 0; b < Math.ceil($.HostHandler.HostList.length / 30); b++) {
            m = "";

            for (var i = (b * 30); i < Math.min($.HostHandler.HostList.length, ((b + 1) * 30)); i++) {
                if ($.strlen(m) > 0) {
                    m += ", ";
                }

                m += $.HostHandler.HostList[i];
            }

            if (b == 0) {
                $.say($.lang.get("net.phantombot.hosthandler.host-list", $.HostHandler.HostList.length, m));
                return;
            } else {
                $.say(">>" + m);
                return;
            }
        }

        if ($.HostHandler.HostList.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.hosthandler.host-list-error"));
            return;
        }
    }
});

setTimeout(function () {
    if ($.moduleEnabled('./handlers/hostHandler.js')) {
        $.registerChatCommand("./handlers/hostHandler.js", "hostmessage", "admin");
        $.registerChatCommand("./handlers/hostHandler.js", "hostreward", "admin");
        $.registerChatCommand("./handlers/hostHandler.js", "hosttime", "admin");
        $.registerChatCommand("./handlers/hostHandler.js", "hostcount");
        $.registerChatCommand("./handlers/hostHandler.js", "hostlist");
    }
}, 10 * 1000);
