$.ticketCost = parseInt($.inidb.get("settings", "ticketcost"));

if ($.ticketCost == null || $.ticketCost == undefined || isNaN($.ticketCost)) {
    $.ticketCost = 10;
}

$.on('command', function (event) {
    var sender = event.getSender().toLowerCase();
    var command = event.getCommand();
    var args = event.getArgs();
   
    if (command.equalsIgnoreCase("tickets")) {
        if (!$.TicketRaffleRunning) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.no-raffle-opened"));
            return;
        } else if (args.length < 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketsystem.usage", $.ticketCost));
            return;
        } else if ($.ticketCost > $.inidb.get('points', sender)) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketsystem.need-more-points"));
            return;
        } else if ($.TicketRaffleMaxEntries < parseInt(args[0])) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketsystem.max-tickets-allowed", $.TicketRaffleMaxEntries));
            return;
        } else if ($.inidb.exists('traffleplayer', sender)) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketsystem.error-already-in-raffle"));
            return;
        }
        if ($.Followers) {
            var CheckUser = $.twitch.GetUserFollowsChannel(sender, $.channelName);
            if (CheckUser.getInt('_http') != 200) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.following"));
                return;
            }
        } else if ($.Subscribers) {
            if (!$.isSubv3(sender, event.getTags())) { 
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketrafflesystem.no-sub"));
                return;
            }
        }
        var tickets = parseInt(args[0]);
        if (!$.isSubv3(sender, event.getTags())) { 
            for (var i = 0; i < (tickets * $.SubscriberLuck); i++) {
                $.TicketRaffleEntries.push(sender);
            }
        } else {
            for (var i = 0; i < tickets; i++) {
                $.TicketRaffleEntries.push(sender);
            }
        }
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketsystem.buy-success", tickets));
        $.inidb.set('traffleplayer', sender, 'true');
        $.inidb.decr('points', sender, (tickets * $.ticketCost));
        return;
    }

    if (command.equalsIgnoreCase("entries")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.cmd.adminonly"));
            return;
        }
        $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketsystem.total-entries", $.TicketRaffleEntries.length));
        return;
    }

    if (command.equalsIgnoreCase("ticket")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.cmd.adminonly"));
            return;
        }
        if (args.length < 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.ticketsystem.cost-usage"));
            return;
        }

        if (args[0].equalsIgnoreCase("cost")) {
            $.inidb.set('settings', 'ticketcost', parseInt(args[1]));
            $.say($.lang.get("net.phantombot.ticketsystem.new-cost", parseInt(args[1]), "point(s)"));
            return;
        }
    }
});

$.registerChatCommand("./systems/ticketSystem.js", "ticket");
