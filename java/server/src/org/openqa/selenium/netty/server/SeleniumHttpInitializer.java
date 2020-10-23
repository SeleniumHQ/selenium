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
import io.netty.channel.ChannelInitializer;
import io.netty.channel.socket.SocketChannel;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.HttpServerKeepAliveHandler;
import io.netty.handler.codec.http.websocketx.extensions.compression.WebSocketServerCompressionHandler;
import io.netty.handler.codec.http2.Http2FrameCodecBuilder;
import io.netty.handler.codec.http2.Http2MultiplexHandler;
import io.netty.handler.ssl.ApplicationProtocolNames;
import io.netty.handler.ssl.ApplicationProtocolNegotiationHandler;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.stream.ChunkedWriteHandler;
import io.netty.util.AttributeKey;

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.Message;

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
    this.seleniumHandler = Require.nonNull("HTTP handler", seleniumHandler);
    this.webSocketHandler = Require.nonNull("WebSocket handler", webSocketHandler);
  }

  @Override
  protected void initChannel(SocketChannel ch) {
    if (sslCtx != null) {
      ch.pipeline().addLast(sslCtx.newHandler(ch.alloc()), new Http2OrHttpHandler());
    } else {
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

  private class Http2OrHttpHandler extends ApplicationProtocolNegotiationHandler {

    protected Http2OrHttpHandler() {
      super(ApplicationProtocolNames.HTTP_1_1);
    }

    @Override
    protected void configurePipeline(ChannelHandlerContext ctx, String protocol) {
      if (ApplicationProtocolNames.HTTP_2.equals(protocol)) {
        configureHttp2(ctx);
      } else if (ApplicationProtocolNames.HTTP_1_1.equals(protocol)) {
        configureHttp1(ctx);
      } else {
        throw new IllegalStateException("Unknown protocol: " + protocol);
      }
    }

    private void configureHttp2(ChannelHandlerContext ctx) {
      ctx.pipeline().addLast(Http2FrameCodecBuilder.forServer().build());
      Http2StreamInitializer streamInitializer = new Http2StreamInitializer(seleniumHandler);
      // Http2MultiplexHandler creates a new child channel for every new stream.
      // Handlers for the child channel are added using the Http2StreamInitializer handler.
      ctx.pipeline().addLast(new Http2MultiplexHandler(streamInitializer));
    }

    private void configureHttp1(ChannelHandlerContext ctx) {
      ctx.pipeline().addLast("codec", new HttpServerCodec());
      ctx.pipeline().addLast("keep-alive", new HttpServerKeepAliveHandler());
      ctx.pipeline().addLast("chunked-write", new ChunkedWriteHandler());

      ctx.pipeline().addLast("ws-compression", new WebSocketServerCompressionHandler());
      ctx.pipeline().addLast("ws-protocol", new WebSocketUpgradeHandler(KEY, webSocketHandler));
      ctx.pipeline().addLast("netty-to-se-messages", new MessageInboundConverter());
      ctx.pipeline().addLast("se-to-netty-messages", new MessageOutboundConverter());
      ctx.pipeline().addLast("se-websocket-handler", new WebSocketMessageHandler(KEY));

      ctx.pipeline().addLast("se-request", new RequestConverter());
      ctx.pipeline().addLast("se-response", new ResponseConverter());
      ctx.pipeline().addLast("se-handler", new SeleniumHandler(seleniumHandler));
    }
  }
}
