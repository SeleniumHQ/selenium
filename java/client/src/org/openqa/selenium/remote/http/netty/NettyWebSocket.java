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
import org.asynchttpclient.ws.WebSocketListener;
import org.asynchttpclient.ws.WebSocketUpgradeHandler;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.WebSocket;

import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BiFunction;
import java.util.function.Function;

class NettyWebSocket implements WebSocket {

  private org.asynchttpclient.ws.WebSocket socket;

  private NettyWebSocket(AsyncHttpClient client, org.asynchttpclient.Request request, Listener listener) {
    Objects.requireNonNull(client, "HTTP client to use must be set.");
    Objects.requireNonNull(listener, "WebSocket listener must be set.");

    try {
      socket = client.prepareGet(request.toString().replace("http://", "ws://"))
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
                       }).build()).get();
    } catch (InterruptedException e) {
      e.printStackTrace();
    } catch (ExecutionException e) {
      e.printStackTrace();
    }
  }

  static BiFunction<HttpRequest, Listener, WebSocket> create(ClientConfig config) {
    Filter filter = config.filter();

    Function<HttpRequest, HttpRequest> filterRequest = req -> {
      AtomicReference<HttpRequest> ref = new AtomicReference<>();
      filter.andFinally(in -> {
        ref.set(in);
        return new HttpResponse();
      }).execute(req);
      return ref.get();
    };

    AsyncHttpClient client = new CreateNettyClient().apply(config);
    return (req, listener) -> {
      HttpRequest filtered = filterRequest.apply(req);

      org.asynchttpclient.Request nettyReq = NettyMessages.toNettyRequest(config.baseUri(), filtered);

      return new NettyWebSocket(client, nettyReq, listener);
    };
  }

  @Override
  public WebSocket sendText(CharSequence data) {
    socket.sendTextFrame(data.toString());
    return this;
  }

  @Override
  public void close() throws UncheckedIOException {
    socket.sendCloseFrame(1000, "WebDriver closing socket");
  }

  @Override
  public void abort() {
    //socket.cancel();
  }
}
