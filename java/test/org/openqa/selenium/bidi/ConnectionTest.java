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

package org.openqa.selenium.bidi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

@Tag("UnitTests")
class ConnectionTest {

  private static final Json JSON = new Json();

  private FakeWebSocket socket;
  private WebSocket.Listener listener;
  private Connection connection;

  @BeforeEach
  void setUp() {
    socket = new FakeWebSocket();
    connection =
        new Connection(
            new FakeHttpClient(
                (request, l) -> {
                  listener = l;
                  return socket;
                }),
            "ws://localhost:4444/session/1/se/bidi");
  }

  @Test
  void deliversTheParsedResultToATypedCommandMapper() throws Exception {
    CompletableFuture<Map<String, Object>> future =
        connection.send(
            new Command<Map<String, Object>>("session.status", Map.of(), Json.MAP_TYPE));

    respondWithResult(lastSentId(), "{\"ready\": true, \"message\": \"ok\"}");

    assertThat(get(future)).containsEntry("ready", true).containsEntry("message", "ok");
  }

  @Test
  void handsTheMapperTheAlreadyParsedResultObject() throws Exception {
    Function<Object, String> mapper = result -> ((Map<?, ?>) result).get("token").toString();
    CompletableFuture<String> future =
        connection.send(new Command<>("session.new", Map.of(), mapper));

    respondWithResult(lastSentId(), "{\"token\": \"abc-123\"}");

    assertThat(get(future)).isEqualTo("abc-123");
  }

  @Test
  void completesExceptionallyForAnErrorResponse() {
    CompletableFuture<Object> future =
        connection.send(new Command<>("browsingContext.navigate", Map.of()));

    respond(
        "{\"type\": \"error\", \"id\": "
            + lastSentId()
            + ", \"error\": \"unknown command\", \"message\": \"nope\"}");

    assertThatThrownBy(() -> get(future))
        .isInstanceOf(ExecutionException.class)
        .cause()
        .isInstanceOf(WebDriverException.class);
  }

  @Test
  void propagatesAnExceptionThrownByTheMapper() {
    Function<Object, String> mapper =
        result -> {
          throw new IllegalStateException("boom");
        };
    CompletableFuture<String> future =
        connection.send(new Command<>("script.evaluate", Map.of(), mapper));

    respondWithResult(lastSentId(), "{}");

    assertThatThrownBy(() -> get(future))
        .isInstanceOf(ExecutionException.class)
        .cause()
        .isInstanceOf(IllegalStateException.class)
        .hasMessage("boom");
  }

  @Test
  void dropsTheCallbackOnceHandledSoALateDuplicateResponseChangesNothing() throws Exception {
    CompletableFuture<Map<String, Object>> future =
        connection.send(
            new Command<Map<String, Object>>("session.status", Map.of(), Json.MAP_TYPE));
    long id = lastSentId();

    respondWithResult(id, "{\"ready\": true}");
    assertThat(get(future)).containsEntry("ready", true);

    // A second response carrying the same id must not throw or re-complete the future.
    respondWithResult(id, "{\"ready\": false}");
    assertThat(future.get(2, TimeUnit.SECONDS)).containsEntry("ready", true);
  }

  @Test
  void ignoresAResponseForAnUnknownIdAndStillHandlesRealOnes() throws Exception {
    CompletableFuture<Map<String, Object>> future =
        connection.send(
            new Command<Map<String, Object>>("session.status", Map.of(), Json.MAP_TYPE));
    long id = lastSentId();

    respondWithResult(id + 987_654L, "{\"ready\": false}"); // nobody is waiting for this id
    respondWithResult(id, "{\"ready\": true}"); // the registered callback still fires

    assertThat(get(future)).containsEntry("ready", true);
  }

  private long lastSentId() {
    String sent = socket.lastText.get();
    assertThat(sent).as("a command frame was written to the socket").isNotNull();
    Map<String, Object> frame = JSON.toType(sent, Json.MAP_TYPE);
    return ((Number) frame.get("id")).longValue();
  }

  private void respondWithResult(long id, String resultJson) {
    respond("{\"type\": \"success\", \"id\": " + id + ", \"result\": " + resultJson + "}");
  }

  private void respond(String message) {
    listener.onText(message);
  }

  private static <T> T get(CompletableFuture<T> future) throws Exception {
    return future.get(5, TimeUnit.SECONDS);
  }

  private static class FakeWebSocket implements WebSocket {

    private final AtomicReference<String> lastText = new AtomicReference<>();

    @Override
    public WebSocket send(Message message) {
      if (message instanceof TextMessage) {
        lastText.set(((TextMessage) message).text());
      }
      return this;
    }

    @Override
    public void close() {}
  }

  private static class FakeHttpClient implements HttpClient {

    private interface SocketOpener {
      WebSocket open(HttpRequest request, WebSocket.Listener listener);
    }

    private final SocketOpener opener;

    private FakeHttpClient(SocketOpener opener) {
      this.opener = opener;
    }

    @Override
    public WebSocket openSocket(HttpRequest request, WebSocket.Listener listener) {
      return opener.open(request, listener);
    }

    @Override
    public HttpResponse execute(HttpRequest request) {
      throw new UnsupportedOperationException("execute");
    }
  }
}
