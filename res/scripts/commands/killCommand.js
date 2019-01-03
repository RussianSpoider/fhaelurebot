$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var num2 = $.users.length;
    var rnd = $.rand(num2);
    var killPerson = $.users[rnd][0];
    var argsString = event.getArguments().trim();
    var argsString2 = "";
    if(argsString.contains(" ")) {
        argsString2 = argsString.substring(argsString.indexOf(argsString.split(" ")[1]));
    }
    var args = event.getArgs();
    var num_kills = parseInt($.inidb.get("kills", "num_kills"));
    var killNum = $.randRange(1, 100);
    var num;

    if (command.equalsIgnoreCase("kill") && args.length > 0) {

        num = $.rand(num_kills);

        if (isNaN(num_kills) || num_kills == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.error-no-kills"));
            return;
        }

        if ($.inidb.get("kills", "kill_" + num) == " ") {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.num-kills", num_kills, (num_kills - 1)));
            return;
        }
    } else if (command.equalsIgnoreCase("kill") && args.length == " ") {
        var self = new Array(0)
        sender = $.username.resolve(sender, event.getTags());

	var commandPrefix = "net.quorrabot.killcommand.self-kill-";
        for (var i = 1; i <= 30; i++) {
	    self.push($.lang.get(commandPrefix.concat(i), sender));
        }
        
	self.push($.lang.get("net.quorrabot.killcommand.self-kill-30", sender));

        do {
            s = $.randElement(self);
        } while (s.replace(sender, "").equalsIgnoreCase($var.lastRandom) && self.length > 1);

        $var.lastRandom = s.replace(sender, "");

        $.say(s);
        return;
    }

    if (command.equalsIgnoreCase("addkill")) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }

        if (num_kills == null || isNaN(num_kills)) {
            num_kills = 0;
        }

        if (argsString.isEmpty()) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.addkill-usage"));
            return;
        }

        $.inidb.incr("kills", "num_kills", 1);
        $.inidb.set("kills", "kill_" + num_kills, argsString);

        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.kill-added", (num_kills + 1)));
        return;
    }

    if (command.equalsIgnoreCase("getkill")) {
        if (!$.inidb.get("kills", "kill_" + parseInt(args[0])) == " ") {
            $.say($.inidb.get("kills", "kill_" + parseInt(args[0])));
        } else {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.error-wrong-id", num_kills, num_kills, args[0]));
            return;
        }
    }

    if (command.equalsIgnoreCase("editkill")) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }

        num = parseInt(args[0]);

        if (num > num_kills) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.error-wrong-id", num_kills, num_kills, args[0]));
            return;
        }

        if (argsString2.isEmpty() || argsString.isEmpty() || args[1] == null) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.edit-kill-usage"));
            return;
        }

        $.inidb.set("kills", "kill_" + num, argsString2);

        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.kill-edited", num, $.inidb.get("kills", "kill_" + num)));
        return;
    }

    if (command.equalsIgnoreCase("delkill")) {
        if (!$.isModv3(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }

        if (num_kills == null || isNaN(num_kills) || num_kills == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.error-no-kills"));
            return;
        }

        if (argsString.isEmpty()) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.del-kill-usage"));
            return;
        }

        if (num_kills > 1) {
            for (i = 0; i < num_kills; i++) {
                if (i > parseInt(argsString)) {
                    $.inidb.set('kills', 'kill_' + (i - 1), $.inidb.get('kills', 'kill_' + i))
                }
            }
        }

        $.inidb.del('kills', 'kill_' + (num_kills - 1));

        $.inidb.decr("kills", "num_kills", 1);

        $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.killcommand.del-kill-success", (num_kills - 1)));
        return;
    }

    var messageCommand = $.inidb.get('kills', 'kill_' + num);

    if (messageCommand) {
        for (var i = 0; i < args.length; i++) {
            messageCommand = $.replaceAll(messageCommand, '(' + (i + 1) + ')', args[i]);
        }
        if (messageCommand.contains('(sender)')) {
            messageCommand = $.replaceAll(messageCommand, '(sender)', sender);
        }
        if (messageCommand.contains('(count)')) {
            $.inidb.incr('commandcount', command.toLowerCase(), 1);
        } 
        if (messageCommand.contains('(touser)') >= 0 && args.length > 0) {
            messageCommand = $.replaceAll(messageCommand, '(touser)', $.username.resolve(args[0]));
        }
        if (messageCommand.contains('(random)')) {
            messageCommand = $.replaceAll(messageCommand, '(random)', $.users[$.rand($.users.length)][0]);
        }
        if (messageCommand.contains('(#)')) {
            messageCommand = $.replaceAll(messageCommand, '(#)', $.randRange(1, 100));
        } 
        if (messageCommand.contains('(count)')) {
            messageCommand = $.replaceAll(messageCommand, '(count)', $.inidb.get('commandcount', command.toLowerCase()));
        }

        $.say(messageCommand);
    }
});

var ar = new Array(0);
var killCommandPrefix = "net.quorrabot.killcommand.kill-";

for (var i = 1; i <= 27; i++) {
    ar.push($.lang.get(killCommandPrefix.concat(i)));
}

if ($.inidb.get("kills", "num_kills") == null || $.inidb.get("kills", "num_kills") == 0) {

    $.inidb.set("kills", "num_kills", ar.length);
    for (var i = 0; i < ar.length; ++i) {
        $.inidb.set('kills', 'kill_' + i, ar[i]);
    }
}

    if ($.moduleEnabled('./commands/killCommand.js')) {
        $.registerChatCommand("./commands/killCommand.js", "kill");
    }
