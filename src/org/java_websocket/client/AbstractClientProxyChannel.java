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
package org.java_websocket.client;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.channels.ByteChannel;

import org.java_websocket.AbstractWrappedByteChannel;

public abstract class AbstractClientProxyChannel extends AbstractWrappedByteChannel {

    protected final ByteBuffer proxyHandshake;

    /**
     * @param towrap The channel to the proxy server
	 *
     */
    public AbstractClientProxyChannel(ByteChannel towrap) {
        super(towrap);
        try {
            proxyHandshake = ByteBuffer.wrap(buildHandShake().getBytes("ASCII"));
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public int write(ByteBuffer src) throws IOException {
        if (!proxyHandshake.hasRemaining()) {
            return super.write(src);
        } else {
            return super.write(proxyHandshake);
        }
    }

    public abstract String buildHandShake();

}
