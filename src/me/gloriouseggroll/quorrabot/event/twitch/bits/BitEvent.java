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