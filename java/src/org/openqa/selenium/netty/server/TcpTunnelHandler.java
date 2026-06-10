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
 *
 * <p>Backpressure is mirrored across the tunnel: when {@code ctx.channel()}'s outbound buffer
 * passes its high-water mark, {@code target}'s read side is paused so the peer stops shipping bytes
 * the kernel cannot drain. When the buffer drains below the low-water mark the peer is resumed.
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
  public void channelWritabilityChanged(ChannelHandlerContext ctx) {
    // Mirror our outbound writability onto the peer's read side. While our buffer is full the
    // peer stops reading; when it drains the peer resumes. Symmetric on both legs of the tunnel.
    // ChannelConfig.setAutoRead is documented thread-safe: the flag is updated via an atomic
    // updater, and the channel.read() that fires on a false→true transition marshalls itself
    // onto the channel's event loop. Safe to call directly even if the two tunnel legs are on
    // different loops (today TcpUpgradeTunnelHandler places them on the same one).
    target.config().setAutoRead(ctx.channel().isWritable());
    ctx.fireChannelWritabilityChanged();
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
