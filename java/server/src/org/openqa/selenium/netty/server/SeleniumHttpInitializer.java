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

import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpServerKeepAliveHandler;
import io.netty.handler.codec.http.websocketx.extensions.compression.WebSocketServerCompressionHandler;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.stream.ChunkedWriteHandler;
import io.netty.util.AttributeKey;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.Message;

import java.util.Objects;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Consumer;

class SeleniumHttpInitializer extends ChannelInitializer<SocketChannel> {

  private static AttributeKey<Consumer<Message>> KEY = AttributeKey.newInstance("se-ws-handler");
  private HttpHandler seleniumHandler;
  private final BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> webSocketHandler;
  private SslContext sslCtx;

  SeleniumHttpInitializer(
    SslContext sslCtx,
    HttpHandler seleniumHandler,
    BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> webSocketHandler) {
    this.sslCtx = sslCtx;
    this.seleniumHandler = Objects.requireNonNull(seleniumHandler);
    this.webSocketHandler = Objects.requireNonNull(webSocketHandler);
  }

  @Override
  protected void initChannel(SocketChannel ch) {
    if (sslCtx != null) {
      ch.pipeline().addLast("ssl", sslCtx.newHandler(ch.alloc()));
    }
    ch.pipeline().addLast("codec", new HttpServerCodec());
    ch.pipeline().addLast("keep-alive", new HttpServerKeepAliveHandler());
    ch.pipeline().addLast("chunked-write", new ChunkedWriteHandler());

    // Websocket magic
    ch.pipeline().addLast("ws-compression", new WebSocketServerCompressionHandler());
    ch.pipeline().addLast("ws-protocol", new WebSocketUpgradeHandler(KEY, webSocketHandler));
    ch.pipeline().addLast("netty-to-se-messages", new MessageInboundConverter());
    ch.pipeline().addLast("se-to-netty-messages", new MessageOutboundConverter());
    ch.pipeline().addLast("se-websocket-handler", new WebSocketMessageHandler(KEY));

    // Regular HTTP magic
    ch.pipeline().addLast("se-request", new RequestConverter());
    ch.pipeline().addLast("se-response", new ResponseConverter());
    ch.pipeline().addLast("se-handler", new SeleniumHandler(seleniumHandler));
  }
}
