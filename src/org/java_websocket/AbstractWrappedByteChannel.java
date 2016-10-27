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
import java.nio.channels.SocketChannel;

import javax.net.ssl.SSLException;

public class AbstractWrappedByteChannel implements WrappedByteChannel {

    private final ByteChannel channel;

    public AbstractWrappedByteChannel(ByteChannel towrap) {
        this.channel = towrap;
    }

    public AbstractWrappedByteChannel(WrappedByteChannel towrap) {
        this.channel = towrap;
    }

    @Override
    public int read(ByteBuffer dst) throws IOException {
        return channel.read(dst);
    }

    @Override
    public boolean isOpen() {
        return channel.isOpen();
    }

    @Override
    public void close() throws IOException {
        channel.close();
    }

    @Override
    public int write(ByteBuffer src) throws IOException {
        return channel.write(src);
    }

    @Override
    public boolean isNeedWrite() {
        return channel instanceof WrappedByteChannel ? ((WrappedByteChannel) channel).isNeedWrite() : false;
    }

    @Override
    public void writeMore() throws IOException {
        if (channel instanceof WrappedByteChannel) {
            ((WrappedByteChannel) channel).writeMore();
        }

    }

    @Override
    public boolean isNeedRead() {
        return channel instanceof WrappedByteChannel ? ((WrappedByteChannel) channel).isNeedRead() : false;

    }

    @Override
    public int readMore(ByteBuffer dst) throws SSLException {
        return channel instanceof WrappedByteChannel ? ((WrappedByteChannel) channel).readMore(dst) : 0;
    }

    @Override
    public boolean isBlocking() {
        if (channel instanceof SocketChannel) {
            return ((SocketChannel) channel).isBlocking();
        } else if (channel instanceof WrappedByteChannel) {
            return ((WrappedByteChannel) channel).isBlocking();
        }
        return false;
    }

}
