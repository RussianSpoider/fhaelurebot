if ($.commandList == null || $.commandList == undefined) {
    $.commandList = new Array();
}

if ($.customCommandList == null || $.customCommandList == undefined) {
    $.customCommandList = new Array();
}

$.commandsPerPage = 20;

$.registerChatCommand = function(script, command, group) {
    var scriptFile = script.replace("\\", "/").replace("./scripts/", "");
    var i;
    
    if (group == null || group == undefined) {
        group = "";
    }
    
    if (command == null || command == undefined) {
        return;
    }
    
    for (i = 0; i < $.commandList.length; i++) {
        if ($.commandList[i][1].equalsIgnoreCase(command)) {
            if (!$.commandList[i][0].equalsIgnoreCase(scriptFile)) {
                $.logError("commandList.js", 26, "Command already registered (" + command + ", " + $.commandList[i][0] + ", " + scriptFile + ")");
            }
            
            return;
        }
    }
    
    for (i = 0; i < $.customCommandList.length; i++) {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            if (!$.customCommandList[i][0].equalsIgnoreCase(scriptFile)) {
                $.logError("commandList.js", 36, "Command already registered (" + command + ", " + $.customCommandList[i][0] + ", " + scriptFile + ")");
            }
            
            return;
        }
    }
        
    $.commandList.push(new Array(scriptFile, command, group));
}

$.unregisterChatCommand = function(command) {
    for (var i = 0; i < $.commandList.length; i++) {
        if ($.commandList[i][1].equalsIgnoreCase(command)) {
            $.commandList.splice(i, 1);
            break;
        }
    }
}

$.registerCustomChatCommand = function(script, command) {
    var scriptFile = script.replace("\\", "/").replace("./scripts/", "");
    var i;
    
    if (command == null || command == undefined) {
        return;
    }
    
    for (i = 0; i < $.commandList.length; i++) {
        if ($.commandList[i][1].equalsIgnoreCase(command)) {
            if (!$.commandList[i][0].equalsIgnoreCase(scriptFile)) {
                $.logError("commandList.js", 66, "Command already registered (" + command + ", " + $.commandList[i][0] + ", " + scriptFile + ")");
            }
            
            return;
        }
    }
    
    for (i = 0; i < $.customCommandList.length; i++) {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            if (!$.customCommandList[i][0].equalsIgnoreCase(scriptFile)) {
                $.logError("commandList.js", 76, "Command already registered (" + command + ", " + $.customCommandList[i][0] + ", " + scriptFile + ")");
            }
            
            return;
        }
    }
        
    $.customCommandList.push(new Array(scriptFile, command, ""));
}

$.setCustomChatCommandGroup = function(command, group) {
    for (i = 0; i < $.customCommandList.length; i++)
    {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            $.customCommandList[i][2] = group;
            
            return;
        }
    }
}

$.unregisterCustomChatCommand = function(command) {
    for (var i = 0; i < $.customCommandList.length; i++) {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            customCommandList.splice(i, 1);
            break;
        }
    }
}

$.commandExists = function(command) {
    var i;
    
    for (i = 0; i < $.commandList.length; i++)
    {
        if ($.commandList[i][1].equalsIgnoreCase(command)) {
            return true;
        }
    }
    
    for (i = 0; i < $.customCommandList.length; i++)
    {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            return true;
        }
    }
    
    return false;
}

$.isCustomCommand = function(command) {
    var i;
    
    for (i = 0; i < $.customCommandList.length; i++)
    {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            return true;
        }
    }
    
    return false;
}

$.getCommandGroup = function(command) {
    var i;
    
    for (i = 0; i < $.commandList.length; i++)
    {
        if ($.commandList[i][1].equalsIgnoreCase(command)) {
            return $.commandList[i][2];
        }
    }
    
    for (i = 0; i < $.customCommandList.length; i++)
    {
        if ($.customCommandList[i][1].equalsIgnoreCase(command)) {
            return $.customCommandList[i][2];
        }
    }
    
    return "";
}

