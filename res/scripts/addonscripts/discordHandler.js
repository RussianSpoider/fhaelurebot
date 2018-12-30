/**
 * The discord event gets a message event from Discord. This event contains the name
 * of the text channel, the user that sent the message in the channel, and the message.
 *
 * This is provided as a simplistic framework. It is not advised to attempt to run 
 * commands from Discord or attempt to call any of the other modules in QuorraBot
 * as those commands are meant to interact specifically with Twitch. Feel free to 
 * access the database, language entries, and items such as that, but do not attempt
 * to utilize any of the commands directly.
 *
 * Messages may be sent back to Discord using the following method:
 *     $.discord.sendMessage({String} channelName, {String} message);
 *
 * Note that the API indicates that there is a rate limit of 10 messages in 10 seconds.
 * The sendMessage() method therefore is rate limited and will only send one message
 * once every second. No burst logic is provided. 
 *
 * If you wish to use Discord, you will need to follow the directions on the following
 * website to register for an application and create a token to place into botlogin.txt.
 *
 *     https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token
 *
 */

$.DiscordHandler = {
    discordAnnounce: false,
    discordToggleAnnounce: ($.inidb.get('settings', 'discordannounce') ? $.inidb.get('settings', 'discordannounce') : "false"),
    discordAnnounceMsg: ($.inidb.get('settings', 'discordmessage') ? $.inidb.get('settings', 'discordmessage') : $.lang.get('net.quorrabot.discord.streamonline')),
};

/*
 * @event discord
 */
$.on('discord', function (event) {
    var discordChannel = event.getDiscordChannel(),
            discordUser = event.getDiscordUser(),
            discordUserMentionAs = event.getDiscordUserMentionAs(),
            discordMessage = event.getDiscordMessage();
});

$.discordSay = function (message) {
    $.discord.sendMessage($.discordMainChannel, message);
};
	function setGame(game) {
		$.discordAPI.setGame(game);
	}

	function setStream(game, url) {
		$.discordAPI.setStream(game, url);
	}

	function removeGame() {
		$.discordAPI.removeGame();
	}

//Send message to discord channel if streamer is online
$.discordAnnounce = function () {
    if ($.isOnline($.channelName) == true) {
        if ($.DiscordHandler.discordAnnounce == false && $.DiscordHandler.discordToggleAnnounce == "true") {
            var message = $.DiscordHandler.discordAnnounceMsg;
            message = replaceAll(message, '(streamer)', $.username.resolve($.channelName));
            message = replaceAll(message, '(caster)', $.username.resolve($.channelName));
            message = replaceAll(message, '(title)', $.getStatus($.channelName));
            message = replaceAll(message, '(game)', $.getGame($.channelName));
            message = replaceAll(message, '(twitchchannel)', 'http://www.twitch.tv/' + $.channelName.toLowerCase());
            $.discordSay(message);
            $.DiscordHandler.discordAnnounce = true;
        }
    } else {
        $.DiscordHandler.discordAnnounce = false;
    }
};



