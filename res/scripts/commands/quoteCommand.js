$.getDate = function() {
    var datefmt = new java.text.SimpleDateFormat("MM-dd-yyyy");
    var cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone($.timeZone));
    var time = cal.getTime();
    var timestamp = datefmt.format(time);

    return timestamp;
};

if ($.inidb.get("quotes", "num_quotes") == null) {
    $.inidb.set("quotes", "num_quotes", 0);
}

function updateSettings() {
    $.quoteGame = $.inidb.get('settings','quotegame');
    $.quoteDate = $.inidb.get('settings','quotedate');
}

if ($.quoteGame == undefined || $.quoteGame == null ||
$.strlen($.quoteGame) == 0 || $.quoteGame == "") {
    $.quoteGame = "disabled";
}

if ($.quoteDate == undefined || $.quoteDate == null ||
$.strlen($.quoteDate) == 0 || $.quoteDate == "") {
    $.quoteDate = "disabled";
}

$.on('command', function(event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();

    if (command.equalsIgnoreCase("quote")) {
        if (args.length == 0) {
            if ($.inidb.get("quotes", "num_quotes") > 0) {
                var ran = $.randRange(0, parseInt($.inidb.get("quotes", "num_quotes")));
                $.say($.lang.get("net.phantombot.quotecommand.random-quote", ran, $.inidb.get("quotes", "quote_" + ran)));
                return;
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.error-no-quotes"));
            return;
            }
        } else if (args.length == 1 && !isNaN(args[0])) {
            if ($.inidb.get("quotes", "quote_" + parseInt(args[0]))) {
                $.say($.lang.get("net.phantombot.quotecommand.random-quote", parseInt(args[0]), $.inidb.get("quotes", "quote_" + parseInt(args[0]))));
                return;
            } else {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.error-no-quotes"));
                return;
            }
        }
    
    var quotes = $.inidb.get("quotes", "num_quotes");
    var message = argsString.substring(argsString.indexOf(" ") + 1, argsString.length());
    var messageEdit = argsString.substring(argsString.indexOf(" ") + 2, argsString.length());
    var game = $.getGame($.channelName);
    var date = $.getDate();
    var gameStr = "";
    var dateStr = "";
    var gameSep = "";
    var dateSep = "";

    if ($.quoteGame == "disabled") {
        gameStr = "";
        gameSep = "";
    } else if ($.quoteGame == "enabled") {
        gameStr = "[" + game + "]";
        gameSep = " - ";
    }

    if ($.quoteDate == "disabled") {
        dateStr = "";
        dateSep = "";
    } else if ($.quoteDate == "enabled") {
        dateStr = "[" + date + "]";
        dateSep = " - ";
    }

    var quoteInfo = gameSep + gameStr + dateSep + dateStr;

        if (args[0].equalsIgnoreCase("add")) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.error-quote-usage"));
                return;
            }
            $.inidb.incr("quotes", "num_quotes", 1);
            $.inidb.set("quotes", "quote_" + quotes, message + quoteInfo);
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.quote-add-success", message));
        } 

        if (args[0].equalsIgnoreCase("remove")) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.delquote-error-usage"));
                return;
            } else if ($.inidb.get("quotes", "quote_" + parseInt(args[1])) == null) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.delquote-error-wrong-id", $.inidb.get('quotes', 'num_quotes')));
                return;
            }
            $.inidb.decr("quotes", "num_quotes", 1);
            $.inidb.del("quotes", "quote_" + parseInt(args[1]));
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.delquote-success", parseInt(args[1])));
        } 

        if (args[0].equalsIgnoreCase("edit")) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }
            if (args.length < 3) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.editquote-error-usage"));
                return;
            } else if ($.inidb.get("quotes", "quote_" + parseInt(args[1])) == null) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.editquote-error"));
                return;
            }
            $.inidb.set("quotes", "quote_" + parseInt(args[1]), messageEdit + quoteInfo);
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.editquote-success", parseInt(args[1])));
        }

        if (args[0].equalsIgnoreCase("game")) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.game-usage"));
                return;
            } else if (args[1] != "enable" && args[1] != "disable") {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.game-error", args[1]));
                return;
            }
            if (args[1] == "enable") {
                $.inidb.set('settings','quotegame', args[1]);
                updateSettings();
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.game-success-enable"));
                return;
            } else if (args[1] == "disable") {
                $.inidb.set('settings','quotegame', args[1]);
                updateSettings();
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.game-success-disable"));
                return;
            }
        
        }

        if (args[0].equalsIgnoreCase("date")) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.date-usage"));
                return;
            } else if (args[1] != "enabled" && args[1] != "disabled") {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.date-error", args[1]));
                return;
            }
            if (args[1] == "enabled") {
                $.inidb.set('settings','quotedate', args[1]);
                updateSettings();
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.date-success-enable"));
                return;
            } else if (args[1] == "disabled") {
                $.inidb.set('settings','quotedate', args[1]);
                updateSettings();
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.quotecommand.-success-disable"));
                return;
            }
        }
    }
});

setTimeout(function() { 
    if ($.moduleEnabled('./commands/quoteCommand.js')) {
        $.registerChatCommand("./commands/quoteCommand.js", "quote");
    }
}, 10 * 1000);
