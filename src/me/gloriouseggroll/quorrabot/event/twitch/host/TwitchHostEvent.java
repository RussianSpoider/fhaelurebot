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
package me.gloriouseggroll.quorrabot.event.twitch.host;

import me.gloriouseggroll.quorrabot.event.twitch.TwitchEvent;
import me.gloriouseggroll.quorrabot.twitchchat.Channel;

public abstract class TwitchHostEvent extends TwitchEvent {

    private final String hoster;
    private final Type type;
    private final int users;
    private final String msg;

    public enum Type {

        HOST,
        UNHOST;
    }

    protected TwitchHostEvent(String hoster, Type type) {
        this.hoster = hoster;
        this.type = type;
        this.users = 0;
        this.msg = "";
    }

    protected TwitchHostEvent(String hoster, Type type, int users) {
        this.hoster = hoster;
        this.type = type;
        this.users = users;
        this.msg = "";
    }

    protected TwitchHostEvent(String hoster, Type type, Channel channel) {
        super(channel);
        this.hoster = hoster;
        this.type = type;
        this.users = 0;
        this.msg = "";
    }

    protected TwitchHostEvent(String hoster, Type type, int users, Channel channel) {
        super(channel);
        this.hoster = hoster;
        this.type = type;
        this.users = users;
        this.msg = "";
    }
    
    protected TwitchHostEvent(String hoster, Type type, int users, Channel channel, String msg) {
        super(channel);
        this.hoster = hoster;
        this.type = type;
        this.users = users;
        this.msg = msg;
    }

    


    public String getHoster() {
        return hoster;
    }

    public Type getType() {
        return type;
    }

    public int getUsers() {
        return users;
    }
    
    public String getMsg() {
        return msg;
    }
    
    public String toEventSocket() {
        return this.getHoster() + "|" + this.getType();
    }
}
