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

import static io.netty.handler.codec.http.HttpMethod.GET;
import static io.netty.handler.codec.http.HttpResponseStatus.BAD_REQUEST;
import static io.netty.handler.codec.http.HttpUtil.isKeepAlive;
import static io.netty.handler.codec.http.HttpUtil.setContentLength;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;
import static java.nio.charset.StandardCharsets.UTF_8;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundHandlerAdapter;
import io.netty.channel.ChannelPipeline;
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
import io.netty.handler.timeout.IdleStateHandler;
import io.netty.util.AttributeKey;
import java.util.Arrays;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.Message;

// Plenty of code in this class is taken from Netty's own
// AutobahnServerHandler. That code is also licensed under the Apache 2
// license, but it's always good to give thanks. Thank you, Netty folks!

class WebSocketUpgradeHandler extends ChannelInboundHandlerAdapter {

  private static final Logger LOG = Logger.getLogger(WebSocketUpgradeHandler.class.getName());
  private final AttributeKey<Consumer<Message>> key;
  private final BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> factory;
  private @Nullable WebSocketServerHandshaker handshaker;

  public WebSocketUpgradeHandler(
      AttributeKey<Consumer<Message>> key,
      BiFunction<String, Consumer<Message>, Optional<Consumer<Message>>> factory) {
    this.key = Require.nonNull("Key", key);
    this.factory = Require.nonNull("Factory", factory);
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

  private static String getWebSocketLocation(HttpRequest req) {
    return "ws://" + req.headers().get(HttpHeaderNames.HOST);
  }

  private static void releaseHandlerOnHandshakeFailure(
      Consumer<Message> handler, int code, String reason) {
    try {
      handler.accept(new CloseMessage(code, reason));
    } catch (Exception ex) {
      LOG.log(Level.FINE, "failed to release handler on handshake failure", ex);
    }
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
      sendHttpResponse(
          ctx, req, new DefaultFullHttpResponse(HTTP_1_1, BAD_REQUEST, ctx.alloc().buffer(0)));
      return;
    }

    // Allow only GET methods.
    if (!GET.equals(req.method())) {
      // Let the rest of the pipeline handle this.
      ctx.fireChannelRead(req);
      return;
    }

    // Only handle the initial HTTP upgrade request
    if (!(req.headers().containsValue("Connection", "upgrade", true)
        && req.headers().contains("Sec-WebSocket-Version"))) {
      ctx.fireChannelRead(req);
      return;
    }

    // Is this something we should try and handle?
    Optional<Consumer<Message>> maybeHandler =
        factory.apply(
            req.uri(), msg -> ctx.channel().writeAndFlush(Require.nonNull("Message to send", msg)));
    if (maybeHandler.isEmpty()) {
      sendHttpResponse(
          ctx, req, new DefaultFullHttpResponse(HTTP_1_1, BAD_REQUEST, ctx.alloc().buffer(0)));
      return;
    }

    // Handshake
    WebSocketServerHandshakerFactory wsFactory =
        new WebSocketServerHandshakerFactory(
            getWebSocketLocation(req), null, true, Integer.MAX_VALUE);
    handshaker = wsFactory.newHandshaker(req);
    if (handshaker == null) {
      // The factory has already opened the upstream and (on the Node) acquired a connection
      // slot. Drive the consumer through its CloseMessage cleanup path before we send the
      // unsupported-version response, otherwise the upstream and the slot leak.
      releaseHandlerOnHandshakeFailure(maybeHandler.get(), 1002, "unsupported websocket version");
      WebSocketServerHandshakerFactory.sendUnsupportedVersionResponse(ctx.channel());
    } else {
      ChannelFuture future = handshaker.handshake(ctx.channel(), req);
      future.addListener(
          (ChannelFutureListener)
              channelFuture -> {
                if (!future.isSuccess()) {
                  // Same leak path: the consumer was never registered in the channel attr,
                  // so the generic exceptionCaught handler will not see it. Drive cleanup
                  // here so the upstream and any acquired slot are released.
                  releaseHandlerOnHandshakeFailure(
                      maybeHandler.get(), 1011, "websocket handshake failed");
                  ctx.fireExceptionCaught(future.cause());
                } else {
                  Consumer<Message> handler = maybeHandler.get();
                  ctx.channel().attr(key).setIfAbsent(handler);

                  // Install application-level keepalive for all WebSocket connections.
                  // Cloud LBs (AWS ALB: 60 s, k8s ingress-nginx: 60 s) silently drop idle
                  // TCP connections; OS-level SO_KEEPALIVE alone is not enough because
                  // most LBs ignore TCP keepalive probes. A WS ping every 30 s resets
                  // the LB's idle timer at the application level.
                  ChannelPipeline pipeline = ctx.pipeline();
                  pipeline.addAfter(
                      "ws-protocol",
                      "ws-idle",
                      new IdleStateHandler(
                          0, WebSocketKeepAliveHandler.PING_INTERVAL_SECONDS, 0, TimeUnit.SECONDS));
                  pipeline.addAfter("ws-idle", "ws-keepalive", new WebSocketKeepAliveHandler());

                  // Allow the handler to rewire the pipeline now that the channel
                  // is fully in WebSocket mode (HTTP codec no longer active).
                  if (handler instanceof PostUpgradeHook) {
                    ((PostUpgradeHook) handler).onUpgradeComplete(ctx);
                  }
                }
              });
    }
  }

