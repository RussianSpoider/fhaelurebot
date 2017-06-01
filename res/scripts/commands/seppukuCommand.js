$.seppukutimeout = $.inidb.get('settings', 'seppukutimeout');
if ($.seppukutimeout === undefined || $.seppukutimeout === null || isNaN($.seppukutimeout) || $.seppukutimeout < 1) {
    $.seppukutimeout = 600;
}

$.on('command', function(event) {
    var sender = event.getSender().toLowerCase();
    var username = $.username.resolve(sender);
    var command = event.getCommand();
    var args = event.getArgs();

    if (command.equalsIgnoreCase("seppuku")) {
        if (args.length == 0) {
            var d1 = $.randRange(1, 2);
            var d2 = $.randRange(1, 2);
            
    	 	var Win = new Array();
    	 	
    	Win.push($.lang.get("net.quorrabot.seppukucommand-Win1", username));
        Win.push($.lang.get("net.quorrabot.seppukucommand-Win2", username));
        Win.push($.lang.get("net.quorrabot.seppukucommand-Win3", username));
        Win.push($.lang.get("net.quorrabot.seppukucommand-Win4", username));
        Win.push($.lang.get("net.quorrabot.seppukucommand-Win5", username));
        Win.push($.lang.get("net.quorrabot.seppukucommand-Win1", username));
        Win.push($.lang.get("net.quorrabot.seppukucommand-Win2", username));
        Win.push($.lang.get("net.quorrabot.seppukucommand-Win3", username));
	    Win.push($.lang.get("net.quorrabot.seppukucommand-Win4", username));
	    Win.push($.lang.get("net.quorrabot.seppukucommand-Win5", username));
	    Win.push($.lang.get("net.quorrabot.seppukucommand-Win1", username));
    	 	
    	 	var lost = new Array();

  	    lost.push($.lang.get("net.quorrabot.seppukucommand-lost1", username));
        lost.push($.lang.get("net.quorrabot.seppukucommand-lost2", username));
	    lost.push($.lang.get("net.quorrabot.seppukucommand-lost3", username));
	    lost.push($.lang.get("net.quorrabot.seppukucommand-lost4", username));
	    lost.push($.lang.get("net.quorrabot.seppukucommand-lost5", username));
	    lost.push($.lang.get("net.quorrabot.seppukucommand-lost6", username));
	    lost.push($.lang.get("net.quorrabot.seppukucommand-lost7", username));

            var lostmod = new Array();

            lostmod.push($.lang.get("net.quorrabot.seppukucommand-lostmod1", username));
            lostmod.push($.lang.get("net.quorrabot.seppukucommand-lostmod2", username));
            lostmod.push($.lang.get("net.quorrabot.seppukucommand-lostmod3", username));
            lostmod.push($.lang.get("net.quorrabot.seppukucommand-lostmod4", username));
            lostmod.push($.lang.get("net.quorrabot.seppukucommand-lostmod5", username));
            
    	 	if (d1 == d2) {
    	 		do {
    	 			var s = $.randElement(Win);
    	 		} while (s.equalsIgnoreCase($.lastRandomWin) && Win.length > 1);
    	 		$.say(s);
                return;	
    	 	} else {
    	 		do {
    	 			var s = $.randElement(lost);  
    	 		} while (s.equalsIgnoreCase($.lastRandomlost) && lost.length > 1);
                if (!$.isModv3(sender, event.getTags())) {
                    $.say(s);
                    setTimeout(function() {$.say(".timeout "+ username +" "+ roulettetimeout);},2000);
                    setTimeout(function() {$.say(".timeout "+ username +" "+ roulettetimeout);},2000);
                    return;
                }
                var m = $.randElement(lostmod);
                while (m.equalsIgnoreCase($.lastRandomlostmod) && lostmod.length > 1);
                $.say(m);
                return;
            }
        }
    }

    if (command.equalsIgnoreCase("seppukutimeouttime")) {
        if (!$.isAdmin(sender)) {
            $.say($.adminmsg);
            return;
        }

    $.inidb.set('settings', 'seppukutimeout', parseInt(args[0]));
    $.seppukutimeout = parseInt(args[0]);
    $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.seppukucommand-timeout-time", $.seppukutimeout));
    
    }
});
$.registerChatCommand("./commands/seppukuCommand.js", "seppuku");
$.registerChatCommand("./commands/seppukuCommand.js", "seppukucooldown");
$.registerChatCommand("./commands/seppukuCommand.js", "seppukutimeouttime");
