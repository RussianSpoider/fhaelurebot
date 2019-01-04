var arrballlimiter = new Array();

$.on('command', function (event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var ballcost = $.inidb.get('settings', 'ballcost');
    var points = $.inidb.get('points', sender);


    if (command.equalsIgnoreCase("8ball")) {

        if (args.length == 0 || args.length == null) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.8ballCommand.proper-usage"));
            return;
        }

        var ball = new Array();
	
        var ballCommandPrefix = "net.quorrabot.8ballCommand.answer-";
        for (var i = 1; i <= 33; i++) {
            ball.push($.lang.get(ballCommandPrefix.concat(i)));
        }

        do {
            b = $.randElement(ball);
        } while (b.equalsIgnoreCase($var.lastRandom) && ball.length > 1);

        $.say("Magic 8-ball says... " + b);
        return;
    }


});
if ($.moduleEnabled('./commands/8ballCommand.js')) {
    $.registerChatCommand("./commands/8ballCommand.js", "8ball");
}
