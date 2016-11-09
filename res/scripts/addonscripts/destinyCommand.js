
$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args;
    var action;
    var avalue;
    var console;

    if (command.equalsIgnoreCase("destiny")) {
        if (argsString.toLowerCase().indexOf("xb") != -1) {
            console = argsString.toLowerCase().substring(argsString.toLowerCase().indexOf("xb"), argsString.toLowerCase().indexOf("xb") + 2)
        } else if (argsString.toLowerCase().indexOf("ps") != -1) {
            console = argsString.toLowerCase().substring(argsString.toLowerCase().indexOf("ps"), argsString.toLowerCase().indexOf("ps") + 2)
        } else {
            if ($.ConsoleCommand.CurrentConsole.toLowerCase().indexOf("xb") != -1) {
                console = "xb";
            } else if ($.ConsoleCommand.CurrentConsole.toLowerCase().indexOf("ps") != -1) {
                console = "ps";
            } else {
                console = "none"
            }
        }
        if (console == "none") {
            $.say($.getWhisperString(sender) + "You must set a console first with !console XBox One/PS4");
            return;
        }
        var msg = $.urlEncode("(urlencode $1)", argsString);
        $.say($.getWhisperString(sender) +
                $.customAPI("(customapi https://2g.be/twitch/destinyv2.php?query=" + msg + "&user=" + sender + "&bot=quorrabot&defaultconsole=" + console + ")", command, args, sender));
    }
});

if ($.moduleEnabled('./addonscripts/destinyCommand.js')) {
    $.registerChatCommand("./addonscripts/destinyCommand.js", "destiny");
    $.println('Destiny stats API module loaded.');
}
;

