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
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.websocketx.BinaryWebSocketFrame;
import io.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import io.netty.handler.codec.http.websocketx.ContinuationWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import io.netty.handler.codec.http.websocketx.PongWebSocketFrame;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketServerHandshaker;
import io.netty.handler.codec.http.websocketx.WebSocketServerHandshakerFactory;
import io.netty.util.AttributeKey;
import org.openqa.selenium.remote.http.Message;

import java.util.Objects;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Consumer;

import static io.netty.handler.codec.http.HttpMethod.GET;
import static io.netty.handler.codec.http.HttpResponseStatus.BAD_REQUEST;
import static io.netty.handler.codec.http.HttpUtil.isKeepAlive;
import static io.netty.handler.codec.http.HttpUtil.setContentLength;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;
import static java.nio.charset.StandardCharsets.UTF_8;

// Plenty of code in this class is taken from Netty's own
// AutobahnServerHandler. That code is also licensed under the Apache 2
// license, but it's always good to give thanks. Thank you, Netty folks!

class WebSocketUpgradeHandler extends ChannelInboundHandlerAdapter {

  private final AttributeKey<Consumer<Message>> key;
  private final BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> factory;
  private WebSocketServerHandshaker handshaker;

  public WebSocketUpgradeHandler(
    AttributeKey<Consumer<Message>> key,
    BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> factory) {
    this.key = Objects.requireNonNull(key);
    this.factory = Objects.requireNonNull(factory);
  }

  @Override
  public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
    if (msg instanceof HttpRequest) {
      handleHttpRequest(ctx, (HttpRequest) msg);
    } else if (msg instanceof WebSocketFrame) {
      handleWebSocketFrame(ctx, (WebSocketFrame) msg);
    } else {
      super.channelRead(ctx, msg);
    }
  }

  @Override
  public void channelReadComplete(ChannelHandlerContext ctx) {
    ctx.flush();
  }

  private void handleHttpRequest(ChannelHandlerContext ctx, HttpRequest req) {
    // Handle a bad request.
    if (!req.decoderResult().isSuccess()) {
      sendHttpResponse(ctx, req, new DefaultFullHttpResponse(HTTP_1_1, BAD_REQUEST, ctx.alloc().buffer(0)));
      return;
    }

    // Allow only GET methods.
    if (!GET.equals(req.method())) {
      // Let the rest of the pipeline handle this.
      ctx.fireChannelRead(req);
      return;
    }

    // Only handle the initial HTTP upgrade request
    if (!(req.headers().contains("Connection", "upgrade", true) &&
        req.headers().contains("Sec-WebSocket-Version"))) {
      ctx.fireChannelRead(req);
      return;
    }

    // Is this something we should try and handle?
    Optional<Consumer<Message>> maybeHandler = factory.apply(
      req.uri(),
      msg -> {
        Objects.requireNonNull(msg, "Message to send must be set.");
        ctx.channel().writeAndFlush(msg);
      });
    if (!maybeHandler.isPresent()) {
      sendHttpResponse(ctx, req, new DefaultFullHttpResponse(HTTP_1_1, BAD_REQUEST, ctx.alloc().buffer(0)));
      return;
    }

    // Handshake
    WebSocketServerHandshakerFactory wsFactory = new WebSocketServerHandshakerFactory(
      getWebSocketLocation(req), null, false, Integer.MAX_VALUE);
    handshaker = wsFactory.newHandshaker(req);
    if (handshaker == null) {
      WebSocketServerHandshakerFactory.sendUnsupportedVersionResponse(ctx.channel());
    } else {
      ChannelFuture future = handshaker.handshake(ctx.channel(), req);
      future.addListener((ChannelFutureListener) channelFuture -> {
        if (!future.isSuccess()) {
          ctx.fireExceptionCaught(future.cause());
        } else {
          ctx.channel().attr(key).setIfAbsent(maybeHandler.get());
        }
      });
    }
  }

  private void handleWebSocketFrame(ChannelHandlerContext ctx, WebSocketFrame frame) {
    if (frame instanceof CloseWebSocketFrame) {
      handshaker.close(ctx.channel(), (CloseWebSocketFrame) frame);
      // Pass on to the rest of the channel
      ctx.fireChannelRead(frame);
    } else if (frame instanceof PingWebSocketFrame) {
      ctx.write(new PongWebSocketFrame(frame.isFinalFragment(), frame.rsv(), frame.content()));
    } else if (frame instanceof ContinuationWebSocketFrame) {
      ctx.write(frame);
    } else if (frame instanceof PongWebSocketFrame) {
      frame.release();
    } else if (frame instanceof BinaryWebSocketFrame || frame instanceof TextWebSocketFrame) {
      // Allow the rest of the pipeline to deal with this.
      ctx.fireChannelRead(frame);
    } else {
      throw new UnsupportedOperationException(String.format("%s frame types not supported", frame.getClass()
        .getName()));
    }
  }

  private static void sendHttpResponse(
    ChannelHandlerContext ctx, HttpRequest req, FullHttpResponse res) {
    // Generate an error page if response status code is not OK (200).
    if (res.status().code() != 200) {
      ByteBuf buf = Unpooled.copiedBuffer(res.status().toString(), UTF_8);
      res.content().writeBytes(buf);
      buf.release();
      setContentLength(res, res.content().readableBytes());
    }

    // Send the response and close the connection if necessary.
    ChannelFuture f = ctx.channel().writeAndFlush(res);
    if (!isKeepAlive(req) || res.status().code() != 200) {
      f.addListener(ChannelFutureListener.CLOSE);
    }
  }

  @Override
  public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
    ctx.close();
  }

  private static String getWebSocketLocation(HttpRequest req) {
    return "ws://" + req.headers().get(HttpHeaderNames.HOST);
  }
}
