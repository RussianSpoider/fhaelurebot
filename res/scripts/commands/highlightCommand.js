var seconds = 0; 
$.timer.addTimer("./commands/highlightCommand.js", "highlightcommand", true, function() {
    if (!$.isOnline($.channelName)) {
        seconds = 0;
        return;
    }
    else {
        seconds++;
        return;
    }

}, 1000);

$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
		
    if (command.equalsIgnoreCase("highlight")) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
        }
        
        if(args[0]!=null) {
            var action = args[0];
        }
        
        if(action.equalsIgnoreCase("list")) {
            var list = $.inidb.GetKeyList("highlights", "");
            $.writeToFile("", "web/highlights.txt", false);
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.highlightcommand.highlight-recent-5"));
            for(var i=0;i < list.length;i++) {
                var highlightkey = list[i];
                var highlight = $.inidb.get('highlights',highlightkey);
                $.writeToFile(highlightkey + " - " + highlight, "web/highlights.txt", true);
                if(i<5) {
                   $.say($.getWhisperString(sender) + highlightkey + " - " + highlight); 
                }
            }
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.highlightcommand.highlight-see-list"));
            return;
        }
        
        if(action.equalsIgnoreCase("clear")) {
            $.inidb.RemoveFile("highlights");
            $.inidb.ReloadFile("highlights");
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.highlightcommand.highlight-cleared"));
            return;
        }
        
        if (argsString.isEmpty()) { 
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.highlightcommand.usage"));
        } else if (!$.isOnline($.channelName)) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.highlightcommand.error-stream-offline"));
        } else {
            var timestamp = $.getHighlight($.channelName);
            $.inidb.set("highlights", timestamp, argsString);
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.highlightcommand.highlight-saved", argsString, timestamp));
            return;
        }
    }
	
});
setTimeout(function(){ 
    if ($.moduleEnabled('./commands/highlightCommand.js')) {
        $.registerChatCommand("./commands/highlightCommand.js", "highlight", "mod");
    }
}, 10 * 1000);
