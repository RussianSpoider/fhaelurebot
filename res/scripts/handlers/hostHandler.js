$.hostreward = parseInt($.inidb.get('settings', 'hostreward'));
$.hosttimeout = parseInt($.inidb.get('settings', 'hosttimeout'));
$.hostMessage = ($.inidb.get('settings', 'hostmessage') ? $.inidb.get('settings', 'hostmessage') : $.lang.get("net.quorrabot.hosthandler.default-host-welcome-message"));

$.AutoHost = {
    AutoHostToggle: (parseInt($.inidb.get('autoHost', 'autoHost_toggle')) ? parseInt($.inidb.get('autoHost', 'autoHost_toggle')) : '0'),
}

if ($.hostlist == null || $.hostlist == undefined) {
    $.hostlist = new Array();
}

if ($.hosttimeout == null || $.hosttimeout == undefined || isNaN($.hosttimeout)) {
    $.hosttimeout = 60 * 60 * 1000;
} else {
    $.hosttimeout = $.hosttimeout * 60 * 1000;
}

if ($.hostreward == null || $.hostreward == undefined || isNaN($.hostreward)) {
    $.hostreward = 0;
}

$.isHostUser = function (user) {
    return $.array.contains($.hostlist, user.toLowerCase());
}

$.on('twitchHosted', function (event) {
    var username = $.username.resolve(event.getHoster());
    var group = $.inidb.get('group', username.toLowerCase());
    var s = $.hostMessage;

    if (group == null) {
        group = 'Viewer';
    }

    if ($.announceHosts && $.moduleEnabled("./handlers/hostHandler.js") && ($.hostlist[username.toLowerCase()] == null || $.hostlist[username.toLowerCase()] == undefined || $.hostlist[username.toLowerCase()] < System.currentTimeMillis())) {
        
        s = $.replaceAll(s, '(name)', username);
        if ($.hostreward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
            $.inidb.incr('points', username.toLowerCase(), $.hostreward);
            s += " +" + $.getPointsString($.hostreward);
        }
        $.say("/me " + s);
    }

    $.hostlist[username.toLowerCase()] = System.currentTimeMillis() + $.hosttimeout;

    $.hostlist.push(username.toLowerCase());
});

$.on('twitchUnhosted', function (event) {
    var username = $.username.resolve(event.getHoster());

    $.hostlist[event.getHoster()] = System.currentTimeMillis() + $.hosttimeout;

    for (var i = 0; i < $.hostlist.length; i++) {
        if ($.hostlist[i].equalsIgnoreCase(username)) {
            $.hostlist.splice(i, 1);
            break;
        }
    }
});

$.on('twitchHostsInitialized', function (event) {
    println(">>Enabling new hoster announcements");

    $.announceHosts = true;
});

