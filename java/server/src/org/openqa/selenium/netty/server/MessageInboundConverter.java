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

import io.netty.buffer.ByteBuf;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;

import java.nio.ByteBuffer;
import java.util.logging.Logger;

class MessageInboundConverter extends SimpleChannelInboundHandler<WebSocketFrame> {

  private static final Logger LOG = Logger.getLogger(MessageInboundConverter.class.getName());

  @Override
  protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) {
    if (!frame.isFinalFragment()) {
      LOG.warning("Frame is not final. Chaos may ensue");
    }

    Message message = null;

    if (frame instanceof TextWebSocketFrame) {
      message = new TextMessage(((TextWebSocketFrame) frame).text());
    } else if (frame instanceof BinaryWebSocketFrame) {
      ByteBuf buf = frame.content();
      if (buf.nioBufferCount() != -1) {
        message = new BinaryMessage(buf.nioBuffer());
      } else if (buf.hasArray()) {
        message = new BinaryMessage(ByteBuffer.wrap(buf.array()));
      } else {
        throw new IllegalStateException("Unable to handle bytebuf: " + buf);
      }
    } else if (frame instanceof CloseWebSocketFrame) {
      CloseWebSocketFrame closeFrame = (CloseWebSocketFrame) frame;
      message = new CloseMessage(closeFrame.statusCode(), closeFrame.reasonText());
    }

    if (message != null) {
      ctx.fireChannelRead(message);
    } else {
      ctx.write(frame);
    }
  }
}
