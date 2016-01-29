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

import me.gloriouseggroll.quorrabot.jerklib.events.IRCEvent;
import me.gloriouseggroll.quorrabot.jerklib.events.PartEvent;

/**
 * @author mohadib
 */
public class PartParser implements CommandParser
{

    @Override
    public PartEvent createEvent(IRCEvent event)
    {
        return new PartEvent(
                event.getRawEventData(),
                event.getSession(),
                event.getNick(), // who
                event.getSession().getChannel(event.arg(0)),
                event.args().size() == 2 ? event.arg(1) : "");
    }
}