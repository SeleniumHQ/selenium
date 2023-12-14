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
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.util.AttributeKey;
import java.util.function.Consumer;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Message;

class WebSocketMessageHandler extends SimpleChannelInboundHandler<Message> {

  private final AttributeKey<Consumer<Message>> key;

  public WebSocketMessageHandler(AttributeKey<Consumer<Message>> key) {
    this.key = Require.nonNull("Attribute key", key);
  }

  @Override
  protected void channelRead0(ChannelHandlerContext ctx, Message msg) {
    if (!(ctx.channel().hasAttr(key))) {
      return;
    }

    Consumer<Message> handler = ctx.channel().attr(key).get();

    ctx.executor()
        .execute(
            () -> {
              try {
                handler.accept(msg);
                ctx.flush();
              } catch (Throwable t) {
                ctx.fireExceptionCaught(t);
              }
            });
  }
}
