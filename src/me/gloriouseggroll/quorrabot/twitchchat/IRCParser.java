/* 
 * Copyright (C) 2016 www.quorrabot.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package me.gloriouseggroll.quorrabot.twitchchat;

import com.google.common.collect.Maps;

import org.java_websocket.WebSocket;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.ArrayList;
import me.gloriouseggroll.quorrabot.Quorrabot;
import me.gloriouseggroll.quorrabot.cache.ChannelUsersCache;

import me.gloriouseggroll.quorrabot.event.irc.channel.IrcChannelUserModeEvent;
import me.gloriouseggroll.quorrabot.event.irc.channel.IrcChannelJoinEvent;
import me.gloriouseggroll.quorrabot.event.irc.channel.IrcChannelLeaveEvent;
import me.gloriouseggroll.quorrabot.event.irc.complete.IrcJoinCompleteEvent;
import me.gloriouseggroll.quorrabot.event.irc.message.IrcChannelMessageEvent;
import me.gloriouseggroll.quorrabot.event.irc.message.IrcPrivateMessageEvent;
import me.gloriouseggroll.quorrabot.event.irc.message.IrcModerationEvent;
import me.gloriouseggroll.quorrabot.event.irc.clearchat.IrcClearchatEvent;
import me.gloriouseggroll.quorrabot.event.twitch.bits.NewBits;
import me.gloriouseggroll.quorrabot.event.EventBus;
import me.gloriouseggroll.quorrabot.script.ScriptEventManager;
import me.gloriouseggroll.quorrabot.cache.UsernameCache;
import me.gloriouseggroll.quorrabot.event.command.CommandEvent;
import me.gloriouseggroll.quorrabot.event.twitch.host.TwitchHostedEvent;
import me.gloriouseggroll.quorrabot.cache.ChannelUsersCache;

/*
 * Create an interface that is used to create event handling methods.
 */
interface IRCCommand {

    void exec(String message, String username, Map<String, String> tagsMap);
}

public class IRCParser {

    private Map<String, IRCCommand> parserMap = new HashMap<String, IRCCommand>();
    private ScriptEventManager scriptEventManager = ScriptEventManager.instance();
    private UsernameCache usernameCache = UsernameCache.instance();
    private ArrayList<String> moderators = new ArrayList<>();
    private WebSocket webSocket;
    private String channelName;
    private String ownerName;
    private Channel channel;
    private Session session;
    private EventBus eventBus;