  private void handleWebSocketFrame(ChannelHandlerContext ctx, WebSocketFrame frame) {
    if (frame instanceof CloseWebSocketFrame) {
      try {
        CloseWebSocketFrame close = (CloseWebSocketFrame) frame.retain();
        // Invoke the consumer synchronously BEFORE sending the close response.
        // This avoids race conditions when trying to reuse the connection slot.
        Consumer<Message> consumer = ctx.channel().attr(key).getAndSet(null);
        if (consumer != null) {
          try {
            consumer.accept(new CloseMessage(close.statusCode(), close.reasonText()));
          } catch (Exception ex) {
            LOG.log(Level.FINE, "failed to handle close message", ex);
          }
        }
        handshaker.close(ctx.channel(), close);
        // Pass on to the rest of the channel for any other handlers
        ctx.fireChannelRead(close);
      } finally {
        // ensure attribute is cleared even if consumer invocation failed
        ctx.channel().attr(key).set(null);
      }
    } else if (frame instanceof PingWebSocketFrame) {
      ctx.write(new PongWebSocketFrame(frame.isFinalFragment(), frame.rsv(), frame.content()));
    } else if (frame instanceof PongWebSocketFrame) {
      frame.release();
    } else if (frame instanceof BinaryWebSocketFrame
        || frame instanceof TextWebSocketFrame
        || frame instanceof ContinuationWebSocketFrame) {
      // Allow the rest of the pipeline to deal with this.
      ctx.fireChannelRead(frame);
    } else {
      throw new UnsupportedOperationException(
          String.format("%s frame types not supported", frame.getClass().getName()));
    }
  }

  @Override
  public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
    try {
      Consumer<Message> consumer = ctx.channel().attr(key).getAndSet(null);

      if (consumer != null) {
        byte[] reason = Objects.toString(cause).getBytes(UTF_8);

        // the spec defines it as max 123 bytes encoded in UTF_8
        if (reason.length > 123) {
          reason = Arrays.copyOf(reason, 123);
          Arrays.fill(reason, 120, 123, (byte) '.');
        }

        try {
          consumer.accept(new CloseMessage(1011, new String(reason, UTF_8)));
        } catch (Exception ex) {
          LOG.log(Level.FINE, "failed to send the close message, code: 1011", ex);
        }
      }
    } finally {
      LOG.log(Level.FINE, "exception caught, close the context", cause);
      ctx.close();
    }
  }

  @Override
  public void channelInactive(ChannelHandlerContext ctx) throws Exception {
    try {
      super.channelInactive(ctx);
    } finally {
      Consumer<Message> consumer = ctx.channel().attr(key).getAndSet(null);

      if (consumer != null) {
        CloseMessage channelGotInactive = new CloseMessage(1001, "channel got inactive");
        try {
          consumer.accept(channelGotInactive);
        } catch (RuntimeException ex) {
          LOG.log(Level.FINE, ex, () -> "failed to send " + channelGotInactive);
        }
      }
    }
  }
}
