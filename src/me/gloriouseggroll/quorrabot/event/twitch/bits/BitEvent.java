/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package me.gloriouseggroll.quorrabot.event.twitch.bits;

import me.gloriouseggroll.quorrabot.event.Event;
import me.gloriouseggroll.quorrabot.twitchchat.Channel;
import me.gloriouseggroll.quorrabot.twitchchat.Session;

public class BitEvent extends Event {

	private final Channel channel;
	private final Session session;

	protected BitEvent() {
		this.channel = null;
		this.session = null;
	}

	protected BitEvent(Channel channel, Session session) {
		this.channel = channel;
		this.session = session;
	}

	public Channel getChannel() {
		return this.channel;
	}

	public Session getSession() {
		return this.session;
	}
}