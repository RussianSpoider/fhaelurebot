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
package org.java_websocket.handshake;

public class HandshakeImpl1Server extends HandshakedataImpl1 implements ServerHandshakeBuilder {
	private short httpstatus;
	private String httpstatusmessage;

	public HandshakeImpl1Server() {
	}

	@Override
	public String getHttpStatusMessage() {
		return httpstatusmessage;
	}

	@Override
	public short getHttpStatus() {
		return httpstatus;
	}

	public void setHttpStatusMessage( String message ) {
		this.httpstatusmessage = message;
	}

	public void setHttpStatus( short status ) {
		httpstatus = status;
	}


}
