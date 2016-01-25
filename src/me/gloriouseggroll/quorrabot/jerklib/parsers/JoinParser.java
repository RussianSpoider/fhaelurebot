/* 
 * Copyright (C) 2015 www.quorrabot.com
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
package me.gloriouseggroll.quorrabot.jerklib.parsers;

import me.gloriouseggroll.quorrabot.jerklib.Channel;
import me.gloriouseggroll.quorrabot.jerklib.Session;
import me.gloriouseggroll.quorrabot.jerklib.events.IRCEvent;
import me.gloriouseggroll.quorrabot.jerklib.events.JoinCompleteEvent;
import me.gloriouseggroll.quorrabot.jerklib.events.JoinEvent;

/**
 * @author mohadib
 */
public class JoinParser implements CommandParser
{

    // :r0bby!n=wakawaka@guifications/user/r0bby JOIN :#me.gloriouseggroll.quorrabot.jerklib
    // :mohadib_!~mohadib@68.35.11.181 JOIN &test
    @Override
    public IRCEvent createEvent(IRCEvent event)
    {
        Session session = event.getSession();

        if (!event.getNick().equalsIgnoreCase(event.getSession().getNick()))
        {
            //someone else joined a channel we are in
            return new JoinEvent(event.getRawEventData(), session, session.getChannel(event.arg(0)));
        }

        //we joined a channel
        return new JoinCompleteEvent(event.getRawEventData(), event.getSession(), new Channel(event.arg(0), event.getSession()));
    }
}
