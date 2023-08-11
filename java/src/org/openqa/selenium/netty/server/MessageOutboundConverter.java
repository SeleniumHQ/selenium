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

import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelOutboundHandlerAdapter;
import io.netty.channel.ChannelPromise;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import java.util.logging.Logger;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;

class MessageOutboundConverter extends ChannelOutboundHandlerAdapter {

  private static final Logger LOG = Logger.getLogger(MessageOutboundConverter.class.getName());

  @Override
  public void write(ChannelHandlerContext ctx, Object msg, ChannelPromise promise)
      throws Exception {
    if (!(msg instanceof Message)) {
      super.write(ctx, msg, promise);
      return;
    }

    Message seMessage = (Message) msg;

    if (seMessage instanceof CloseMessage) {
      ctx.writeAndFlush(new CloseWebSocketFrame(true, 0));
    } else if (seMessage instanceof BinaryMessage) {
      ctx.writeAndFlush(
          new BinaryWebSocketFrame(
              true, 0, Unpooled.copiedBuffer(((BinaryMessage) seMessage).data())));
    } else if (seMessage instanceof TextMessage) {
      ctx.writeAndFlush(new TextWebSocketFrame(true, 0, ((TextMessage) seMessage).text()));
    } else {
      LOG.warning(String.format("Unable to handle %s", msg));
      super.write(ctx, msg, promise);
    }
  }
}
