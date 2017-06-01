println("Loading Counter script...");
$.on('command', function(event) {
	var sender = event.getSender();
	var username = $.username.resolve(sender);
	var counter = event.getCommand();
	var argsString = event.getArguments().trim();
	var args = event.getArgs();
	var commandString;
	var message;

	if(counter.equalsIgnoreCase("counters")) {
		$.say("There are currently " + counters.length + " counters. (" + counters.join(", ") + ")");
	}
	
	if(counter.equalsIgnoreCase("addcounter") ) {
		if (!$.isMod(sender)) {
			$.say($.modmsg);
			return;
		}

		commandString = args[0].toLowerCase();
		message = argsString.substring(argsString.indexOf(args[0]) + $.strlen(args[0]) + 1);
			
		if (commandString.substring(0, 1) == '!') { 
			commandString = commandString.substring(1);
		}

		if ($.commandExists(commandString)) {
			$.say("A command with that name already exists, " + username + "!");
			return;
		}
		if ($.inidb.HasKey("counters", "Messages", commandString)) {
			$.say("A command with that name already exists, " + username + "!");
			return;
		}

		$.logEvent("counterCommand.js", 50, username + " added the counter !" + commandString + " with message: " + message);

		$.inidb.SetString('counters', "Messages", commandString, message);

		$.registerCustomChatCommand("./commands/counterCommand.js", commandString);
		$.writeToFile("0", "./web/counters/" + commandString.toLowerCase() + ".txt", false);
		if (sender == $.botname) {
			println("You have successfully created the counter: !" + commandString + "");
			return;
		}
		$.say(username + ", has successfully created the counter: !" + commandString + "");
		return;
	}

	if(counter.equalsIgnoreCase("delcounter")) {
		if(args.length >= 1) {
			if (!$.isMod(sender)) {
				$.say($.modmsg);
			return;
			}

			$.logEvent("counterCommand.js", 69, username + " deleted the counter !" + commandString);

			commandString = args[0].toLowerCase();

			if (commandString.substring(0, 1) == '!') { 
				commandString = commandString.substring(1);
			}

			$.inidb.RemoveKey('counters', "Messages", commandString);
			$.inidb.RemoveKey('counters', "Permissions", commandString);
			$.inidb.RemoveKey('counters', "Prices", commandString);
			$.inidb.RemoveKey('counters', "Values", commandString);
			$.inidb.RemoveSection('counters', commandString.toLowerCase());
			$.deleteFile("./web/counters/" + commandString.toLowerCase() + ".txt", true);
			$.unregisterCustomChatCommand(commandString);
			if (sender == $.botname) {
				println("You have successfully removed the counter: !" + commandString + "");
				return;
			}
			$.say($.username.resolve(sender) + ", has successfully removed the counter !" + commandString + "");
			return;
		}
		$.say("Usage: !delcounter <counter>");
		return;
	}
    
	if (counter.equalsIgnoreCase("editcounter")) {
		if(args.length >= 1) {
			if (!$.isMod(sender)) {
				$.say($.modmsg);
				return;
			}
				
			commandString = args[0].toLowerCase();
			message = argsString.substring(argsString.indexOf(args[0]) + $.strlen(args[0]) + 1);

			if (commandString.substring(0, 1) == '!') { 
				commandString = commandString.substring(1);
			}

			if (!$.inidb.HasKey('counters', "Messages", commandString)) {
				$.say("There is no such counter, " + sender + "!");
				return;
			}

			if (message.isEmpty()) {
				$.say("Usage: !editcounter <counter> <message>");
				return;
			}


			$.inidb.SetString('counters', "Messages", commandString, message);
			if (sender == $.botname) {
				println("You have modified the counter: !" + commandString + "");
				return;
			}
			$.say(username + " has modified the counter: !" + commandString + "");
			return;
		}
		$.say("Usage: !editcounter <counter> <message>");
		return;
	}
	
	if (counter.equalsIgnoreCase("permcounter")) {
		if (!isAdmin(sender)) {
		    $.say($.adminmsg);
		    return;
		}

		if (args.length == 0) {
		    $.say("Usage: !permcounter <counter name> [user, caster, mod, admin]. Restricts usage of a custom counter to viewers with a certain permission level");
		    return;
		}

		if (args.length == 1) {
		    if (!$.inidb.exists("counters", args[0].toLowerCase())) {
			$.say("The counter !" + args[0] + " does not exist!");
			return;
		    }
		    
		    if (!$.inidb.HasKey("counters", "Permissions", args[0].toLowerCase())) {
			$.say("The counter !" + args[0] + " can be used by all viewers");
		    } else if ($.inidb.GetString("counters", "Permissions", args[0].toLowerCase()).equalsIgnoreCase("caster")) {
			$.say("The counter !" + args[0] + " can only be used by Casters");
		    } else if ($.inidb.GetString("counters", "Permissions", args[0].toLowerCase()).equalsIgnoreCase("mod")) {
			$.say("The counter !" + args[0] + " can only be used by Moderators");
		    } else if ($.inidb.GetString("counters", "Permissions", args[0].toLowerCase()).equalsIgnoreCase("admin")) {
			$.say("The counter !" + args[0] + " can only be used by Administrators");
		    }
		}

		if (args.length >= 2) {
			if (!$.inidb.HasKey("counters", "Messages", args[0].toLowerCase())) {
				$.say("The counter !" + args[0] + " does not exist!");
				return;
			}

			var newgroup = "";

			if (args[1].equalsIgnoreCase("caster") || args[1].equalsIgnoreCase("casters")) {
				$.logEvent("counterCommand.js", 142, username + " set the counter !" + args[0] + " to casters only");
				newgroup = "caster";
				$.inidb.SetString("counters", "Permissions", args[0].toLowerCase(), "caster");
				$.say("The counter !" + args[0] + " can now only be used by Casters");
			} else if (args[1].equalsIgnoreCase("mod") || args[1].equalsIgnoreCase("mods") || args[1].equalsIgnoreCase("moderator") || args[1].equalsIgnoreCase("moderators")) {
				$.logEvent("counterCommand.js", 148, username + " set the counter !" + args[0] + " to mods only");
				newgroup = "mod";
				$.inidb.SetString("counters", "Permissions", args[0].toLowerCase(), "mod");
				$.say("The counter !" + args[0] + " can now only be used by Moderators");
			} else if (args[1].equalsIgnoreCase("admin") || args[1].equalsIgnoreCase("admins") || args[1].equalsIgnoreCase("administrator") || args[1].equalsIgnoreCase("administrators")) {
				$.logEvent("counterCommand.js", 154, username + " set the counter !" + args[0] + " to admins only");
				newgroup = "admin";
				$.inidb.SetString("counters", "Permissions", args[0].toLowerCase(), "admin");
				$.say("The counter !" + args[0] + " can now only be used by Administrators");
			} else {
				$.logEvent("counterCommand.js", 159, username + " set the counter !" + args[0] + " to allow all");
				$.inidb.RemoveKey("counters", "Permissions", args[0].toLowerCase());
				$.say("The counter !" + args[0] + " can now be used by all viewers");
			}

			$.setCustomChatCommandGroup(args[0].toLowerCase(), newgroup);
		}
	}
    
	if (counter.equalsIgnoreCase("helpcounter")) {
		$.say("Usage: !addcounter <counter name> <message>, !editcounter <counter> <message>, !delcounter <counter name>, !permcounter <counter name> <group>");
	}
    
	if ($.inidb.HasKey("counters", "Messages", counter.toLowerCase())) {
		if ($.inidb.HasKey("counters", "Permissions", counter.toLowerCase())) {
			if ($.inidb.GetString("counters", "Permissions", counter.toLowerCase()).equalsIgnoreCase("caster") && !isCaster(sender)) {
				return;
			} else if ($.inidb.GetString("counters", "Permissions",  counter.toLowerCase()).equalsIgnoreCase("mod") && !isMod(sender)) {
				return;
			} else if ($.inidb.GetString("counters", "Permissions",  counter.toLowerCase()).equalsIgnoreCase("admin") && !isAdmin(sender)) {
				return;
			}
		}
		var counterMessage = "";
		counterMessage = $.inidb.GetString("counters", "Messages", counter.toLowerCase());
		var value = "";
		if (counterMessage.contains('(game)')) {
			value = $.inidb.GetInteger("counters", counter.toLowerCase(), $.getGame($.channelName).replace("[","{{").replace("]","}}"));
		} else {
			value = $.inidb.GetInteger("counters", "Values", counter.toLowerCase());
		}
		if (args.length > 1) {
			if (!isCaster(sender) && !isMod(sender)) {
				$.say("Sorry, " + sender + ", only a mod can do that.");
				return;
			} else {
				if (args[0].equalsIgnoreCase("add") || args[0].equalsIgnoreCase("+")) {
					value = value + parseInt(args[1]);
				} else if (args[0].equalsIgnoreCase("delete") || args[0].equalsIgnoreCase("remove") || args[0].equalsIgnoreCase("del") || args[0].equalsIgnoreCase("-")) {
					value = value - parseInt(args[1]);
				} else if (args[0].equalsIgnoreCase("set")) {
					value = parseInt(args[1]);
				}
			}
		} else {
			if (System.currentTimeMillis() - countersTriggered[counter.toLowerCase()] < 5000) {
				$.say("Sorry, " + sender + ", someone has already counted that.");
				return;
			} else {
				countersTriggered[counter.toLowerCase()] = System.currentTimeMillis();
				value = value;
			}
		}
		while (counterMessage.toString().contains('(number)')) {
			counterMessage = counterMessage.toString().replace('(number)', value.toString());
		}
		if (counterMessage.contains('(game)')) {
			var gameName = $.getGame($.channelName);
			var sanitizedGame = gameName;
			while (sanitizedGame.contains("[")) {
				sanitizedGame = sanitizedGame.replace("[","{{");
			}
			while (sanitizedGame.contains("]")) {
				sanitizedGame = sanitizedGame.replace("]","}}");
			}
			$.inidb.SetInteger("counters", counter.toLowerCase(), sanitizedGame, value);
			
			while (counterMessage.toString().contains('(game)')) {
				counterMessage = counterMessage.toString().replace('(game)', gameName.toString());
			}
		} else {
			$.inidb.SetInteger("counters", "Values", counter.toLowerCase(), value);
		}
		$.writeToFile(value.toString(), "./web/counters/" + counter.toLowerCase() + ".txt", false);
		$.say(counterMessage);
	}
	
	if (counter.equalsIgnoreCase("pricecounter")) {
		if (!$.isAdmin(sender) && args.length != 1) {
			$.say($.adminmsg);
			return;
		}

		if (args.length == 0) {
			$.say("Usage: !pricecounter <counter name> <price>. Sets the cost for using a counter");
			return;
		}
			
		if (args.length == 1) {
			var commandname = args[0].toLowerCase();
			if ($.inidb.HasKey("counters", "Price", commandname) && parseInt($.inidb.GetInteger("counters", "Price", commandname)) >= 0) {
				var retrieveprice = $.inidb.GetInteger("counters", "Price", commandname);
				$.say("The counter !" + commandname + " costs " + retrieveprice + " " + $.pointname + "!");
				return;
			} else {
				$.say("The counter !" + commandname + " currently costs 0 " + $.pointname + "!");
			}
		}

		if (args.length == 2) {
			var commandname = args[0].toLowerCase();
			var commandprice = parseInt(args[1]);

			if (!$.commandExists(commandname)) {
				$.say("Please select a counter that exists and is available to non-mods.");
				return;
			} else if (isNaN(commandprice) || commandprice < 0) {
				$.say("Please enter a valid price, 0 or greater.");
				return;
			} else {
				$.inidb.SetInteger("counters", "Price", commandname, commandprice);
				$.say("The price for !" + commandname + " has been set to " + commandprice + " " + $.pointname + ".");
			}
		}
	}
});

