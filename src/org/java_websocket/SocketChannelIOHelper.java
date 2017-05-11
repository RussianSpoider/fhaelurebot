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
package org.java_websocket;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.ByteChannel;
import java.nio.channels.spi.AbstractSelectableChannel;

import org.java_websocket.WebSocket.Role;

public class SocketChannelIOHelper {

    public static boolean read(final ByteBuffer buf, WebSocketImpl ws, ByteChannel channel) throws IOException {
        buf.clear();
        int read = channel.read(buf);
        buf.flip();

        if (read == -1) {
            ws.eot();
            return false;
        }
        return read != 0;
    }

    /**
     * @see WrappedByteChannel#readMore(ByteBuffer)
     * @return returns whether there is more data left which can be obtained via
     * {@link #readMore(ByteBuffer, WebSocketImpl, WrappedByteChannel)}
	 *
     */
    public static boolean readMore(final ByteBuffer buf, WebSocketImpl ws, WrappedByteChannel channel) throws IOException {
        buf.clear();
        int read = channel.readMore(buf);
        buf.flip();

        if (read == -1) {
            ws.eot();
            return false;
        }
        return channel.isNeedRead();
    }

    /**
     * Returns whether the whole outQueue has been flushed
     */
    public static boolean batch(WebSocketImpl ws, ByteChannel sockchannel) throws IOException {
        ByteBuffer buffer = ws.outQueue.peek();
        WrappedByteChannel c = null;

        if (buffer == null) {
            if (sockchannel instanceof WrappedByteChannel) {
                c = (WrappedByteChannel) sockchannel;
                if (c.isNeedWrite()) {
                    c.writeMore();
                }
            }
        } else {
            do {// FIXME writing as much as possible is unfair!!
                /*int written = */
                sockchannel.write(buffer);
                if (buffer.remaining() > 0) {
                    return false;
                } else {
                    ws.outQueue.poll(); // Buffer finished. Remove it.
                    buffer = ws.outQueue.peek();
                }
            } while (buffer != null);
        }

        if (ws != null && ws.outQueue.isEmpty() && ws.isFlushAndClose() && ws.getDraft() != null && ws.getDraft().getRole() != null && ws.getDraft().getRole() == Role.SERVER) {//
            synchronized (ws) {
                ws.closeConnection();
            }
        }
        return c != null ? !((WrappedByteChannel) sockchannel).isNeedWrite() : true;
    }
}
