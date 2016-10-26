/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.gloriouseggroll.quorrabot.event.twitch.bits;

import me.gloriouseggroll.quorrabot.twitchchat.Channel;
import me.gloriouseggroll.quorrabot.twitchchat.Session;

public class NewBits extends BitEvent {

	private final String username;
    private final String bits;

	public NewBits(String username, String bits) {
        this.username = username;
        this.bits = bits;
    }

    public NewBits(Session session, Channel channel, String username, String bits) {
        super(channel, session);
        this.username = username;
        this.bits = bits;
    }

    public String getUsername() {
        return this.username;
    }

    public String getBits() {
        return this.bits;
    }
}