    /**
     * Constructor for TwitchWSIRCParser object. Performs construction of the
     * object and populates the event handling Map table.
     *
     * @param WebSocket The WebSocket object that can be read/written from/to.
     * @param String The name of the channel
     * @param Channel The Channel object, defines information regarding the
     * channel
     * @param Session The Session object, defines information rgarding the
     * session
     * @param EventBus EventBus, the bus for pushing events to
     */
    public IRCParser(WebSocket webSocket, String channelName, Channel channel, Session session, EventBus eventBus, String ownerName) {
        this.webSocket = webSocket;
        this.channelName = channelName.toLowerCase();
        this.channel = channel;
        this.session = session;
        this.eventBus = eventBus;
        this.ownerName = ownerName.toLowerCase();

        parserMap.put("001", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                joinChannel();
            }
        });

        parserMap.put("PRIVMSG", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                privMsg(message, username, tagsMap);
            }
        });

        parserMap.put("CLEARCHAT", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                clearChat(message, tagsMap);
            }
        });

        parserMap.put("WHISPER", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                whisperMessage(message, username, tagsMap);
            }
        });

        parserMap.put("JOIN", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                joinUser(message, username, tagsMap);
            }
        });

        parserMap.put("PART", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                partUser(message, username, tagsMap);
            }
        });

        parserMap.put("NOTICE", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                noticeMessage(message, username, tagsMap);
            }
        });

        parserMap.put("RECONNECT", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                reconnect();
            }
        });

        parserMap.put("USERSTATE", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                userState(tagsMap);
            }
        });

        parserMap.put("USERNOTICE", new IRCCommand() {
            public void exec(String message, String username, Map<String, String> tagsMap) {
                userNotice(message, username, tagsMap);
            }
        });
    }

    /**
     * Raw data parser. Either splits the string up and passes each line to the
     * line parser or just passes a single line to the line parser.
     *
     * @param String Incoming raw IRC message
     */
    public void parseData(String rawMessage) {
        if (rawMessage.indexOf("\n") != -1) {
            String[] messageList = rawMessage.split("\n");

            for (int idx = 0; idx < messageList.length; idx++) {
                String message = messageList[idx];
                parseLine(messageList[idx]);
            }
        } else {
            parseLine(rawMessage);
        }
    }

    /*
     * Parses one line of input.  This handles splitting apart the IRC message
     * into components, building up the tags information, getting the username,
     * pulling out the primary message, determining the event type and calling
     * a parser for that event.
     *
     * @param  String  Incoming single line of a raw IRC message
     */
    private void parseLine(String rawMessage) {
        //com.gmt2001.Console.out.println("rawMessage::" + rawMessage);
        Map<String, String> tagsMap = null;
        String messageParts[] = rawMessage.split(" :", 3);
        String userName = "";
        String eventCode = "";
        String message = "";

        /* Handle tags portion of message. */
        if (messageParts[0].startsWith("@")) {
            tagsMap = new HashMap<>();
            String[] tagParts = messageParts[0].substring(1).split(";");
            for (int idx = 0; idx < tagParts.length; idx++) {
                String[] keyValues = tagParts[idx].split("=");
                if (keyValues.length > 0) {
                    tagsMap.put(keyValues[0], keyValues.length == 1 ? "" : keyValues[1]);
                }
            }
            messageParts[0] = messageParts[1];
            if (messageParts.length > 2) {
                messageParts[1] = messageParts[2];
            }
        } else {
            tagsMap = new HashMap<>();
        }

        /* Cut leading space. */
        if (messageParts[0].startsWith(" ")) {
            messageParts[0] = messageParts[0].substring(1);
        }

        /* Cut leading space, trailing junk character, and assign message. */
        if (messageParts.length > 1) {
            if (messageParts[1].startsWith(" ")) {
                messageParts[1] = messageParts[1].substring(1);
            }
            message = messageParts[1];
            if (message.length() > 1) {
                message = message.substring(0, message.length() - 1);
            }
        } else {
            message = "";
        }

        /* Get username if present. */
        if (messageParts[0].contains("!")) {
            userName = messageParts[0].substring(messageParts[0].indexOf("!") + 1, messageParts[0].indexOf("@"));
        }

        /* Get the event code. */
        eventCode = messageParts[0].split(" ")[1];

        /* Execute the event parser if a parser exists. */
        if (parserMap.containsKey(eventCode)) {
            parserMap.get(eventCode).exec(message, userName, tagsMap);
        }
    }

    /*
     * Joins a channel and sends the required Twitch CAP REQ data.
     * Note that this is sent directly and not added to the queue.
     */
    private void joinChannel() {
        webSocket.send("CAP REQ :twitch.tv/membership");
        webSocket.send("CAP REQ :twitch.tv/commands");
        webSocket.send("CAP REQ :twitch.tv/tags");
        if (!this.session.getNick().equalsIgnoreCase(this.ownerName)) {
            webSocket.send("JOIN #" + this.channelName.toLowerCase());
            com.gmt2001.Console.out.println("Channel Joined [#" + this.channelName + "]");
        }
        eventBus.post(new IrcJoinCompleteEvent(this.session, this.channel));
    }

    /*
     * ----------------------------------------------------------------------
     * Event Handling Methods. The below methods are all referenced from the
     * parserMap object.
     * ----------------------------------------------------------------------
     */

 /*
     * Handles the PRIVMSG event from IRC.
     *
     * @param String message
     * @param String username
     * @param Map<String, String> tagsMap
     */
    private void privMsg(String message, String username, Map<String, String> tagsMap) {
        /* Check to see if the user is using a ACTION in the channel. (/me) */
        if (message.startsWith("\001ACTION")) {
            message = message.replaceAll("\001", "").replace("ACTION", "/me");
        }

        /* Print the parsed message in the console. */
        com.gmt2001.Console.out.println(username + ": " + message);

        /* Print the IRCv3 tags if debug mode is on*/
        com.gmt2001.Console.debug.println("IRCv3 Tags: " + tagsMap);

        /* Check to see if the users disaplay name. Used in the scripts. */
        if (tagsMap.containsKey("display-name")) {
            usernameCache.addUser(username, tagsMap.get("display-name"));
            com.gmt2001.Console.debug.println("Username::" + username + "::Display-Name::" + tagsMap.get("display-name"));
        }

        /* Check to see if the user is subscribing to the channel */
        if (message.endsWith("subscribed!") || message.endsWith("Prime!")) {
            if (username.equalsIgnoreCase("twitchnotify")) {
                message = message.split(" ")[0] + " just subscribed!";
                com.gmt2001.Console.debug.println(message.split(" ")[0] + " just subscribed!");
            }
        }

        /* Check to see if the user is donating/cheering bits */
        if (tagsMap.containsKey("bits")) {
            scriptEventManager.runDirect(new NewBits(this.session, this.channel, username, tagsMap.get("bits")));
            com.gmt2001.Console.debug.println("Bits::" + username + "::amount::" + tagsMap.get("bits"));
        }

        /* Check to see if the user is a channel subscriber */
        //if (tagsMap.containsKey("subscriber")) {
        //if (tagsMap.get("subscriber").equals("1")) {
        //eventBus.post(new IrcPrivateMessageEvent(this.session, "jtv", "SPECIALUSER " + username + " subscriber", tagsMap));
        //com.gmt2001.Console.debug.println("Subscriber::" + username + "::true");
        //}
        //}

        /* Check to see if the user is a moderator */
        if (tagsMap.containsKey("user-type")) {
            if (tagsMap.get("user-type").length() > 0) {
                if (!moderators.contains(username.toLowerCase())) {
                    moderators.add(username.toLowerCase());
                    eventBus.postAsync(new IrcChannelUserModeEvent(this.session, this.channel, username, "O", true));
                    com.gmt2001.Console.debug.println("Moderator::" + username + "::true");
                }
            } else if (this.channelName.equalsIgnoreCase(username)) {
                if (!moderators.contains(username.toLowerCase())) {
                    moderators.add(username.toLowerCase());
                    eventBus.postAsync(new IrcChannelUserModeEvent(this.session, this.channel, username, "O", true));
                    com.gmt2001.Console.debug.println("Broadcaster::" + username + "::true");
                }
            }
        }

        if (!username.equalsIgnoreCase("jtv") && !username.equalsIgnoreCase("twitchnotify") && !this.session.getNick().equalsIgnoreCase(this.session.getOwner())) {
            if (message.startsWith("!")) {
                String command;
                String argsString;
                if (message.indexOf(" ") == -1) {
                    command = message.substring(1, message.length());
                    argsString = "";
                } else {
                    command = message.substring(1, message.indexOf(" "));
                    argsString = message.substring(message.indexOf(" ") + 1);
                }
                EventBus.instance().post(new CommandEvent(username, command, argsString, tagsMap, this.channel));
            }
        }


        /* Moderate the incoming message. Have it run in the background on a thread. */
        if (!this.session.getNick().equalsIgnoreCase(this.ownerName)) {
            try {
                ModerationRunnable moderationRunnable = new ModerationRunnable(this.session, username, message, this.channel, tagsMap);
                new Thread(moderationRunnable).start();
            } catch (Exception ex) {
                scriptEventManager.runDirect(new IrcModerationEvent(this.session, username, message, this.channel, tagsMap));
            }

            /* Send the message to the scripts. */
            eventBus.post(new IrcChannelMessageEvent(this.session, username, message, this.channel, tagsMap));
        }
        /* Incrememnt the chat lines, this should be the last operation of this function. */
        this.session.chatLinesIncr();
    }

    /*
     * Handles the CLEARCHAT event from IRC.
     *
     * @param String username
     * @param Map<String, String> tagsMap
     */
    private void clearChat(String username, Map<String, String> tagsMap) {
        String banDuration = "";
        String banReason = "";

        com.gmt2001.Console.debug.println("CLEARCHAT::USERNAME::" + username + "::TAGS::" + tagsMap);

        /* This should never happen, but just in case. */
        if (username == null) {
            return;
        }

        if (tagsMap.containsKey("ban-duration")) {
            banDuration = tagsMap.get("ban-duration");
        }
        if (tagsMap.containsKey("ban-reason")) {
            banReason = "Reason: " + tagsMap.get("ban-reason").replaceAll("\\\\s", " ");
        }

        if (banDuration.isEmpty()) {
            com.gmt2001.Console.debug.println(username + " has been banned. " + banReason);
        } else if (!banReason.endsWith("Reason: ")) {
            com.gmt2001.Console.debug.println(username + " has been timed out for " + banDuration + " seconds. " + banReason);
        } else {
            com.gmt2001.Console.debug.println(username + " has been timed out for " + banDuration + " seconds.");
        }

        eventBus.postAsync(new IrcClearchatEvent(this.session, this.channel, username, banReason, banDuration));
    }

    /*
     * Handles the WHISPER event from IRC.
     *
     * @param String message
     * @param String username
     * @param Map<String, String> tagsMap
     */
    private void whisperMessage(String message, String username, Map<String, String> tagsMap) {
        if (!username.equalsIgnoreCase("jtv") && !username.equalsIgnoreCase("twitchnotify")) {
            if (message.startsWith("!")) {
                String command;
                String argsString;
                if (message.indexOf(" ") == -1) {
                    command = message.substring(1, message.length());
                    argsString = "";
                } else {
                    command = message.substring(1, message.indexOf(" "));
                    argsString = message.substring(message.indexOf(" ") + 1, message.length());
                }
                eventBus.postAsync(new CommandEvent(username, command, argsString, tagsMap, this.channel));
            }
        }
        eventBus.postAsync(new IrcPrivateMessageEvent(this.session, username, message, tagsMap));
        com.gmt2001.Console.out.println("[WHISPER] " + username + ": " + message);
    }

    /*
     * Handles the NOTICE event from IRC.
     *
     * @param String message
     * @param String username
     * @param Map<String, String> tagsMap
     */
    private void noticeMessage(String message, String username, Map<String, String> tagsMap) {
        if (message.indexOf("The moderators of this room are: ") != -1) {
            try {
                Thread.sleep(2000);
                Quorrabot.instance().channelUsersCache.updateCache();
                eventBus.postAsync(new IrcChannelUserModeEvent(this.session, this.channel, this.ownerName.toLowerCase(), "O", true));
                String[] moderators = message.substring(33).split(", ");
                for (String moderator : moderators) {
                    if (moderator.equalsIgnoreCase(this.session.getNick())) {
                        this.session.setAllowSendMessages(true);
                    }
                    if (Quorrabot.instance().channelUsersCache.getCache().toString().contains(moderator.toLowerCase() + "=mod")) {
                        eventBus.postAsync(new IrcChannelUserModeEvent(this.session, this.channel, moderator.toLowerCase(), "O", true));
                    }
                }

            } catch (Exception e) {
                //
                com.gmt2001.Console.out.println("Error::" + e.toString());
            }
        }
        if (username.equalsIgnoreCase("jtv")) {
            if (message.indexOf("is now hosting you") != -1) {
                String hoster = message.split(" ")[0].toString();
                com.gmt2001.Console.out.println("Hoster::" + hoster + "::true");
                eventBus.postAsync(new TwitchHostedEvent(hoster, this.channel));
            }
        }
        eventBus.postAsync(new IrcPrivateMessageEvent(this.session, "jtv", message, tagsMap));
        com.gmt2001.Console.debug.println("Message from jtv (NOTICE): " + message);
    }

    /*
     * Handles the JOIN event from IRC.
     *
     * @param String message
     * @param String username
     * @param Map<String, String> tagsMap
     */
    private void joinUser(String message, String username, Map<String, String> tagMaps) {
        eventBus.postAsync(new IrcChannelJoinEvent(this.session, this.channel, username));
        com.gmt2001.Console.debug.println("User Joined Channel [" + username + "#" + this.ownerName + "]");
    }

    /*
     * Handles the PART event from IRC.
     *
     * @param String message
     * @param String username
     * @param Map<String, String> tagsMap
     */
    private void partUser(String message, String username, Map<String, String> tagMaps) {
        eventBus.postAsync(new IrcChannelLeaveEvent(this.session, this.channel, username, message));
        com.gmt2001.Console.debug.println("User Left Channel [" + username + "#" + this.ownerName + "]");
    }

    /*
     * Handles the USERNOTICE event from IRC.
     *
     * @param String message
     * @param String username
     * @param Map<String, String> tagsMap
     */
    private void userNotice(String message, String username, Map<String, String> tagMaps) {
        if (tagMaps.containsKey("login") && tagMaps.containsKey("msg-param-months")) {
            eventBus.postAsync(new IrcPrivateMessageEvent(this.session, "twitchnotify", tagMaps.get("login") + " just subscribed for " + tagMaps.get("msg-param-months") + " months in a row!", tagMaps));
            com.gmt2001.Console.debug.println(tagMaps.get("login") + " just subscribed for " + tagMaps.get("msg-param-months") + " months in a row!");
        }
    }

    /*
     * Handles the USERSTATE event from IRC.
     *
     * @param Map<String, String> tagsMap
     */
    private void userState(Map<String, String> tagMaps) {
        if (tagMaps.containsKey("user-type")) {
            if (tagMaps.get("user-type").length() > 0) {
                if (!moderators.contains(this.session.getNick())) {
                    moderators.add(this.session.getNick());
                    com.gmt2001.Console.debug.println("Bot::" + this.session.getNick() + "::Moderator::true");
                    eventBus.post(new IrcChannelUserModeEvent(this.session, this.channel, this.session.getNick(), "O", true));
                }
            } else if (this.channelName.equalsIgnoreCase(this.session.getNick())) {
                if (!moderators.contains(this.session.getNick())) {
                    moderators.add(this.session.getNick());
                    com.gmt2001.Console.debug.println("Caster::Bot::" + this.session.getNick() + "::Moderator::true");
                    eventBus.post(new IrcChannelUserModeEvent(this.session, this.channel, this.session.getNick(), "O", true));
                }
            } else {
                com.gmt2001.Console.out.println();
                com.gmt2001.Console.out.println("[ERROR] " + this.session.getNick() + " is not detected as a moderator!");
                com.gmt2001.Console.out.println("[ERROR] You must add " + this.session.getNick() + " as a channel moderator for it to chat.");
                com.gmt2001.Console.out.println("[ERROR] Type /mod " + this.session.getNick() + " to add " + this.session.getNick() + " as a channel moderator.");
                com.gmt2001.Console.out.println();
                //session.setAllowSendMessages(false);
                if (moderators.contains(this.session.getNick())) {
                    moderators.remove(this.session.getNick());
                    com.gmt2001.Console.debug.println("Bot::" + this.session.getNick() + "::Moderator::false");
                    eventBus.postAsync(new IrcChannelUserModeEvent(this.session, this.channel, this.session.getNick(), "O", false));
                }
            }
        }
    }

    /*
     * Handles the RECONNECT event from IRC.
     *
     */
    private void reconnect() {
        try {
            Thread.sleep(30000);// wait 30 seconds to give time to the irc servers to reboot.
            this.session.reconnect();
        } catch (InterruptedException ex) {
            com.gmt2001.Console.err.printStackTrace(ex);
        }
    }

    /*
     * Class for spawning threads for handling moderation.
     */
    private class ModerationRunnable implements Runnable {

        private final Session session;
        private final String username;
        private final String message;
        private final Channel channel;
        private final Map<String, String> tagsMap;

        public ModerationRunnable(Session session, String username, String message, Channel channel, Map<String, String> tagsMap) {
            this.session = session;
            this.username = username;
            this.message = message;
            this.channel = channel;
            this.tagsMap = tagsMap;
        }

        public void run() {
            scriptEventManager.runDirect(new IrcModerationEvent(session, username, message, channel, tagsMap));
        }
    }
}
