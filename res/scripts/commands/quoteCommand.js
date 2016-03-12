$.QuoteCommand = {
    quoteDateToggle: ($.inidb.get('settings', 'quotedate') ? $.inidb.get('settings', 'quotedate') : false),
    quoteGameToggle: ($.inidb.get('settings', 'quotegame') ? $.inidb.get('settings', 'quotegame') : false),
    getTotalQuotes: (parseInt($.inidb.GetKeyList('quotes', '').length) ? parseInt($.inidb.GetKeyList('quotes', '').length) : 0),
};

$.QuoteCommand.getDate = function () {
    var datefmt = new java.text.SimpleDateFormat("MM-dd-yyyy");
    var cal = java.util.Calendar.getInstance(java.util.TimeZone.getTimeZone($.timeZone));
    var time = cal.getTime();
    var timestamp = datefmt.format(time);

    return timestamp;
};

$.QuoteCommand.getRandomQuote = function (event) {
    var sender = event.getSender();
    var random = $.randRange(0, ($.QuoteCommand.getTotalQuotes - 1));

    if ($.QuoteCommand.getTotalQuotes > 0) {
        $.say('Quote #' + (random + 1) + ' ' + $.inidb.get('quotes', 'quote_' + random));
        return;
    } else {
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.error-no-quotes"));
        return;
    }
};

$.QuoteCommand.getQuote = function (event, quote) {
    var sender = event.getSender();

    if ($.inidb.exists('quotes', 'quote_' + quote)) {
        $.say('Quote #' + (parseInt(quote) + 1) + ' ' + $.inidb.get('quotes', 'quote_' + quote));
        return;
    } else {
        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.quote-number", ($.QuoteCommand.getTotalQuotes) ));
        return;
    }
};

$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var action = args[0];

    if (command.equalsIgnoreCase('quote')) {

        var game = '';
        var date = '';
        var strG = '';
        var strD = '';

        if ($.QuoteCommand.quoteGameToggle) {
            game = '[' + $.getGame($.channelName) + ']';
            strG = ' - ';
        } 
        if ($.QuoteCommand.quoteDateToggle) {
            date = '[' + $.QuoteCommand.getDate() + ']';
            strD = ' - ';
        } 
        
        var quoteInfo = strD + game + strG + date;
        
        if (args.length == 0) {
            $.QuoteCommand.getRandomQuote(event);
            return;
        } else if (args.length > 0 && !isNaN(args[0])) {
            if(parseInt(args[0]) > 0) {
                args[0] = parseInt(args[0] - 1);
            } else if(parseInt(args[0] == 0)) {
                args[0] = 1;
            }
            $.QuoteCommand.getQuote(event, args[0]);
            return;  
        }

        if (action.equalsIgnoreCase('add')) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            } 
            if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.error-quote-usage"));
                return;
            }
            var message = argsString.substring(argsString.indexOf(" ") + 1, argsString.length());
            $.inidb.set('quotes', 'quote_' + $.QuoteCommand.getTotalQuotes, message + quoteInfo);
            $.QuoteCommand.getTotalQuotes++;
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.quote-add-success", $.QuoteCommand.getTotalQuotes));
            return;
        }
                
        if (action.equalsIgnoreCase('game')) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }
            if ($.QuoteCommand.quoteGameToggle) {
                $.inidb.set('settings', 'quotegame', false);
                $.QuoteCommand.quoteGameToggle = false;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.game-success-disable"));
                return;
            } else {
                $.inidb.set('settings', 'quotegame', true);
                $.QuoteCommand.quoteGameToggle = true;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.game-success-enable"));
                return;
            }
        }
        
        if (action.equalsIgnoreCase('date')) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }
            if ($.QuoteCommand.quoteDateToggle) {
                $.inidb.set('settings', 'quotedate', false);
                $.QuoteCommand.quoteDateToggle = false;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.date-success-disable"));
                return;
            } else {
                $.inidb.set('settings', 'quotedate', true);
                $.QuoteCommand.quoteDateToggle = true;
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.date-success-enable"));
                return;
            }
        }
        
        if(action.toLowerCase()!="add" | action.toLowerCase()!="game" | action.toLowerCase()!="date") {
            if(args[1]!=null && parseInt(args[1]) > 0) {
                args[1] = parseInt(args[1] - 1);
            } else if(parseInt(args[1] == 0)) {
                args[1] = 1;
            }
            args[1] = args[1].toString();
        }
        
        if (action.equalsIgnoreCase('remove')) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            } else if (args.length < 2) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.delquote-error-usage"));
                return;
            } else if (!$.inidb.exists('quotes', 'quote_' + parseInt(args[1]))) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.delquote-error-wrong-id", $.QuoteCommand.getTotalQuotes));
                return;
            }
            $.inidb.del('quotes', 'quote_' + parseInt(args[1]));
            $.QuoteCommand.getTotalQuotes--;
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.delquote-success", $.QuoteCommand.getTotalQuotes));
            return;
        } 
        
        if (action.equalsIgnoreCase('edit')) {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            } else if (args.length < 3) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.editquote-error-usage"));
                return;
            } else if (!$.inidb.exists('quotes', 'quote_' + parseInt(args[1]))) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.editquote-error"));
                return;
            }
            var messageEdit = argsString.substring(argsString.indexOf(args[2]) - 1, argsString.length());
            $.inidb.set('quotes', 'quote_' + parseInt(args[1]), messageEdit + quoteInfo);
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.quotecommand.editquote-success", (parseInt(args[1]) + 1), messageEdit));
            return;
            
        }
        
    }
});

setTimeout(function() { 
    if ($.moduleEnabled('./commands/quoteCommand.js')) {
        $.registerChatCommand("./commands/quoteCommand.js", "quote");
    }
}, 10 * 1000);
