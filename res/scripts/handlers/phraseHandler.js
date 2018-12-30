$.on('ircChannelMessage', function(event) { 
    var message = new String(event.getMessage().toLowerCase().trim());
    var sender = event.getSender();
    var username = $.username.resolve(sender, event.getTags());

    //message = message.replace(/[^a-zA-Z0-9_\s]+/g,'');
    var emoteKey = $.inidb.GetKeyList("phrases", "");
    if (emoteKey == null || emoteKey[0] == "" || emoteKey[0] == null) {
        return;
    }

    for (i = 0; i < emoteKey.length; i++) {
        if (message.indexOf(emoteKey[i].toLowerCase()) != -1) {
            var msgcheck1 = message.substring(message.indexOf(emoteKey[i].toLowerCase()) - 1,message.indexOf(emoteKey[i].toLowerCase()));
            var msgcheck2 = message.substring(message.indexOf(emoteKey[i].toLowerCase()) + emoteKey[i].toLowerCase().length(), emoteKey[i].toLowerCase().length() + 1);
            if(msgcheck1==" " || msgcheck2==" " || message.equalsIgnoreCase(emoteKey[i].toLowerCase())) {

                var messageKEY = $.inidb.get('phrases', emoteKey[i]);
            
                messageKEY = $.replaceAll(messageKEY, "(sender)", username);
			
                $.say(messageKEY);
                return;
            }

        }
    }    
});

$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var triggerphrase = "";
    var response = "";
	
    if (command.equalsIgnoreCase("addphrase")) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }

        if (args.length < 2) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.phrasehandler.trigger-error-add-usage"));
            return;
        } 

        triggerphrase = args[0].toLowerCase();
        triggerphrase = new String(triggerphrase);
        //triggerphrase = triggerphrase.replace(/[^a-zA-Z0-9_\s]+/g,'');
        
        if(argsString.contains('“') | argsString.contains('”') | argsString.contains('"')) {
            response = argsString.replace('“','"');
            response = response.replace('”','"');
            response = response.substring(response.indexOf('" "') + 3, response.length() -1);
        } else {
            response = argsString.substring(args[0].length() + 1);
        }
         
        $.inidb.set('phrases', triggerphrase, response);
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.phrasehandler.trigger-add-success", args[0], response));
        return;
    }
    
    if (command.equalsIgnoreCase("delphrase")) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }

        if (args.length == 0) { 
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.phrasehandler.trigger-remove-usage"));
            return;
        }

        triggerphrase = args[0].toLowerCase();
        
        $.inidb.del('phrases', triggerphrase);
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.phrasehandler.trigger-remove-success", triggerphrase));
        return;
    }
});

    if ($.moduleEnabled('./handlers/phraseHandler.js')) {
        $.registerChatCommand("./handlers/phraseHandler.js", "addphrase", "mod");
        $.registerChatCommand("./handlers/phraseHandler.js", "delphrase", "mod");
    }