$.on('command', function (event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();

    if (command.equalsIgnoreCase('addhost') && args.length > 0) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }
                $.num_host = parseInt($.inidb.get('autoHost', 'host_num'));
                if(isNaN($.num_host) || $.num_host == null) {
                    $.inidb.set('autoHost','host_num',0);

                    $.num_host = 0;
                }
		var id = argsString.toLowerCase();
		if(!$.getUserExists(argsString))
		{
			$.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.autohost.not-exist", argsString));
			return;
		}
		
		if ($.num_host > 0) {
			for (i = 0; i < $.num_host; i++) {
				if($.inidb.get('autoHost', 'host_' + i) == id)
				{
					$.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.autohost.already-exists", $.username.resolve(argsString)));
					return;
				}
			}
		}
        $.inidb.incr('autoHost', 'host_num', 1);
        $.inidb.set('autoHost', 'host_' + ($.num_host + 1), argsString.toLowerCase());
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.autohost.add-success", $.username.resolve(argsString), ($.num_host + 1).toString()));
    }
    if (command.equalsIgnoreCase('delhost') && args.length > 0) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }
                $.num_host = parseInt($.inidb.get('autoHost', 'host_num'));
                if(isNaN($.num_host) || $.num_host == null) {
                    $.inidb.set('autoHost','host_num',0);

                    $.num_host = 0;
                }
		var id = argsString.toLowerCase();
		
		if ( isNaN(id)) {
			if ($.num_host > 0) {
				for (i = 0; i < $.num_host; i++) {
					if($.inidb.get('autoHost', 'host_' + i) == id)
					{
						id = i;
						break;
					}
				}
			}
		}
		
        if ($.num_host > 0) {
            for (i = 0; i < $.num_host; i++) {
                if (i > parseInt(id)) {
                    $.inidb.set('autoHost', 'host_' + (i - 1), $.inidb.get('autoHost', 'host_' + i));
                }
            }
        }
        if ($.num_host > 0) {
            $.inidb.decr('autoHost', 'host_num', 1);
        }
        
        $.inidb.del('autoHost', 'host_' + $.num_host);
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.autohost.remove-success", $.username.resolve(argsString), ($.num_host - 1).toString()));
    }
    
    if (command.equalsIgnoreCase('listautohosts')) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }
                $.num_host = parseInt($.inidb.get('autoHost', 'host_num'));
                if(isNaN($.num_host) || $.num_host == null) {
                    $.inidb.set('autoHost','host_num',0);
                    $.num_host = 0;
                }
		var first = 1;
		
		if ($.num_host > 0) {
			var channels = [];
			for (i = 0; i < $.num_host; i++) {
				channels.push($.inidb.get('autoHost', 'host_' + (i+ 1)));
			}
			
			for (i = 0; i < channels.length; i++) {
				if(first == 1)
				{
					first = 0;
					$.say('Hostlist: (AutoHost Status: ' + $.AutoHost.AutoHostToggle + ')');
				}

				$.say($.username.resolve(channels[i]) + ' (http://twitch.tv/' + channels[i] + ')');
			}
		}
    }
    
    if (command.equalsIgnoreCase('autohosttoggle')) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }
		if($.AutoHost.AutoHostToggle == '0') {
			$.inidb.set('autoHost', 'autoHost_toggle', '1');
			$.AutoHost.AutoHostToggle = '1';
			$.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.autohost.enabled"));
		} else {
			$.inidb.set('autoHost', 'autoHost_toggle', '0');
			$.AutoHost.AutoHostToggle = '0';
			$.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.autohost.disabled"));   
		}
		return;
    }
    
    if (command.equalsIgnoreCase("hostreward")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        }

        if ($.strlen(argsString) == 0) {
            if ($.inidb.exists('settings', 'hostreward')) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-reward-current-and-usage", $.getPointsString($.hostreward)));
                return;
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-reward-current-and-usage", $.getPointsString($.hostreward)));
                return;
            }
        } else {
            if (!parseInt(argsString) < 0) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-reward-error"));
                return;
            }

            $.logEvent("hostHandler.js", 134, username + " changed the host points reward to: " + argsString);

            $.inidb.set('settings', 'hostreward', argsString);
            $.hostreward = parseInt(argsString);
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
            var msg = $.hostMessage;
            if ($.hostreward > 0 && $.moduleEnabled("./systems/pointSystem.js")) {
                msg += " +" + $.getPointsString($.hostreward);
            }
            $.say($.getWhisperString(sender) + msg);			
		
            var s = $.lang.get("net.quorrabot.hosthandler.host-message-usage");		
		
            $.say($.getWhisperString(sender) + s);		
            return;
            
        } else {		
            $.logEvent("hostHandler.js", 73, username + " changed the new hoster message to: " + argsString);		
		
            $.inidb.set('settings', 'hostmessage', argsString);
            $.hostMessage = $.inidb.get('settings', 'hostmessage');
		
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-message-set-success"));		
            return;		
        }		
    }

    if (command.equalsIgnoreCase("hostcount")) {
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-count", $.hostlist.length));
        return;
    }

    if (command.equalsIgnoreCase("hosttime")) {
        if (args.length < 1) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-timeout-time", $.hosttimeout));
            return;
        } else if (args.length >= 1) {
            if (!$.isAdmin(sender)) {
                $.say($.getWhisperString(sender) + $.adminmsg);
                return;
            }
            if (parseInt(args[0]) < 30) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-timeout-time-error"));
                return;
            } else {
                $.inidb.set('settings', 'hosttimeout', parseInt(args[0]));
                $.hosttimeout = parseInt(args[0]);
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-timeout-time-set", parseInt(args[0])));
                return;
            }
        }
    }

    if (command.equalsIgnoreCase("hostlist")) {
        var m = "";

        for (var b = 0; b < Math.ceil($.hostlist.length / 30); b++) {
            m = "";

            for (var i = (b * 30); i < Math.min($.hostlist.length, ((b + 1) * 30)); i++) {
                if ($.strlen(m) > 0) {
                    m += ", ";
                }

                m += $.hostlist[i];
            }

            if (b == 0) {
                $.say($.lang.get("net.quorrabot.hosthandler.host-list", $.hostlist.length, m));
                return;
            } else {
                $.say(">>" + m);
                return;
            }
        }

        if ($.hostlist.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.hosthandler.host-list-error"));
            return;
        }
    }
});
setTimeout(function () {
    if ($.moduleEnabled('./handlers/hostHandler.js')) {
	if($.AutoHost.AutoHostToggle == 1)
        {
			$.timer.addTimer('./handlers/hostHandler.js', 'autoHost', true, function () {
				if (!$.isOnline($.channelName) &&
					!isChannelHosting($.channelName))
				{
					for (i = 0; i < $.num_host; i++) {
						var channel = $.inidb.get('autoHost', 'host_' + (i + 1));
						if($.isOnline(channel))
						{
							$.hostEvent(channel.toLowerCase(),"host");
                                                        setTimeout(function(){
                                                            $.say("/me " + $.lang.get("net.quorrabot.streamcommand.host-set-success", $.username.resolve(channel)));
                                                        }, 1000);
							break;
						}
					}
				}
			}, 10 * 1000);
	}
        $.registerChatCommand('./handlers/hostHandler.js', 'addhost', 'admin');
        $.registerChatCommand('./handlers/hostHandler.js', 'delhost', 'admin');
        $.registerChatCommand('./handlers/hostHandler.js', 'listautohosts', 'admin');
        $.registerChatCommand('./handlers/hostHandler.js', 'autohosttoggle', 'admin');
        $.registerChatCommand("./handlers/hostHandler.js", "hostmessage", "admin");
        $.registerChatCommand("./handlers/hostHandler.js", "hostreward", "admin");
        $.registerChatCommand("./handlers/hostHandler.js", "hosttime", "admin");
        $.registerChatCommand("./handlers/hostHandler.js", "hostcount");
        $.registerChatCommand("./handlers/hostHandler.js", "hostlist");
    }
}, 10 * 1000);

$.isChannelHosting = function(channel) {
	var HttpResponse = Packages.com.gmt2001.HttpResponse;
	var HttpRequest = Packages.com.gmt2001.HttpRequest;
	var HashMap = Packages.java.util.HashMap;
	var url = 'https://tmi.twitch.tv/hosts?include_logins=1&host=' + $.getChannelID(channel)
	var response = HttpRequest.getData(HttpRequest.RequestType.GET, url, "", new HashMap());
	var is_hosting = response.content.indexOf('target_id');
	
	if(is_hosting == -1)
		return 0;
	else
		return 1;
}

$.getChannelID = function(channel) {
    var channelData = $.twitch.GetChannel(channel);
    
    return channelData.getInt("_id");
}