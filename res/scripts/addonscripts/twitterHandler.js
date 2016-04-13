$.on('command', function(event) {
var sender = event.getSender();
var username = $.username.resolve(sender);
var command = event.getCommand();
var argsString = event.getArguments().trim();
var args = event.getArgs();


        if (command.equalsIgnoreCase("tweet")) {
            if (!$.isAdmin(sender)) {
                $.say($.getWhisperString(sender) + $.adminmsg);
                return;
            }
            if(args[0]==null || args[0]=="") {
                $.say($.getWhisperString(sender) + "No message specified");
                return;
            }
            $.twitter.tweet(argsString);
            $.say($.getWhisperString(sender) + "Tweet sent successfully");
            return;
        }
        

});

setTimeout(function(){ 
    if ($.moduleEnabled('./addonscripts/twitterHandler.js')) {
        $.registerChatCommand("./addonscripts/twitterHandler.js", "tweet", "admin");
    }
},10 * 1000);