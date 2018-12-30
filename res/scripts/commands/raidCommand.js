var arrballlimiter = new Array();

$.on('command', function(event) {
var sender = event.getSender();
var username = $.username.resolve(sender);
var command = event.getCommand();
var argsString = event.getArguments().trim();
var args = event.getArgs();
var ballcost = $.inidb.get('settings', 'raidcomcost');
var points = $.inidb.get('raidcom', sender);

     if (command.equalsIgnoreCase("raidcom")) {
        if (!$.isadmin(sender, event.getTags())) {
            $.say($.getWhisperString(sender) + $.modmsg);
        }
		if (argsString.isEmpty()) { 
            $.say($.getWhisperString(sender) + $.lang.get("net.quorrabot.saycommand.usage"));
        } else {
            $.inidb.set(argsString);
            $.say(argsString);
            return;
        }
};
    if ($.moduleEnabled('./commands/raidcomCommand.js')) {
$.registerChatCommand("./commands/raidcomCommand.js", "Raidcom");
}
},10 * 1000);

