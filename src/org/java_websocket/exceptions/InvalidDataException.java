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

public class InvalidDataException extends Exception {
	/**
	 * Serializable
	 */
	private static final long serialVersionUID = 3731842424390998726L;
	
	private int closecode;
	
	public InvalidDataException( int closecode ) {
		this.closecode = closecode;
	}

	public InvalidDataException( int closecode , String s ) {
		super( s );
		this.closecode = closecode;
	}

	public InvalidDataException( int closecode , Throwable t ) {
		super( t );
		this.closecode = closecode;
	}

	public InvalidDataException( int closecode , String s , Throwable t ) {
		super( s, t );
		this.closecode = closecode;
	}

	public int getCloseCode() {
		return closecode;
	}

}
