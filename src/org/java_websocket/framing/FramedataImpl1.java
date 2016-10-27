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
import java.util.Arrays;

import org.java_websocket.exceptions.InvalidDataException;
import org.java_websocket.exceptions.InvalidFrameException;
import org.java_websocket.util.Charsetfunctions;

public class FramedataImpl1 implements FrameBuilder {
	protected static byte[] emptyarray = {};
	protected boolean fin;
	protected Opcode optcode;
	private ByteBuffer unmaskedpayload;
	protected boolean transferemasked;

	public FramedataImpl1() {
	}

	public FramedataImpl1( Opcode op ) {
		this.optcode = op;
		unmaskedpayload = ByteBuffer.wrap( emptyarray );
	}

	/**
	 * Helper constructor which helps to create "echo" frames.
	 * The new object will use the same underlying payload data.
	 **/
	public FramedataImpl1( Framedata f ) {
		fin = f.isFin();
		optcode = f.getOpcode();
		unmaskedpayload = f.getPayloadData();
		transferemasked = f.getTransfereMasked();
	}

	@Override
	public boolean isFin() {
		return fin;
	}

	@Override
	public Opcode getOpcode() {
		return optcode;
	}

	@Override
	public boolean getTransfereMasked() {
		return transferemasked;
	}

	@Override
	public ByteBuffer getPayloadData() {
		return unmaskedpayload;
	}

	@Override
	public void setFin( boolean fin ) {
		this.fin = fin;
	}

	@Override
	public void setOptcode( Opcode optcode ) {
		this.optcode = optcode;
	}

	@Override
	public void setPayload( ByteBuffer payload ) throws InvalidDataException {
		unmaskedpayload = payload;
	}

	@Override
	public void setTransferemasked( boolean transferemasked ) {
		this.transferemasked = transferemasked;
	}

	@Override
	public void append( Framedata nextframe ) throws InvalidFrameException {
		ByteBuffer b = nextframe.getPayloadData();
		if( unmaskedpayload == null ) {
			unmaskedpayload = ByteBuffer.allocate( b.remaining() );
			b.mark();
			unmaskedpayload.put( b );
			b.reset();
		} else {
			b.mark();
			unmaskedpayload.position( unmaskedpayload.limit() );
			unmaskedpayload.limit( unmaskedpayload.capacity() );

			if( b.remaining() > unmaskedpayload.remaining() ) {
				ByteBuffer tmp = ByteBuffer.allocate( b.remaining() + unmaskedpayload.capacity() );
				unmaskedpayload.flip();
				tmp.put( unmaskedpayload );
				tmp.put( b );
				unmaskedpayload = tmp;

			} else {
				unmaskedpayload.put( b );
			}
			unmaskedpayload.rewind();
			b.reset();
		}
		fin = nextframe.isFin();
	}

	@Override
	public String toString() {
		return "Framedata{ optcode:" + getOpcode() + ", fin:" + isFin() + ", payloadlength:[pos:" + unmaskedpayload.position() + ", len:" + unmaskedpayload.remaining() + "], payload:" + Arrays.toString( Charsetfunctions.utf8Bytes( new String( unmaskedpayload.array() ) ) ) + "}";
	}

}
