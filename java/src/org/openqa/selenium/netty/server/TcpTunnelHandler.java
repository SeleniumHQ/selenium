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

import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Forwards every inbound {@link io.netty.buffer.ByteBuf} to a target {@link Channel}. Used on both
 * ends of a transparent TCP tunnel once the WebSocket upgrade handshake has been proxied.
 */
class TcpTunnelHandler extends ChannelInboundHandlerAdapter {

  private static final Logger LOG = Logger.getLogger(TcpTunnelHandler.class.getName());

  private final Channel target;

  TcpTunnelHandler(Channel target) {
    this.target = target;
  }

  @Override
  public void channelRead(ChannelHandlerContext ctx, Object msg) {
    target
        .writeAndFlush(msg)
        .addListener(
            future -> {
              if (!future.isSuccess()) {
                LOG.log(
                    Level.WARNING,
                    "TCP tunnel write failed on "
                        + ctx.channel()
                        + " -> "
                        + target
                        + ", closing both channels",
                    future.cause());
                ctx.close();
                target.close();
              }
            });
  }

  @Override
  public void channelInactive(ChannelHandlerContext ctx) {
    target.close();
  }

  @Override
  public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
    LOG.log(Level.WARNING, "TCP tunnel error, closing both channels", cause);
    ctx.close();
    target.close();
  }
}