$.registerChatCommand("./commands/counterCommand.js", "addcounter", "mod");
$.registerChatCommand("./commands/counterCommand.js", "editcounter", "mod");
$.registerChatCommand("./commands/counterCommand.js", "delcounter", "mod");
$.registerChatCommand("./commands/counterCommand.js", "permcounter", "admin");
$.registerChatCommand("./commands/counterCommand.js", "helpcounter", "mod");
$.registerChatCommand("./commands/counterCommand.js", "counters", "");

var counters = $.inidb.GetKeyList("counters", "Messages");

$.updateCounters = function() {
	var gameName = oldGameName.replace("[","{{").replace("]","}}");
	for (var i = 0; i<counters.length; i++) {
		var value = $.inidb.GetInteger("counters", counters[i].toLowerCase(), gameName);
		$.writeToFile(value.toString(), "./web/counters/" + counters[i].toLowerCase() + ".txt", false);
	}
};
var countersTriggered = {};
var oldGameName = "";
$.setInterval(function() {
	if ($.getGame($.channelName).toString() != oldGameName) {
		oldGameName = $.getGame($.channelName).toString();
		$.updateCounters();
		$.say("Game updated to: " + oldGameName);
	}
}, 60 * 1000);

if ($.array.contains(counters, "counters")) {
	$.inidb.del("counters", "counters");
	counters = $.inidb.GetKeyList("counters", "Messages");
}

for (var i = 0; i < counters.length; i++) {
	$.registerCustomChatCommand("./commands/counterCommand.js", counters[i]);

	if ($.inidb.HasKey("counters", "Permissions", counters[i])) {
		$.setCustomChatCommandGroup(counters[i], $.inidb.GetString("counters", "Permissions", counters[i]));
	}
}

println("Counter script loaded and ready");