$.on('command', function (event) {
    var command = event.getCommand().toString(),
            sender = event.getSender(),
            argsString = event.getArguments().trim(),
            args = argsString.split(" "),
            action = args[0];

    //use discordchat for command so it doesnt interfere with preexisting !discord commands
    if (command.equalsIgnoreCase("discordchat")) {
        if (!$.isModv3(sender)) {
            $.say($.getWhisperString(sender) + $.modmsg);
            return;
        }
        if (args[0] == null) {
            $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.discord.usage'));
            return;
        }
        if (action.equalsIgnoreCase("say")) {
            if (args[1] == null) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.discord.nomessage'));
                return;
            }
            if ($.moduleEnabled('./addonscripts/discordHandler.js')) {
                var message = argsString.substring(argsString.indexOf(args[1]));

                message = replaceAll(message, '(streamer)', $.username.resolve($.channelName));
                message = replaceAll(message, '(caster)', $.username.resolve($.channelName));
                message = replaceAll(message, '(title)', $.getStatus($.channelName));
                message = replaceAll(message, '(game)', $.getGame($.channelName));
                message = replaceAll(message, '(twitchchannel)', 'http://www.twitch.tv/' + $.channelName.toLowerCase());

                $.discordSay(message);
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.discord.messagesent'));
                return;
            }
        }

        if (action.equalsIgnoreCase("announce")) {
            if (args[1] == null) {
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.discord.announce.nooption'));
                return;
            }
            if (args[1] == "true") {
                $.inidb.set('settings', 'discordannounce', "true");
                $.DiscordHandler.discordToggleAnnounce = true;
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.discord.announce.enabled'));
                return;
            } else {
                $.inidb.set('settings', 'discordannounce', "false");
                $.DiscordHandler.discordToggleAnnounce = false;
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.discord.announce.disabled'));
                return;
            }
        }

        if (action.equalsIgnoreCase("announcemsg")) {
            if (args[1] == null) {
                $.say($.getWhisperString(sender) + $.DiscordHandler.discordAnnounceMsg);
                return;
            } else {
                var message = argsString.substring(argsString.indexOf(args[1]));
                $.DiscordHandler.discordAnnounceMsg = message;
                $.inidb.set('settings', 'discordmessage', message);
                $.say($.getWhisperString(sender) + $.lang.get('net.quorrabot.discord.custommessage.set'));
                return;
            }
        }
    }
       if (command.equalsIgnoreCase("redeem")) {
        if (args[0] == null) {
            $.say($.lang.get('net.quorrabot.redeem.usage'));
            return;
        }

            if ($.moduleEnabled('./addonscripts/discordHandler.js')) {
                var message = argsString.substring(argsString.indexOf(args[0]));

                message = replaceAll(message, '(streamer)', $.username.resolve($.channelName));
                message = replaceAll(message, '(caster)', $.username.resolve($.channelName));
                message = replaceAll(message, '(title)', $.getStatus($.channelName));
                message = replaceAll(message, '(game)', $.getGame($.channelName));
                message = replaceAll(message, '(twitchchannel)', 'http://www.twitch.tv/' + $.channelName.toLowerCase());

                $.discordSay($.getWhisperString(sender) + "Has redeemed " + message);
                $.say($.getWhisperString(sender) + "A mod will contact you shortly. fhaeBae");
                return;
            }
        }
		if (command.equalsIgnoreCase('setdgame')) {
			if (args[0] == null) {
				say(channel, userPrefix(mention) + $.lang.get('discord.misc.game.set.usage'));
				return;
			}

			setGame(args.join(' '));
			say(channel, userPrefix(mention) + $.lang.get('discord.misc.game.set', args.join(' ')));
		}

		if (command.equalsIgnoreCase('setdstream')) {
			if (args[0] == null) {
				say(channel, userPrefix(mention) + $.lang.get('discord.misc.game.stream.set.usage'));
				return;
			}

			setStream(action, args.slice(1).join(' '));
			say(channel, userPrefix(mention) + $.lang.get('discord.misc.game.stream.set', action, args.slice(1).join(' ')));
		}

		if (command.equalsIgnoreCase('removedgame')) {
			removeGame();
			say(channel, userPrefix(mention) + $.lang.get('discord.misc.game.removed'));
		}
});

if ($.moduleEnabled('./addonscripts/discordHandler.js')) {
    $.registerChatCommand("./addonscripts/discordHandler.js", "discordchat");
    $.registerChatCommand("./addonscripts/discordHandler.js", "setdgame");
    $.registerChatCommand("./addonscripts/discordHandler.js", "setdstream");
    $.registerChatCommand("./addonscripts/discordHandler.js", "removedgame");
    $.registerChatCommand("./addonscripts/discordHandler.js", "redeem");
    if ($.DiscordHandler.discordToggleAnnounce == "true") {
        $.timer.addTimer("./addonscripts/discordHandler.js", "discordannounce", true, function () {
            $.discordAnnounce();
        }, 15 * 1000);
    }
    $.println('Discord API module loaded.');
}
;
