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
package me.gloriouseggroll.quorrabot.event.gamewisp;

import me.gloriouseggroll.quorrabot.event.Event;
import me.gloriouseggroll.quorrabot.twitchchat.Channel;

/*
 *
 * @author illusionaryone
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
