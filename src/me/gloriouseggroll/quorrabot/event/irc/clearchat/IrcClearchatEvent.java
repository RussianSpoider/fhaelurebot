package me.gloriouseggroll.quorrabot.event.irc.clearchat;

import me.gloriouseggroll.quorrabot.event.irc.IrcEvent;
import me.gloriouseggroll.quorrabot.twitchchat.Channel;
import me.gloriouseggroll.quorrabot.twitchchat.Session;

public class IrcClearchatEvent extends IrcEvent {

    private final String user;
    private final String reason;
    private final String duration;
    private final Channel channel;

    public IrcClearchatEvent(Session session, Channel channel, String user, String reason, String duration) {
        super(session);
        this.channel = channel;
        this.user = user;
        this.reason = reason;
        this.duration = duration;
    }

    public Channel getChannel() {
        return channel;
    }

    public String getUser() {
        return user;
    }

    public String getReason() {
        return reason;
    }

    public String getDuration() {
        return duration;
    }
}