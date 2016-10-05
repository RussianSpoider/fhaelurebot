$.ConsoleCommand = {
    CurrentConsoleMsg: ($.inidb.get('console', 'consolemsg') ? $.inidb.get('console', 'consolemsg') : $.lang.get("net.quorrabot.consolecommand.consolemessage")),
    CurrentConsole: ($.inidb.get('console', 'current_console') ? $.inidb.get('console', 'current_console') : "PC"),
    ConsolesList: "",
};

$.getOtherConsoles = function() {
$.ConsoleCommand.ConsolesList = "";
var consolesList = $.inidb.GetKeyList('console', '');
    for(var i=0; i<consolesList.length; i++) {
        if(consolesList[i]!=null) {
            if($.inidb.get("console", "console_" + i)!=null) {
                var consolestring = $.inidb.get("console", "console_" + i);
                if($.ConsoleCommand.CurrentConsole.toLowerCase()!= consolestring.toLowerCase()) {
                    $.ConsoleCommand.ConsolesList += consolestring + " ";
                }
            }
        }
    }
    if($.ConsoleCommand.ConsolesList.substring($.ConsoleCommand.ConsolesList.length - 1, $.ConsoleCommand.ConsolesList.length) == " ") {
        $.ConsoleCommand.ConsolesList = $.ConsoleCommand.ConsolesList.substring(0, $.ConsoleCommand.ConsolesList.length - 1);
    }
};

            
$.on('command', function (event) {
    var sender = event.getSender();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var argsString = event.getArguments().trim();
    var args = event.getArgs();
    var commandString;
    var message;
    
    if (command.equalsIgnoreCase("console")) {
        if(args[0]==null) {
            $.getOtherConsoles();
            var consoleM = $.ConsoleCommand.CurrentConsoleMsg;
            consoleM = $.replaceAll(consoleM, "(console)", $.ConsoleCommand.CurrentConsole);
            consoleM = $.replaceAll(consoleM, "(consoleslist)", $.ConsoleCommand.ConsolesList);
            $.say(consoleM);
            return;
        } else {
            if (!$.isModv3(sender, event.getTags())) {
                $.say($.getWhisperString(sender) + $.modmsg);
                return;
            }
            if(args[1]!=null) {
                //usage: !console message I am currently playong on (console), however I also own the following: (otherconsoles)
                if(args[0].equalsIgnoreCase("message")) {
                    var consoleMsg = argsString.substring(argsString.indexOf(args[1]), argsString.length());
                    $.inidb.set("console","consolemsg", consoleMsg);
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.consolecommand.consolemsg-set", consoleMsg));
                    return;
                    
                }
                //usage: !console other xbox ps4 pc
                if(args[0].equalsIgnoreCase("listadd")) {
                    for(var i=1;i<args.length;i++) {
                        $.inidb.set("console","console_" + i.toString(), args[i]);
                    }
                    $.getOtherConsoles();
                    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.consolecommand.console-others-set", $.ConsoleCommand.ConsolesList));
                    return;
                }
            }
            var console = "";
            if(args[0].contains("360")) {
                console = "Xbox 360";
            } else if (args[0].equalsIgnoreCase("xb1") || args[0].equalsIgnoreCase("xbone") || args[0].equalsIgnoreCase("xbox one") || args[0].equalsIgnoreCase("xbox")){
                console = "Xbox";
            } else {
                console = args[0];
            }
            $.inidb.set("console","current_console", console);
            $.ConsoleCommand.CurrentConsole =  console;
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.consolecommand.console-set",  console));
            return;
        }
    }
});

