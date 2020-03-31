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

package org.openqa.selenium.remote.http.netty;

import org.asynchttpclient.AsyncHttpClient;
import org.asynchttpclient.ListenableFuture;
import org.asynchttpclient.ws.WebSocketListener;
import org.asynchttpclient.ws.WebSocketUpgradeHandler;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.ConnectionFailedException;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;

class NettyWebSocket implements WebSocket {

  private static final Logger log = Logger.getLogger(NettyWebSocket.class.getName());

  private final org.asynchttpclient.ws.WebSocket socket;

  private NettyWebSocket(AsyncHttpClient client, org.asynchttpclient.Request request, Listener listener) {
    Objects.requireNonNull(client, "HTTP client to use must be set.");
    Objects.requireNonNull(listener, "WebSocket listener must be set.");

    try {
      URL origUrl = new URL(request.getUrl());
      URI wsUri = new URI("ws", null, origUrl.getHost(), origUrl.getPort(), origUrl.getPath(), null, null);
      ListenableFuture<org.asynchttpclient.netty.ws.NettyWebSocket> future = client.prepareGet(wsUri.toString())
        .execute(new WebSocketUpgradeHandler.Builder()
          .addWebSocketListener(new WebSocketListener() {
            @Override
            public void onOpen(org.asynchttpclient.ws.WebSocket websocket) {
            }

            @Override
            public void onClose(org.asynchttpclient.ws.WebSocket websocket, int code, String reason) {
              listener.onClose(code, reason);
            }

            @Override
            public void onError(Throwable t) {
              listener.onError(t);
            }

            @Override
            public void onTextFrame(String payload, boolean finalFragment, int rsv) {
              if (payload != null) {
                listener.onText(payload);
              }
            }
          }).build());
      socket = future.toCompletableFuture()
        .exceptionally(t -> {t.printStackTrace(); return null;})
        .get();

      if (socket == null) {
        throw new ConnectionFailedException("Unable to establish websocket connection to " + request.getUrl());
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      log.log(Level.WARNING, "NettyWebSocket initial request interrupted", e);
      throw new ConnectionFailedException("NettyWebSocket initial request interrupted", e);
    } catch (ExecutionException | MalformedURLException | URISyntaxException e) {
      throw new ConnectionFailedException("NettyWebSocket initial request execution error", e);
    }
  }

  static BiFunction<HttpRequest, Listener, WebSocket> create(ClientConfig config, AsyncHttpClient client) {
    Filter filter = config.filter();

    Function<HttpRequest, HttpRequest> filterRequest = req -> {
      AtomicReference<HttpRequest> ref = new AtomicReference<>();
      filter.andFinally(in -> {
        ref.set(in);
        return new HttpResponse();
      }).execute(req);
      return ref.get();
    };

    return (req, listener) -> {
      HttpRequest filtered = filterRequest.apply(req);

      org.asynchttpclient.Request nettyReq = NettyMessages.toNettyRequest(config.baseUri(), filtered);

      return new NettyWebSocket(client, nettyReq, listener);
    };
  }

  @Override
  public WebSocket send(Message message) {
    if (message instanceof BinaryMessage) {
      socket.sendBinaryFrame(((BinaryMessage) message).data());
    } else if (message instanceof CloseMessage) {
      socket.sendCloseFrame(((CloseMessage) message).code(), ((CloseMessage) message).reason());
    } else if (message instanceof TextMessage) {
      socket.sendTextFrame(((TextMessage) message).text());
    }

    return this;
  }

  @Override
  public WebSocket sendText(CharSequence data) {
    socket.sendTextFrame(data.toString());
    return this;
  }

  @Override
  public void close() {
    socket.sendCloseFrame(1000, "WebDriver closing socket");
  }
}
