/* 
 * Copyright (C) 2017 www.quorrabot.com
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
package org.java_websocket.exceptions;

import org.java_websocket.framing.CloseFrame;

public class InvalidFrameException extends InvalidDataException {

    /**
     * Serializable
     */
    private static final long serialVersionUID = -9016496369828887591L;

    public InvalidFrameException() {
        super(CloseFrame.PROTOCOL_ERROR);
    }

    public InvalidFrameException(String arg0) {
        super(CloseFrame.PROTOCOL_ERROR, arg0);
    }

    public InvalidFrameException(Throwable arg0) {
        super(CloseFrame.PROTOCOL_ERROR, arg0);
    }

    public InvalidFrameException(String arg0, Throwable arg1) {
        super(CloseFrame.PROTOCOL_ERROR, arg0, arg1);
    }
}
