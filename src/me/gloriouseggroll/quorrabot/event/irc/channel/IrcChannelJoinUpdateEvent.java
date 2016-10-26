/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.gloriouseggroll.quorrabot.event.irc.channel;

import me.gloriouseggroll.quorrabot.twitchchat.Channel;
import me.gloriouseggroll.quorrabot.twitchchat.Session;

public class IrcChannelJoinUpdateEvent extends IrcChannelEvent {

    private final String user;

    public IrcChannelJoinUpdateEvent(Session session, Channel channel, String user) {
        super(session, channel);
        this.user = user;
    }

    public String getUser() {
        return user;
    }
}
