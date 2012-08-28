/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.base.Charsets;
import com.google.common.base.Joiner;
import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpMethod;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.handler.codec.http.HttpResponseStatus;
import org.jboss.netty.handler.codec.http.HttpVersion;
import org.jboss.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.PongWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.WebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.WebSocketServerHandshaker;
import org.jboss.netty.handler.codec.http.websocketx.WebSocketServerHandshakerFactory;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.logging.Logger;

/**
 * Simple handler for the SafariDriver. Will initiate WebSocket connections,
 * quickly respond to /favicon.ico requests with a 204, and return the
 * SafariDriver connection page for all other HTTP requests.
 */
class SafariDriverChannelHandler extends SimpleChannelUpstreamHandler {
  
  private final Logger log = Logger.getLogger(SafariDriverChannelHandler.class.getName());

  // TODO: To ensure the message stays in sync, this script should be compiled
  // using the //javascript/safari-driver source and saved as a resource in
  // the JAR. This woud also allow this logic to be shared with the other
  // language bindings.
  private static final String CONNECT_TEMPLATE = Joiner.on("\n").join(
      "<!DOCTYPE html>",
      "<h2>SafariDriver requesting connection at ws://localhost:%d</h2>",
      "<script>",
      "// Must wait for onload so the injected script is loaded by the",
      "// SafariDriver extension",
      "window.onload = function() {",
      "  window.postMessage({",
      "    'type': 'connect',",
      "    'origin': 'webdriver',",
      "    'url': 'ws://localhost:%d'",
      "  }, '*');",
      "};",
      "</script>");

  private final BlockingQueue<SafariDriverConnection> connectionQueue;
  private final UUID id;
  private final int port;

  private volatile SafariDriverConnection connection;
  private WebSocketServerHandshaker handshaker;

  public SafariDriverChannelHandler(int port,
      BlockingQueue<SafariDriverConnection> connectionQueue) {
    this.port = port;
    this.id = UUID.randomUUID();
    this.connectionQueue = connectionQueue;
  }

  @Override
  public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
    if (e.getMessage() instanceof HttpRequest) {
      HttpRequest request = (HttpRequest) e.getMessage();
      if ("websocket".equalsIgnoreCase(request.getHeader(HttpHeaders.Names.UPGRADE))) {
        performWebSocketHandshake(ctx, request);
        return;
      }
      
      List<String> connectionHeaders = request.getHeaders(HttpHeaders.Names.CONNECTION);
      for (String header : connectionHeaders) {
        if ("upgrade".equalsIgnoreCase(header)) {
          performWebSocketHandshake(ctx, request);
          return;
        }
      }

      if (request.getMethod() != HttpMethod.GET && request.getMethod() != HttpMethod.HEAD) {
        sendNotAllowedResponse(ctx, request, HttpMethod.GET, HttpMethod.HEAD);
      } else if ("/favicon.ico".equals(request.getUri())) {
        handleFaviconRequest(ctx, request);
      } else {
        handleMainPageRequest(ctx, request);
      }

    } else if (e.getMessage() instanceof WebSocketFrame) {
      handleWebSocketFrame(ctx, (WebSocketFrame) e.getMessage());
    } else {
      super.messageReceived(ctx, e);
    }
  }
  
  private void handleFaviconRequest(ChannelHandlerContext ctx, HttpRequest request) {
    HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1,
        HttpResponseStatus.NO_CONTENT);
    response.setHeader(HttpHeaders.Names.CONTENT_LENGTH, 0);
    sendResponse(ctx, request, response);
  }

  private void handleMainPageRequest(ChannelHandlerContext ctx, HttpRequest request) {
    HttpResponse response = new DefaultHttpResponse(HttpVersion.HTTP_1_1,
        HttpResponseStatus.OK);
    response.setHeader(HttpHeaders.Names.CONTENT_TYPE, "text/html; charset=UTF-8");

    String content = String.format(CONNECT_TEMPLATE, port, port);

    response.setContent(ChannelBuffers.copiedBuffer(content, Charsets.UTF_8));
    response.setHeader(HttpHeaders.Names.CONTENT_LENGTH,
        response.getContent().readableBytes());
    sendResponse(ctx, request, response);
  }

  private void performWebSocketHandshake(final ChannelHandlerContext ctx, HttpRequest request) {
    log.fine("Performing WebSocket handshake");

    if (request.getMethod() != HttpMethod.GET) {
      log.fine("Invalid handshake method: " + request.getMethod() + "; must be GET");
      sendNotAllowedResponse(ctx, request, HttpMethod.GET);
      return;
    }

    String websocketUrl = String.format("ws://%s%s",
        request.getHeader(HttpHeaders.Names.HOST), request.getUri());
    String noSubProtocols = null;
    boolean noExtensions = false;

    WebSocketServerHandshakerFactory handshakerFactory = new WebSocketServerHandshakerFactory(
        websocketUrl, noSubProtocols, noExtensions);
    handshaker = handshakerFactory.newHandshaker(request);

    if (handshaker == null) {
      handshakerFactory.sendUnsupportedWebSocketVersionResponse(ctx.getChannel());
    } else {
      handshaker.handshake(ctx.getChannel(), request).addListener(new ChannelFutureListener() {
        @Override
        public void operationComplete(ChannelFuture future) throws Exception {
          if (!future.isSuccess()) {
            log.warning("WebSocket handshake failed");
            return;
          }

          log.info("Connection opened");

          WebSocketConnection webSocketConnection = new WebSocketConnection(ctx.getChannel());
          connection = new SafariDriverConnection(webSocketConnection);

          try {
            connectionQueue.put(connection);
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
          }
        }
      });
    }
  }
  
  private void sendNotAllowedResponse(ChannelHandlerContext ctx, HttpRequest request,
      HttpMethod... allowedMethods) {
    HttpResponse response = new DefaultHttpResponse(
        HttpVersion.HTTP_1_1, HttpResponseStatus.METHOD_NOT_ALLOWED);
    response.setHeader(HttpHeaders.Names.ALLOW, Joiner.on(",").join(allowedMethods));
    response.setHeader(HttpHeaders.Names.CONTENT_LENGTH, 0);
    sendResponse(ctx, request, response);
  }

  private void sendResponse(ChannelHandlerContext ctx, HttpRequest request, HttpResponse response) {
    ChannelFuture future = ctx.getChannel().write(response);
    if (!HttpHeaders.isKeepAlive(request) || response.getStatus().getCode() != 200) {
      future.addListener(ChannelFutureListener.CLOSE);
    }
  }
  
  private void handleWebSocketFrame(ChannelHandlerContext ctx, WebSocketFrame frame) {
    if (frame instanceof CloseWebSocketFrame) {
      log.fine("Socket closed by client");
      handshaker.close(ctx.getChannel(), (CloseWebSocketFrame) frame);
    } else if (frame instanceof PingWebSocketFrame) {
      ctx.getChannel().write(new PongWebSocketFrame(frame.getBinaryData()));
    } else {
      checkState(frame instanceof TextWebSocketFrame);
      checkState(connection != null);

      TextWebSocketFrame textFrame = (TextWebSocketFrame) frame;
      log.fine("Received message: " + textFrame.getText());
      connection.onMessage(textFrame.getText());
    }
  }
}
