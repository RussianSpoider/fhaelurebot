$.TwitterHandler = {
    TweetStreamToggle: (parseInt($.inidb.get('settings', 'tweet_stream_toggle')) ? parseInt($.inidb.get('settings', 'tweet_stream_toggle')) : "0"),
    StreamTweeted: 0,
}

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
            if(args[0].toString().equalsIgnoreCase("getlast")) {
                $.say($.twitter.getlast().toString());
                return;
            }
            
            if(args[0].toString().equalsIgnoreCase("stream")) {
                if($.twitter.getlast().toString().toLowerCase().contains($.getStatus($.channelName).toLowerCase())) {
                    $.say($.getWhisperString(sender) + "Duplicate post, status update not posted.");
                    return;
                }
                $.twitter.tweet($.getStatus($.channelName) + ": " + "twitch.tv/" + $.channelName.toLowerCase());
                $.say($.getWhisperString(sender) + "Stream has been tweeted."); 
                return;
            }
            
            if(args[0].toString().equalsIgnoreCase("streamtoggle")) {
                if($.TwitterHandler.TweetStreamToggle == "0") {
                    $.inidb.set('settings', 'tweet_stream_toggle', "1");
                    $.TwitterHandler.TweetStreamToggle = "1";
                    $.say($.getWhisperString(sender) + "Stream title and game will now be tweeted when stream goes live.");
                } else {
                    $.inidb.set('settings', 'tweet_stream_toggle', "0");
                    $.TwitterHandler.TweetStreamToggle = "0";
                    $.say($.getWhisperString(sender) + "Stream title and game will no longer be tweeted when stream goes live.");                    
                }
                return;
            }
            if($.twitter.getlast().toString().equalsIgnoreCase(argsString)) {
                $.say($.getWhisperString(sender) + "Duplicate post, status update not posted.");
                return;
            }
            $.twitter.tweet(argsString);
            $.say($.getWhisperString(sender) + "Tweet sent successfully");
            return;
        }
        
        

});

setTimeout(function(){ 
    if ($.moduleEnabled('./addonscripts/twitterHandler.js')) {
        if($.TwitterHandler.TweetStreamToggle == "1") {
            $.timer.addTimer("./addonscripts/twitterHandler.js", "twitterHandler", true, function () {
                if ($.isOnline($.channelName)) {
                    if($.TwitterHandler.StreamTweeted == 0) {
                        var lasttweet = $.twitter.getlast().toString();                    
                        var streamlive = $.getStatus($.channelName) + ": " + "twitch.tv/" + $.channelName.toLowerCase();
                        if(!lasttweet.toLowerCase().contains($.getStatus($.channelName).toLowerCase())) {
                            $.TwitterHandler.StreamTweeted = 1;
                            $.twitter.tweet(streamlive);
                        } else {
                            $.TwitterHandler.StreamTweeted = 0;
                        }
                    }
                }
            }, 10 * 1000); //bankheist run time
        }
        
        $.registerChatCommand("./addonscripts/twitterHandler.js", "tweet", "admin");
    }

},10 * 1000);
