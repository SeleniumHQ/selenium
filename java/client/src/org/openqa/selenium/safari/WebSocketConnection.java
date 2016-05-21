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

package org.openqa.selenium.safari;

import static com.google.common.base.Preconditions.checkState;

import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.common.util.concurrent.SettableFuture;

import org.jboss.netty.channel.Channel;
import org.jboss.netty.channel.ChannelFuture;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.ExceptionEvent;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.websocketx.CloseWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.PingWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.PongWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import org.jboss.netty.handler.codec.http.websocketx.WebSocketFrame;

import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;

/**
 * Manages a basic WebSocket connection, coordinate message pairs. Only one message may be
 * sent before a message is received from the remote end.
 */
class WebSocketConnection {

  private final Logger log = Logger.getLogger(WebSocketConnection.class.getName());

  private final Channel channel;

  private final AtomicReference<SettableFuture<String>> pendingResponse =
      new AtomicReference<>();

  public WebSocketConnection(Channel channel) {
    this.channel = channel;

    this.channel.getPipeline().addLast("websocket-handler", new SimpleChannelUpstreamHandler() {
      @Override
      public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
        if (!(e.getMessage() instanceof WebSocketFrame)) {
          ctx.sendUpstream(e);
        } else {
          handleWebSocketFrame((WebSocketFrame) e.getMessage());
        }
      }

      @Override
      public void exceptionCaught(ChannelHandlerContext ctx, ExceptionEvent e) throws Exception {
        handleUncaughtException(e.getCause());
      }
    });

    this.channel.getCloseFuture().addListener(new ChannelFutureListener() {
      @Override
      public void operationComplete(ChannelFuture future) {
        SettableFuture<String> response = pendingResponse.getAndSet(null);
        if (null != response) {
          response.setException(new ConnectionClosedException("The underlying channel was closed"));
        }
      }
    });
  }

  private void handleUncaughtException(Throwable t) {
    SettableFuture<String> response = pendingResponse.getAndSet(null);
    if (null != response) {
      response.setException(t);
    }
  }

  private void handleWebSocketFrame(WebSocketFrame frame) {
    if (frame instanceof CloseWebSocketFrame) {
      SettableFuture<String> response = pendingResponse.getAndSet(null);
      if (null != response) {
        CloseWebSocketFrame f = (CloseWebSocketFrame) frame;
        response.setException(new ConnectionClosedException(
            "The driver socket was closed (" + f.getStatusCode() + ")"));
      }

    } else if (frame instanceof PingWebSocketFrame) {
      channel.write(new PongWebSocketFrame(frame.getBinaryData()));

    } else if (frame instanceof TextWebSocketFrame) {
      SettableFuture<String> response = pendingResponse.getAndSet(null);
      if (null != response) {
        response.set(((TextWebSocketFrame) frame).getText());
      } else {
        log.warning("Unexpected message: " + ((TextWebSocketFrame) frame).getText());
      }

    } else {
      log.fine("Unexpected frame type: " + frame.getClass().getName());
    }
  }

  private void checkChannel() {
    checkState(channel.isOpen() && channel.isConnected(),
               "The WebSocket connection has been closed");
  }

  /**
   * Sends a text frame.
   *
   * @param data The frame data.
   * @return A future that will resolve with a response from the driver.
   * @throws IllegalStateException If the underlying connection is closed or if there is
   *     already a pending response.
   */
  public ListenableFuture<String> send(String data) {
    checkChannel();

    final SettableFuture<String> response = SettableFuture.create();
    response.addListener(new Runnable() {
      @Override
      public void run() {
        pendingResponse.compareAndSet(response, null);
      }
    }, MoreExecutors.directExecutor());

    if (pendingResponse.compareAndSet(null, response)) {
      TextWebSocketFrame frame = new TextWebSocketFrame(data);
      channel.write(frame).addListener(new ChannelFutureListener() {
        @Override
        public void operationComplete(ChannelFuture future) throws Exception {
          if (!future.isSuccess()) {
            response.setException(future.getCause());
          }
        }
      });
      return response;
    }

    throw new IllegalStateException("Currently awaiting a response to a previous message");
  }

  /**
   * Closes this connection. Any pending responses will be canceled.
   */
  public void close() {
    SettableFuture<String> pending = pendingResponse.getAndSet(null);
    channel.write(new CloseWebSocketFrame()).addListener(ChannelFutureListener.CLOSE);
    if (null != pending) {
      pending.cancel(true);
    }
  }
}
