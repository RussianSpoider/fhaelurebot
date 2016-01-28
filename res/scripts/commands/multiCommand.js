$.on('command', function(event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var args = event.getArgs();
    var i = event.getArguments().trim();

    if (command.equalsIgnoreCase("multi")) {
    	if (args.length >=0 && !$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.adminmsg);
    		    return;
        }

        if (args.length == 0 && $.inidb.get('multicommand', 'lastmulti')) {
            $.say("http://kadgar.net/live/" + $.channelName.toLowerCase() + "/" + $.inidb.get('multicommand', 'lastmulti'));
            return;
        } else if (args.length == 0 || args[0].equalsIgnoreCase("help")) {
            $.say($.getWhisperString(sender) + "Usage: !multi set (Other Twitch Channel) - set one default channel to be used for normal users when using the command !multi, and the auto timer. '!multi del' to remove it.");
            $.say($.getWhisperString(sender) + "Usage: !multi timer true/false - enable the auto timer to repeat the default multi channel. Only works if the channel is online."); 
            setTimeout(function() {
            $.say($.getWhisperString(sender) + "Usage: !multi interval (time) - set the interval for the auto timer. minimum is 5 minutes. default is 5 minutes.");
            }, 1000);
            return;
        }

        if (args[0].equalsIgnoreCase("set")) {
            if (args[1] == null) {
                $.say($.getWhisperString(sender) + "Usage: !multi set (channel name) - set a default channel to be used for moderators-");
                return;
            }
            var multi = "";
            for(var i=1;i<args.length;i++) {
                multi+=args[i];
                multi+="/";
            }
            multi = multi.toLowerCase();
            $.inidb.set('multicommand', 'lastmulti', multi);
            $.say($.getWhisperString(sender) + "Multitwitch set to channel(s) " + $.channelName.toLowerCase() + "/" + multi);
            return;
        } else if (args[0].equalsIgnoreCase("clear")) {
            $.inidb.del('multicommand', 'lastmulti');
            $.say($.getWhisperString(sender) + "Multitwitch channel(s) removed!");
            return;
        } else if (args[0].equalsIgnoreCase("interval")) {
            if (parseInt(args[1]) < 5) {
                $.say("interval needs to be more then 5 minutes.");
                return;
            }
            $.inidb.set('multicommand', 'interval', parseInt(args[1]));
            $.say($.getWhisperString(sender) + "interval set to " + parseInt(args[1]) + " minutes");
            return;
        } else if (args[0].equalsIgnoreCase("timer")) {
            if (args[1].equalsIgnoreCase("true")) {
                $.inidb.set("multicommand", "timer", "true");
                $.say($.getWhisperString(sender) + "multitwitch timer on");
            } else if (args[1].equalsIgnoreCase("false")) {
                $.inidb.set("multicommand", "timer", "false");
                $.say($.getWhisperString(sender) + "multitwitch timer turned off");
            } else {
                $.say($.getWhisperString(sender) + "!multi timer true/false");
            }
        } else {
            
            if(args[0]!=null) {
                $.say($.getWhisperString(sender) + "Usage: !multi set (Other Twitch Channel) - set one default channel to be used for normal users when using the command !multi, and the auto timer. '!multi del' to remove it.");
                $.say($.getWhisperString(sender) + "Usage: !multi timer true/false - enable the auto timer to repeat the default multi channel. Only works if the channel is online."); 
                setTimeout(function() {
                $.say($.getWhisperString(sender) + "Usage: !multi interval (time) - set the interval for the auto timer. minimum is 5 minutes. default is 5 minutes.");
                }, 1000);
                return;
            }
            
            var multi = $.inidb.get('multicommand', 'lastmulti');
            
            if( multi!=null) {
                $.say("http://kadgar.net/live/" + $.channelName.toLowerCase() + "/" + multi);
            } else {
                $.say("No current multi-stream link set.");
            }
            return;
        }
    }
});


setTimeout(function(){ 
    if ($.moduleEnabled('./commands/multiCommand.js')) {
        $.registerChatCommand("./commands/multiCommand.js", "multi", "mod");
    }
},10 * 1000);

$.interval = parseInt($.inidb.get('multicommand', 'interval'));
if ($.interval == undefined || $.interval == null || isNaN($.interval)) {
    $.interval = 5;
}
$.timer.addTimer("./commands/multiCommand.js", "sellouttimer", true, function() {
    $.mctimer = $.inidb.get('multicommand', 'timer');
    if ($.mctimer!=null && $.mctimer.equalsIgnoreCase("true")) {
        if ($.inidb.get('multicommand', 'lastmulti')) {
            $.say("http://kadgar.net/live/" + $.channelName.toLowerCase() + "/" + $.inidb.get('multicommand', 'lastmulti'));
            return;
        }
    }
}, $.interval * 60 * 1000);
