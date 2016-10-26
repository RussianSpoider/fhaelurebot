/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.gloriouseggroll.quorrabot.event.gamewisp;

import me.gloriouseggroll.quorrabot.event.Event;
import me.gloriouseggroll.quorrabot.twitchchat.Channel;

/**
 *
 * @author Tom
 */
public class GameWispEvent extends Event {

    private final Channel channel;

    protected GameWispEvent() {
        this.channel = null;
    }

    protected GameWispEvent(Channel channel) {
        this.channel = channel;
    }

    public Channel getChannel() {
        return this.channel;
    }
}
