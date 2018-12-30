$.lang = new Array();

$.lang.curlang = "english";

if ($.inidb.exists("settings", "lang")) {
    $.lang.curlang = $.inidb.get("settings", "lang");
}

$.lang.data = new Array();

$.lang.load = function() {
    $.loadScriptForce("./lang/lang-english.js");
    
    var list = $.findFiles("./scripts/lang", "lang-english-");
    
    for (i = 0; i < list.length; i++) {
        $.loadScriptForce("./lang/" + list[i]);
    }
    
    $.loadScriptForce("./lang/lang-" + $.lang.curlang + ".js");
    
    list = $.findFiles("./scripts/lang", "lang-" + $.lang.curlang + "-");
    
    for (i = 0; i < list.length; i++) {
        $.loadScriptForce("./lang/" + list[i]);
    }
}

$.lang.load();

$.lang.get = function(str_name) {
	if ($.inidb.exists('lang', str_name)) {
		var s = $.inidb.get('lang', str_name);
	}
	else {
	    if ($.lang.data[str_name] == undefined || $.lang.data[str_name] == null) {
	        $.logError("./util/lang.js", 33, "Lang string missing: " + str_name);
	        Packages.com.gmt2001.Console.err.println("[lang.js] Lang string missing: " + str_name);
	        
	        if (str_name.equalsIgnoreCase("net.quorrabot.lang.not-exists")) {
	            return "!!! Missing string in lang file !!!";
	        } else {
	            return $.lang.get("net.quorrabot.lang.not-exists");
	        }
	    }
	    var s = $.lang.data[str_name];
	}
    
    for (var i = 1; i < arguments.length; i++) {
        var v = "$" + i.toString();
        var arg = arguments[i].toString();

        s = $.replaceAll(s, v, arg);
    }
    
    return s;
}

$.lang.setstring = function(str_name, str_value) {
	$.inidb.set('lang', str_name, str_value);
}

$.lang.resetstring = function(str_name) {
	if ($.inidb.exists('lang', str_name)) {
		$.inidb.del('lang', str_name);
	}
}

$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender, event.getTags());
    var command = event.getCommand();
    var args = event.getArgs();
    var argsString = event.getArguments().trim();
    
    if (command.equalsIgnoreCase("lang")) {
        if (!$.isAdmin(sender)) {
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;                
        }
        
        if (args.length == 0) {
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.lang.curlang", $.lang.curlang));
        } else {
            if (!$.fileExists("./scripts/lang/lang-" + args[0].toLowerCase() + ".js")) {
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.lang.lang-not-exists"));
                return; 
            } else {
                $.inidb.set("settings", "lang", args[0].toLowerCase());
                $.lang.curlang = args[0].toLowerCase();
                $.lang.load();
                
                $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.lang.lang-changed", args[0].toLowerCase()));
            }
        }
    }
});

$.registerChatCommand("./util/lang.js", "lang", "mod");
