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
package org.java_websocket.exceptions;

import org.java_websocket.framing.CloseFrame;

public class InvalidHandshakeException extends InvalidDataException {

	/**
	 * Serializable
	 */
	private static final long serialVersionUID = -1426533877490484964L;

	public InvalidHandshakeException() {
		super( CloseFrame.PROTOCOL_ERROR );
	}

	public InvalidHandshakeException( String arg0 , Throwable arg1 ) {
		super( CloseFrame.PROTOCOL_ERROR, arg0, arg1 );
	}

	public InvalidHandshakeException( String arg0 ) {
		super( CloseFrame.PROTOCOL_ERROR, arg0 );
	}

	public InvalidHandshakeException( Throwable arg0 ) {
		super( CloseFrame.PROTOCOL_ERROR, arg0 );
	}

}
