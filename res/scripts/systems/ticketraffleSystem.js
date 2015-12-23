$.TicketRaffleRunning = false;
$.SubscriberLuck = parseInt($.inidb.get("settings", "subscriber_luck"));

if ($.SubscriberLuck == null || $.SubscriberLuck == undefined || isNaN($.SubscriberLuck)) {
    $.SubscriberLuck = $.inidb.set("settings", "subscriber_luck", "1");
}

$.on('command', function (event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var subCommand = args[0];
 
    if (command.equalsIgnoreCase("traffle"))  {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.cmd.modonly"));
            return;
        }
       
        if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.usage"));
            return;
        }
 
        if (subCommand.equalsIgnoreCase("close") || subCommand.equalsIgnoreCase("end")) {
            if (!$.TicketRaffleRunning) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.no-raffle-opened"));
                return;
            }

            if ($.Time >= 1) { 
                $.timer.clearTimer("./systems/ticketraffleSystem.js", "ttraffle", true);
                $.timer.clearTimer("./systems/ticketraffleSystem.js", "traffle", true);
            }
    
            $.TicketRaffleRunning = false;
     
            var Winner = $.TicketRaffleEntries[$.randRange(1, $.TicketRaffleEntries.length) - 1];
     
            if (Winner == null) {
                $.say($.lang.get("net.phantombot.ticketrafflesystem.no-winner"));
                $.inidb.RemoveFile('traffleplayer');
                return;
            } else {
                $.say($.lang.get("net.phantombot.ticketrafflesystem.winner", Winner));
                $.inidb.set('traffle', 'lastwinner', Winner);
                $.inidb.RemoveFile('traffleplayer');
                return;
            }
        }
     
        if (subCommand.equalsIgnoreCase("repick") || subCommand.equalsIgnoreCase("redraw")) {
            var NewWinner = $.TicketRaffleEntries[$.randRange(1, $.TicketRaffleEntries.length) - 1];
            if (NewWinner.toLowerCase() == $.inidb.get('traffle', 'lastwinner').toLowerCase()) {
                NewWinner = $.TicketRaffleEntries[$.randRange(1, $.TicketRaffleEntries.length) - 1];
            }
     
            if (NewWinner == null) {
                $.say($.lang.get("net.phantombot.ticketrafflesystem.winner-repick"));
                return;
            } else {
                $.say($.lang.get("net.phantombot.ticketrafflesystem.no-winner-repick", NewWinner));
                $.inidb.set('traffle', 'lastwinner', NewWinner);
                return;
            }
        }

        if (subCommand.equalsIgnoreCase("subscriberluck")) {
            if (args.length <= 1 || args[1] > 10) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.sub-luck-usage"));
                return;
            }
            $.inidb.set('settings', 'subscriber_luck', parseInt(args[1]));
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.sub-luck-set", parseInt(args[1])));
            return;
        }
     
        if (subCommand.equalsIgnoreCase("open") || subCommand.equalsIgnoreCase("start")) {
            if ($.TicketRaffleRunning) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.raffle-already-opened"));
                return;
            }
           
            $.TicketRaffleMaxEntries = 0;
            $.Followers = false;
            $.Subscribers = false;
            $.Time = 0;
            $.TicketRaffleEntries = [];
            var i = 1;
            var key = "";

            if (args[i] != null && args[i] != undefined && !isNaN(args[i])) {
                $.TicketRaffleMaxEntries = parseInt(args[i]);
                i++;
            }  
            if (args[i] != null && args[i] != undefined && (args[i].equalsIgnoreCase('followers') || args[i].equalsIgnoreCase('(followers)'))) {
                $.Followers = true;
                key = $.lang.get("net.phantombot.ticketrafflesystem.following2");
                i++;
            } 
            if (args[i] != null && args[i] != undefined && (args[i].equalsIgnoreCase('subscribers') || args[i].equalsIgnoreCase('(subscribers)'))) {
                $.Subscribers = true;
                key = $.lang.get("net.phantombot.ticketrafflesystem.subscribed");
                i++;
            } 
            if (args[i] != null && args[i] != undefined && !isNaN(args[i])) {
                $.Time = parseInt(args[i]);
                i++;
            }

            if ($.TicketRaffleMaxEntries == 0) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.user-error"));
                return;
            } else if ($.Time >= 1) {
                $.timer.addTimer("./systems/ticketraffleSystem.js", "ttraffle", true, function() {
                    $.timer.clearTimer("./systems/ticketraffleSystem.js", "ttraffle", true);
                    $.say($.lang.get("net.phantombot.ticketrafflesystem.auto-close2", ($.Time / 2)));
                    return;
                }, ($.Time * 60 * 1000) / 2);

                $.timer.addTimer("./systems/ticketraffleSystem.js", "traffle", true, function() {
                    $.timer.clearTimer("./systems/ticketraffleSystem.js", "traffle", true);
                    $.TicketRaffleRunning = false;
         
                    var Winner = $.TicketRaffleEntries[$.randRange(1, $.TicketRaffleEntries.length) - 1];
             
                    if (Winner == null) {
                        $.say($.lang.get("net.phantombot.ticketrafflesystem.no-winner"));
                        $.inidb.RemoveFile('traffleplayer');
                        return;
                    } else {
                        $.say($.lang.get("net.phantombot.ticketrafflesystem.winner", Winner));
                        $.inidb.set('traffle', 'lastwinner', Winner);
                        $.inidb.RemoveFile('traffleplayer');
                        return;
                    }
                }, $.Time * 60 * 1000);

                if (key == "") {
                    $.say($.lang.get("net.phantombot.ticketrafflesystem.raffle-opened", MaxEntries));
                    $.say($.lang.get("net.phantombot.ticketrafflesystem.auto-close", $.Time));
                    $.TicketRaffleRunning = true;
                } else {
                    $.say($.lang.get("net.phantombot.ticketrafflesystem.raffle-opened2", MaxEntries, key));
                    $.say($.lang.get("net.phantombot.ticketrafflesystem.auto-close", $.Time));
                    $.TicketRaffleRunning = true;
                    return;
                }
            } else if (key == "") {
                $.say($.lang.get("net.phantombot.ticketrafflesystem.raffle-opened", MaxEntries));
                $.TicketRaffleRunning = true;
            } else {
                $.say($.lang.get("net.phantombot.ticketrafflesystem.raffle-opened2", MaxEntries, key));
                $.TicketRaffleRunning = true;
                return;
            }
        }
    }
});

$.registerChatCommand("./systems/ticketraffleSystem.js", "traffle");
