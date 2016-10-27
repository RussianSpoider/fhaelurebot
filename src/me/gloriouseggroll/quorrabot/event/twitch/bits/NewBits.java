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
