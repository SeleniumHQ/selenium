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
import io.netty.handler.codec.http.websocketx.ContinuationWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.ByteBuffer;
import java.util.logging.Logger;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;

class MessageInboundConverter extends SimpleChannelInboundHandler<WebSocketFrame> {

  private enum Continuation {
    Text,
    Binary,
    None
  }

  private static final Logger LOG = Logger.getLogger(MessageInboundConverter.class.getName());

  private Continuation next;
  private StringBuilder builder;
  private ByteArrayOutputStream buffer;

  public MessageInboundConverter() {
    next = Continuation.None;
    buffer = new ByteArrayOutputStream();
    builder = new StringBuilder();
  }

  @Override
  protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) {
    boolean finalFragment = frame.isFinalFragment();
    Message message;

    if (frame instanceof ContinuationWebSocketFrame) {
      switch (next) {
        case Binary:
          try {
            ByteBuf content = frame.content();
            content.readBytes(buffer, content.readableBytes());
          } catch (IOException e) {
            throw new UncheckedIOException("failed to transfer buffer", e);
          }

          if (finalFragment) {
            message = new BinaryMessage(buffer.toByteArray());
            buffer.reset();
            next = Continuation.None;
          } else {
            message = null;
          }
          break;
        case Text:
          builder.append(((ContinuationWebSocketFrame) frame).text());

          if (finalFragment) {
            message = new TextMessage(builder.toString());
            builder.setLength(0);
            next = Continuation.None;
          } else {
            message = null;
          }
          break;
        case None:
          ctx.write(frame);
          return;
        default:
          throw new IllegalStateException("unexpected enum: " + next);
      }
    } else if (next != Continuation.None) {
      throw new IllegalStateException("expected a continuation frame");
    } else if (frame instanceof TextWebSocketFrame) {
      if (finalFragment) {
        message = new TextMessage(((TextWebSocketFrame) frame).text());
      } else {
        next = Continuation.Text;
        message = null;
        builder.append(((TextWebSocketFrame) frame).text());
      }
    } else if (frame instanceof BinaryWebSocketFrame) {
      ByteBuf content = frame.content();
      if (finalFragment) {
        if (content.nioBufferCount() != -1) {
          message = new BinaryMessage(content.nioBuffer());
        } else if (content.hasArray()) {
          message = new BinaryMessage(ByteBuffer.wrap(content.array()));
        } else {
          throw new IllegalStateException("Unable to handle bytebuf: " + content);
        }
      } else {
        next = Continuation.Binary;
        message = null;
        try {
          content.readBytes(buffer, content.readableBytes());
        } catch (IOException e) {
          throw new UncheckedIOException("failed to transfer buffer", e);
        }
      }
    } else if (frame instanceof CloseWebSocketFrame) {
      CloseWebSocketFrame closeFrame = (CloseWebSocketFrame) frame;
      message = new CloseMessage(closeFrame.statusCode(), closeFrame.reasonText());
    } else {
      ctx.write(frame);
      return;
    }

    if (message != null) {
      ctx.fireChannelRead(message);
    }
  }
}
