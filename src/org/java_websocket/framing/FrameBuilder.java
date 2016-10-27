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
package org.java_websocket.framing;

import java.nio.ByteBuffer;

import org.java_websocket.exceptions.InvalidDataException;

public interface FrameBuilder extends Framedata {

    public abstract void setFin(boolean fin);

    public abstract void setOptcode(Opcode optcode);

    public abstract void setPayload(ByteBuffer payload) throws InvalidDataException;

    public abstract void setTransferemasked(boolean transferemasked);

}
