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

import java.net.Socket;
import java.util.List;

import org.java_websocket.drafts.Draft;

public interface WebSocketFactory {

    public WebSocket createWebSocket(WebSocketAdapter a, Draft d, Socket s);

    public WebSocket createWebSocket(WebSocketAdapter a, List<Draft> drafts, Socket s);

}
