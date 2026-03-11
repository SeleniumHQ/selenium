// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.netty.server;

import io.netty.channel.ChannelHandlerContext;

/**
 * Optional interface that a {@link java.util.function.Consumer} returned by a WebSocket handler
 * factory may implement to receive a callback <em>after</em> the Netty-side WebSocket handshake has
 * completed.
 *
 * <p>Implementing this hook allows the handler to rewire the Netty pipeline (e.g. replace the
 * {@code Message}-layer handlers with a lighter-weight frame-level forwarder) once the channel is
 * fully in WebSocket mode.
 */
public interface PostUpgradeHook {

  /**
   * Called on the Netty IO thread immediately after the {@link
   * io.netty.handler.codec.http.websocketx.WebSocketServerHandshaker} handshake future succeeds.
   * The channel is now in WebSocket mode; callers may freely modify {@code ctx.pipeline()}.
   */
  void onUpgradeComplete(ChannelHandlerContext ctx);
}