$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var args = event.getArgs();
    
    if (command.equalsIgnoreCase("botcommands")) { // !botcommands for bot commands and !commands for custom commands.
        var cmdList = "";
        var length = 0;
        var start = 0;
        var num = length;
        var page = "";
        var numPages = 1;
        var more = ""
        var commandsPerPage = $.commandsPerPage;
        var i;        
        for (i = 0; i < $.commandList.length; i++) {
            if (i < $.commandList.length) {
                if ($.moduleEnabled($.commandList[i][0]) && (($.commandList[i][2].equalsIgnoreCase("admin") && $.isAdmin(sender))
                    || ($.commandList[i][2].equalsIgnoreCase("mod") && $.isModv3(sender, event.getTags()))
                    || ($.commandList[i][2].equalsIgnoreCase("caster") && $.isAdmin(sender)) || $.commandList[i][2].equalsIgnoreCase(""))) {
                    length++;
                }
            }
        }
        
        if (commandsPerPage == null) {
            commandsPerPage = 20;
        }
        
        if (length > commandsPerPage) {
            numPages = Math.ceil(length / commandsPerPage);
            num = 1
            var i;
            
            if (args.length > 0 && !isNaN(parseInt(args[0]))) {
                start = commandsPerPage * (parseInt(args[0]) - 1);
                
                page = $.lang.get("net.quorrabot.commandlist.page", args[0], numPages);
            } else {
                page = $.lang.get("net.quorrabot.commandlist.page", 1, numPages);
            }
            
            num = Math.min(commandsPerPage, length - start);
            more = $.lang.get("net.quorrabot.commandlist.more");
        } else {
            num = length;
        }
        
        if (parseInt(args[0]) > numPages) {
            return;
        }
        
        for (i = 0; i < $.commandList.length; i++) {
            if (i > start) {
                break;
            }
            
            if (i < $.commandList.length) {
                if (!$.moduleEnabled($.commandList[i][0]) || !(($.commandList[i][2].equalsIgnoreCase("admin") && $.isAdmin(sender))
                    || ($.commandList[i][2].equalsIgnoreCase("mod") && $.isModv3(sender, event.getTags()))
                    || ($.commandList[i][2].equalsIgnoreCase("caster") && $.isAdmin(sender)) || $.commandList[i][2].equalsIgnoreCase(""))) {
                    start++;
                }
            }
        }
        
        for (i = start; num > 0; i++) {
            if (i < $.commandList.length) {
                if (!$.moduleEnabled($.commandList[i][0]) || !(($.commandList[i][2].equalsIgnoreCase("admin") && $.isAdmin(sender))
                    || ($.commandList[i][2].equalsIgnoreCase("mod") && $.isModv3(sender, event.getTags()))
                    || ($.commandList[i][2].equalsIgnoreCase("caster") && $.isAdmin(sender)) || $.commandList[i][2].equalsIgnoreCase(""))) {
                    continue;
                }
            }
            
            if (cmdList.length > 0) {
                cmdList = cmdList + " - ";
            }
            
            if (i < $.commandList.length) {
                cmdList = cmdList + "!" + $.commandList[i][1];
            }
            
            num--;
        }
        
        if (length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.commandlist.nocommands"));
        } else {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.commandlist.botcommands") + page + ": " + cmdList + more);
        }
    }
    
    if (command.equalsIgnoreCase("commands")) { // !botcommands for bot commands and !commands for custom commands.
        var cmdList = "";
        var length = 0;
        var start = 0;
        var num = length;
        var page = "";
        var numPages = 1;
        var more = ""
        var commandsPerPage = $.commandsPerPage;
        var i;        
        for (i = 0; i < $.customCommandList.length; i++) {
            if ($.moduleEnabled($.customCommandList[i][0])
                && (($.customCommandList[i][2].equalsIgnoreCase("admin") && $.isAdmin(sender))
                    || ($.customCommandList[i][2].equalsIgnoreCase("mod") && $.isModv3(sender, event.getTags()))
                    || ($.customCommandList[i][2].equalsIgnoreCase("caster") && $.isAdmin(sender))
                    || $.customCommandList[i][2].equalsIgnoreCase(""))) {
                length++;
            }
        }
        
        if (commandsPerPage == null) {
            commandsPerPage = 20;
        }
        
        if (length > commandsPerPage) {
            numPages = Math.ceil(length / commandsPerPage);
            num = 1
            var i;
            
            if (args.length > 0 && !isNaN(parseInt(args[0]))) {
                start = commandsPerPage * (parseInt(args[0]) - 1);
                
                page = $.lang.get("net.quorrabot.commandlist.page", args[0], numPages);
            } else {
                page = $.lang.get("net.quorrabot.commandlist.page", 1, numPages);
            }
            
            num = Math.min(commandsPerPage, length - start);
            more = $.lang.get("net.quorrabot.commandlist.morecustom");
        } else {
            num = length;
        }
        
        if (parseInt(args[0]) > numPages) {
            return;
        }
        
        for (i = 0; i < $.customCommandList.length; i++) {
            if (i > start) {
                break;
            }
            
            if (i < $.customCommandList.length) {
                if (!$.moduleEnabled($.customCommandList[i][0])
                    || !(($.customCommandList[i][2].equalsIgnoreCase("admin") && $.isAdmin(sender))
                        || ($.customCommandList[i][2].equalsIgnoreCase("mod") && $.isModv3(sender, event.getTags()))
                        || ($.customCommandList[i][2].equalsIgnoreCase("caster") && $.isAdmin(sender))
                        || $.customCommandList[i][2].equalsIgnoreCase(""))) {
                    start++;
                }
            }
        }
        
        for (i = start; num > 0; i++) {
            if (i < $.customCommandList.length) {
                if (!$.moduleEnabled($.customCommandList[i][0])
                    || !(($.customCommandList[i][2].equalsIgnoreCase("admin") && $.isAdmin(sender))
                        || ($.customCommandList[i][2].equalsIgnoreCase("mod") && $.isModv3(sender, event.getTags()))
                        || ($.customCommandList[i][2].equalsIgnoreCase("caster") && $.isAdmin(sender))
                        || $.customCommandList[i][2].equalsIgnoreCase(""))) {
                    continue;
                }
            }
            
            if (cmdList.length > 0) {
                cmdList = cmdList + " - ";
            }
            
            if (i < $.customCommandList.length) {
                cmdList = cmdList + "!" + $.customCommandList[i][1];
            }
            
            num--;
        }
        
        if (length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.commandlist.nocommands"));
        } else {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.commandlist.commands") + page + ": " + cmdList + more);
        }
    }

    
    if (command.equalsIgnoreCase("commandsperpage")) {
        if (args.length > 0 && !isNaN(parseInt(args[0])) && parseInt(args[0]) >= 10 && $.isAdmin(sender)) {
            $.logEvent("commandList.js", 259, username + " changed the commands per page to " + args[0]);
            
            $.commandsPerPage = parseInt(args[0]);
            $.inidb.set("commands", "_commandsPerPage", args[0]);
            
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.commandlist.commands-per-page", args[0]));
        } else if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.cmd.adminonly"));
        } else {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.commandlist.commands-per-page-usage"));
        }
    }
});

$.registerChatCommand("./util/commandList.js", "commandsperpage", "admin");
$.registerChatCommand("./util/commandList.js", "botcommands", "mod");
$.registerChatCommand("./util/addCommand.js", "commands");

var commandsPerPage = $.inidb.get("command", "_commandsPerPage");

if (commandsPerPage != null && !isNaN(parseInt(commandsPerPage)) && parseInt(commandsPerPage) >= 10) {
    $.commandsPerPage = commandsPerPage;
}
