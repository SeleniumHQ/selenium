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

package org.openqa.selenium.remote.http.okhttp;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocketListener;
import okio.ByteString;
import org.openqa.selenium.remote.http.BinaryMessage;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.CloseMessage;
import org.openqa.selenium.remote.http.Filter;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.BiFunction;
import java.util.function.Function;

class OkHttpWebSocket implements WebSocket {

  private final okhttp3.WebSocket socket;

  private OkHttpWebSocket(okhttp3.OkHttpClient client, okhttp3.Request request, Listener listener) {
    Objects.requireNonNull(client, "HTTP client to use must be set.");
    Objects.requireNonNull(request, "Request to send must be set.");
    Objects.requireNonNull(listener, "WebSocket listener must be set.");

    socket = client.newWebSocket(request, new WebSocketListener() {
      @Override
      public void onMessage(okhttp3.WebSocket webSocket, String text) {
        if (text != null) {
          listener.onText(text);
        }
      }

      @Override
      public void onClosed(okhttp3.WebSocket webSocket, int code, String reason) {
        listener.onClose(code, reason);
      }

      @Override
      public void onFailure(okhttp3.WebSocket webSocket, Throwable t, Response response) {
        listener.onError(t);
      }
    });
  }

  static BiFunction<HttpRequest, WebSocket.Listener, WebSocket> create(ClientConfig config) {
    Filter filter = config.filter();

    Function<HttpRequest, HttpRequest> filterRequest = req -> {
      AtomicReference<HttpRequest> ref = new AtomicReference<>();
      filter.andFinally(in -> {
        ref.set(in);
        return new HttpResponse();
      }).execute(req);
      return ref.get();
    };

    OkHttpClient client = new CreateOkClient().apply(config);
    return (req, listener) -> {
      HttpRequest filtered = filterRequest.apply(req);

      Request okReq = OkMessages.toOkHttpRequest(config.baseUri(), filtered);

      return new OkHttpWebSocket(client, okReq, listener);
    };
  }

  @Override
  public WebSocket send(Message message) {
    if (message instanceof BinaryMessage) {
      byte[] data = ((BinaryMessage) message).data();
      socket.send(ByteString.of(data, 0, data.length));
    } else if (message instanceof CloseMessage) {
      socket.close(((CloseMessage) message).code(), ((CloseMessage) message).reason());
    } else if (message instanceof TextMessage) {
      socket.send(((TextMessage) message).text());
    }

    return this;
  }

  @Override
  public void close() {
    socket.close(1000, "WebDriver closing socket");
  }
}
