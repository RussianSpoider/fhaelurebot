$.TwitterHandler = {
    TweetStreamToggle: (parseInt($.inidb.get('settings', 'tweet_stream_toggle')) ? parseInt($.inidb.get('settings', 'tweet_stream_toggle')) : "0"),
    StreamTweeted: 0,
}

$.on('command', function (event) {
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
        if (args[0] == null || args[0] == "") {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.twitterhandler.no-message"));
            return;
        }
        if (args[0].toString().equalsIgnoreCase("getlast")) {
            $.say($.twitter.getlast().toString());
            return;
        }

        if (args[0].toString().equalsIgnoreCase("stream")) {
            if ($.twitter.getlast().toString().toLowerCase().contains($.getStatus($.channelName).toLowerCase())) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.twitterhandler.duplicate-post"));
                return;
            }
            $.twitter.tweet($.getGame($.channelName) + " | " + $.getStatus($.channelName) + ": " + "twitch.tv/" + $.channelName.toLowerCase());
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.twitterhandler.stream-tweeted"));
            return;
        }

        if (args[0].toString().equalsIgnoreCase("streamtoggle")) {
            if ($.TwitterHandler.TweetStreamToggle == "0") {
                $.inidb.set('settings', 'tweet_stream_toggle', "1");
                $.TwitterHandler.TweetStreamToggle = "1";
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.twitterhandler.auto-stream-tweet-enabled"));
            } else {
                $.inidb.set('settings', 'tweet_stream_toggle', "0");
                $.TwitterHandler.TweetStreamToggle = "0";
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.twitterhandler.auto-stream-tweet-disabled"));
            }
            return;
        }
        if ($.twitter.getlast().toString().equalsIgnoreCase(argsString)) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.twitterhandler.no-message"));
            return;
        }
        $.twitter.tweet(argsString);
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.twitterhandler.tweet-successful"));
        return;
    }

});

$.twitterAnnounce = function () {
    if ($.isOnline($.channelName) == true) {
        if ($.TwitterHandler.StreamTweeted == 0 && $.TwitterHandler.TweetStreamToggle == "1") {
            var lasttweet = $.twitter.getlast().toString();
            var status = $.getStatus($.channelName);
            if (status != null && !lasttweet.toLowerCase().contains(status.toLowerCase())) {
                $.twitter.tweet($.getGame($.channelName) + " | " + $.getStatus($.channelName) + ": " + "twitch.tv/" + $.channelName.toLowerCase());
                $.TwitterHandler.StreamTweeted = 1;
            }
        }
    } else {
        $.TwitterHandler.StreamTweeted = 0;
    }
};

if ($.moduleEnabled('./addonscripts/twitterHandler.js')) {
    $.registerChatCommand("./addonscripts/twitterHandler.js", "tweet", "admin");
    if ($.TwitterHandler.TweetStreamToggle == "1") {
        $.timer.addTimer("./addonscripts/twitterHandler.js", "twitterannounce", true, function () {
            $.twitterAnnounce();
        }, 15 * 1000);
    }
    $.println('Twitter API module loaded.');
}