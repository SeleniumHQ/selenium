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
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import io.netty.handler.timeout.IdleState;
import io.netty.handler.timeout.IdleStateEvent;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Sends a WebSocket {@link PingWebSocketFrame} whenever no data has been written to the channel for
 * {@link #PING_INTERVAL_SECONDS} seconds. This prevents cloud load balancers (AWS ALB default: 60
 * s, GCP default: 600 s, k8s ingress-nginx default: 60 s) and NAT gateways from silently dropping
 * idle TCP connections mid-session.
 *
 * <p>Must be placed in the pipeline immediately after an {@link
 * io.netty.handler.timeout.IdleStateHandler} that is configured with a writer-idle timeout.
 * Installed by {@link WebSocketUpgradeHandler} after the WebSocket handshake completes so that it
 * only activates for WebSocket connections (never for plain HTTP request/response pairs).
 *
 * <p>Incoming {@link io.netty.handler.codec.http.websocketx.PongWebSocketFrame} responses are
 * handled by {@link WebSocketUpgradeHandler} (which releases them). No additional handling is
 * needed here.
 */
class WebSocketKeepAliveHandler extends ChannelInboundHandlerAdapter {

  static final int PING_INTERVAL_SECONDS = 30;

  private static final Logger LOG = Logger.getLogger(WebSocketKeepAliveHandler.class.getName());

  @Override
  public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
    if (evt instanceof IdleStateEvent && ((IdleStateEvent) evt).state() == IdleState.WRITER_IDLE) {
      LOG.log(Level.FINE, "Sending WebSocket ping keepalive on {0}", ctx.channel());
      ctx.writeAndFlush(new PingWebSocketFrame())
          .addListener(
              future -> {
                if (!future.isSuccess()) {
                  // Channel is gone; close it so the session slot is released.
                  LOG.log(
                      Level.FINE,
                      "WebSocket ping failed on " + ctx.channel() + ", closing channel",
                      future.cause());
                  ctx.close();
                }
              });
      return;
    }
    super.userEventTriggered(ctx, evt);
  }
}
