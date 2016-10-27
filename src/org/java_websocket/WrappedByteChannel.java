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
package org.java_websocket;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.ByteChannel;

import javax.net.ssl.SSLException;

public interface WrappedByteChannel extends ByteChannel {

    public boolean isNeedWrite();

    public void writeMore() throws IOException;

    /**
     * returns whether readMore should be called to fetch data which has been
     * decoded but not yet been returned.
     *
     * @see #read(ByteBuffer)
     * @see #readMore(ByteBuffer)
	 *
     */
    public boolean isNeedRead();

    /**
     * This function does not read data from the underlying channel at all. It
     * is just a way to fetch data which has already be received or decoded but
     * was but was not yet returned to the user. This could be the case when the
     * decoded data did not fit into the buffer the user passed to
     * {@link #read(ByteBuffer)}.
	 *
     */
    public int readMore(ByteBuffer dst) throws SSLException;

    public boolean isBlocking();
}
