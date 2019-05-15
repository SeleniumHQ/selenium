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

package org.openqa.selenium.remote.internal;

import org.openqa.selenium.remote.http.WebSocket;

import okhttp3.Response;
import okhttp3.WebSocketListener;

import java.io.UncheckedIOException;
import java.util.Objects;

class OkHttpWebSocket implements WebSocket {

  private final okhttp3.WebSocket socket;

  OkHttpWebSocket(okhttp3.OkHttpClient client, okhttp3.Request request, Listener listener) {
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

  @Override
  public WebSocket sendText(CharSequence data) {
    socket.send(data.toString());
    return this;
  }

  @Override
  public void close() throws UncheckedIOException {
    socket.close(1000, "WebDriver closing socket");
  }

  @Override
  public void abort() {
    socket.cancel();
  }
}
