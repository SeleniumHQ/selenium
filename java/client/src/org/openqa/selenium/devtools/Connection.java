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

package org.openqa.selenium.devtools;

import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.Json;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

import java.io.Closeable;
import java.util.Map;
import java.util.Objects;

public class Connection implements Closeable {

  private static final Json JSON = new Json();
  private final WebSocket socket;
  private final OkHttpClient client;

  public Connection(String url) {
    Objects.requireNonNull(url, "URL to connect to must be set.");

    client = new OkHttpClient.Builder().build();

    Request request = new Request.Builder()
        .url(url)
        .build();

    socket = client.newWebSocket(request, new Listener());
  }

  public void send(Command command) {
    socket.send(JSON.toJson(command));
  }

  public void onMessage(Message message) {
    System.out.println(message);
  }

  public void onEvent(Event event) {
    System.out.println(event);
  }


  @Override
  public void close() {
    socket.close(1000, "Exiting");
    client.dispatcher().executorService().shutdown();
  }

  public static void main(String[] args) throws Exception {
    try (Connection connection = new Connection(
        "http://127.0.0.1:9222/devtools/browser/cbd28705-5dfd-4c6c-b665-64940e252078")) {
      Command command = new Command("Target.setDiscoverTargets", ImmutableMap.of("discover", true));
      connection.send(command);
    }
  }

  private class Listener extends WebSocketListener {

    @Override
    public void onMessage(WebSocket webSocket, String text) {
      Map<String, Object> raw = JSON.toType(text, MAP_TYPE);
      if (raw.get("id") instanceof Number && raw.get("result") != null) {
        Message message = new Message(((Number) raw.get("id")).longValue(), raw.get("result"));
        Connection.this.onMessage(message);
      } else if (raw.get("method") instanceof String && raw.get("params") instanceof Map) {
        Event event = new Event(
            (String) raw.get("method"),
            (Map<?, ?>) raw.get("params"));
        onEvent(event);
      } else {
        System.out.println("Unhandled type: " + text);
      }

    }

    @Override
    public void onClosing(WebSocket webSocket, int code, String reason) {
      super.onClosing(webSocket, code, reason);
    }

    @Override
    public void onFailure(WebSocket webSocket, Throwable t, Response response) {
      super.onFailure(webSocket, t, response);
    }
  }
}
