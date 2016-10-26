package me.gloriouseggroll.quorrabot.event.irc.message;

import java.util.Map;
import me.gloriouseggroll.quorrabot.twitchchat.Channel;
import me.gloriouseggroll.quorrabot.twitchchat.Session;

public class IrcModerationEvent extends IrcMessageEvent {

    public IrcModerationEvent(Session session, String sender, String message, Channel channel) {
        super(session, sender, message, null, channel);
    }

    public IrcModerationEvent(Session session, String sender, String message, Channel channel, Map<String, String> tags) {
        super(session, sender, message, tags, channel);
    }
}
