$.HostHandler = {
    hostreward: ($.inidb.get('settings', 'hostreward') ? $.inidb.get('settings', 'hostreward') : 20),
    hosttimeout: ($.inidb.get('settings', 'hosttimeout') ? $.inidb.get('settings', 'hosttimeout') : 60 * 60 * 1000),
    hostMessage: ($.inidb.get('settings', 'hostmessage') ? $.inidb.get('settings', 'hostmessage') : $.lang.get("net.quorrabot.hosthandler.default-host-welcome-message")),
    announceHosts: (parseInt($.inidb.get('settings', 'announce_hosts')) ? parseInt($.inidb.get('settings', 'announce_hosts')) : "true"),
    hostlist: [],
    firstLaunch: true
};

$.isHostUser = function (user) {
    return $.array.contains($.HostHandler.hostlist, user.toLowerCase());
}

$.on('twitchHosted', function (event) {
    var username = $.username.resolve(event.getHoster().toString());
    var s = $.HostHandler.hostMessage;
    if ($.HostHandler.firstLaunch == true && $.HostHandler.announceHosts == "true") {
        $.HostHandler.announceHosts = "false";
        $.HostHandler.firstLaunch = false;

        setTimeout(function () {
            $.HostHandler.announceHosts = "true";
        }, 20000);
    }
    if ($.HostHandler.announceHosts == "true" && $.moduleEnabled("./handlers/hostHandler.js") && ($.HostHandler.hostlist[username.toLowerCase()] == null || $.HostHandler.hostlist[username.toLowerCase()] == undefined || $.HostHandler.hostlist[username.toLowerCase()] < System.currentTimeMillis())) {
        s = $.replaceAll(s, '(name)', username);
        if ($.HostHandler.hostreward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            $.inidb.incr('points', username.toLowerCase(), $.HostHandler.hostreward);
            s += " +" + $.getPointsString($.HostHandler.hostreward);
        }
        $.say("/me " + s);
    }

    $.HostHandler.hostlist[username.toLowerCase()] = System.currentTimeMillis() + $.HostHandler.hosttimeout;

    $.HostHandler.hostlist.push(username.toLowerCase());

    if (!$.inidb.exists("hostslist", username.toLowerCase())) {
        $.inidb.set("hostslist", username.toLowerCase(), 1);
    } else {
        var hostcount = parseInt($.inidb.get("hostslist", username.toLowerCase()));
        $.inidb.set("hostslist", username.toLowerCase(), hostcount++);
    }
});

$.on('twitchUnhosted', function (event) {
    var username = $.username.resolve(event.getHoster());

    $.HostHandler.hostlist[event.getHoster()] = System.currentTimeMillis() + $.HostHandler.hosttimeout;

    for (var i = 0; i < $.HostHandler.hostlist.length; i++) {
        if ($.HostHandler.hostlist[i].equalsIgnoreCase(username)) {
            $.HostHandler.hostlist.splice(i, 1);
            break;
        }
    }
});

$.on('twitchHostsInitialized', function (event) {
    $.hostannounce = "loaded";
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
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-reward-current-and-usage", $.getPointsString($.HostHandler.hostreward)));
                return;
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-reward-current-and-usage", $.getPointsString($.HostHandler.hostreward)));
                return;
            }
        } else {
            if (!parseInt(argsString) < 0) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-reward-error"));
                return;
            }

            $.logEvent("hostHandler.js", 134, username + " changed the host points reward to: " + argsString);

            $.inidb.set('settings', 'hostreward', argsString);
            $.HostHandler.hostreward = parseInt(argsString);
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-reward-set-success"));
            return;
        }
    }

    if (command.equalsIgnoreCase("hostmessage")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }

        if ($.strlen(argsString) == 0) {
            var msg = $.HostHandler.hostMessage;
            if ($.HostHandler.hostreward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
                msg += " +" + $.getPointsString($.HostHandler.hostreward);
            }
            $.say($.getWhisperString(sender) + msg);

            var s = $.lang.get("net.quorrabot.hosthandler.host-message-usage");

            $.say($.getWhisperString(sender) + s);
            return;

        } else {
            $.logEvent("hostHandler.js", 73, username + " changed the new hoster message to: " + argsString);

            $.inidb.set('settings', 'hostmessage', argsString);
            $.HostHandler.hostMessage = $.inidb.get('settings', 'hostmessage');

            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-message-set-success"));
            return;
        }
    }

    if (command.equalsIgnoreCase("hostcount")) {
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-count", $.HostHandler.hostlist.length));
        return;
    }

    if (command.equalsIgnoreCase("hostannounce")) {
        var status;
        if (args[0].toString().equalsIgnoreCase("true")) {
            $.HostHandler.announceHosts = "true";
            $.inidb.set("settings", "announce_hosts", "true");
            status = "enabled";
        } else {
            $.HostHandler.announceHosts = "false";
            $.inidb.set("settings", "announce_hosts", "false");
            status = "disabled";
        }
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.hostannounce", status));
        return;
    }

});
if ($.moduleEnabled('./handlers/hostHandler.js')) {
    $.registerChatCommand('./handlers/hostHandler.js', 'addhost', 'admin');
    $.registerChatCommand('./handlers/hostHandler.js', 'delhost', 'admin');
    $.registerChatCommand('./handlers/hostHandler.js', 'listautohosts', 'admin');
    $.registerChatCommand('./handlers/hostHandler.js', 'autohosttoggle', 'admin');
    $.registerChatCommand('./handlers/hostHandler.js', 'autohosttime', 'admin');
    $.registerChatCommand("./handlers/hostHandler.js", "hostmessage", "admin");
    $.registerChatCommand("./handlers/hostHandler.js", "hostreward", "admin");
    $.registerChatCommand("./handlers/hostHandler.js", "hosttime", "admin");
    $.registerChatCommand("./handlers/hostHandler.js", "hostannounce", "admin");
    $.registerChatCommand("./handlers/hostHandler.js", "hostcount");
    $.registerChatCommand("./handlers/hostHandler.js", "hostlist");
}


$.getChannelID = function (channel) {
    var channelData = $.twitch.GetChannel(channel);

    return channelData.getInt("_id");
};