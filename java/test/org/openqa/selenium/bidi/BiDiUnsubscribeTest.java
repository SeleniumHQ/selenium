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

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.function.BiConsumer;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Message;
import org.openqa.selenium.remote.http.TextMessage;
import org.openqa.selenium.remote.http.WebSocket;

@Tag("UnitTests")
class BiDiUnsubscribeTest {

  private static final Json JSON = new Json();
  private static final Event<Object> REALM_CREATED =
      new Event<>("script.realmCreated", params -> params);
  private static final String REALM_CREATED_FRAME =
      "{\"type\": \"event\", \"method\": \"script.realmCreated\", \"params\": {\"realm\": \"r1\"}}";

  private WebSocket.Listener listener;

  @Test
  void clearedListenerDoesNotReceiveEventsArrivingDuringUnsubscribe() throws Exception {
    CountDownLatch delivered = new CountDownLatch(1);
    Connection connection =
        connect(
            (id, socketListener) -> {
              socketListener.onText(REALM_CREATED_FRAME);
              awaitQuietly(delivered);
              socketListener.onText(success(id));
            });
    connection.addListener("sub-1", REALM_CREATED, event -> delivered.countDown());

    new BiDi(connection, Duration.ofSeconds(5)).clearListener(REALM_CREATED);

    assertThat(delivered.getCount()).isOne();
    assertThat(connection.isEventSubscribed(REALM_CREATED)).isFalse();
  }

  @Test
  void removedListenerDoesNotReceiveEventsArrivingDuringUnsubscribe() throws Exception {
    CountDownLatch delivered = new CountDownLatch(1);
    Connection connection =
        connect(
            (id, socketListener) -> {
              socketListener.onText(REALM_CREATED_FRAME);
              awaitQuietly(delivered);
              socketListener.onText(success(id));
            });
    connection.addListener("sub-1", REALM_CREATED, event -> delivered.countDown());

    new BiDi(connection, Duration.ofSeconds(5)).removeListener("sub-1");

    assertThat(delivered.getCount()).isOne();
    assertThat(connection.isSubscribed("sub-1")).isFalse();
  }

  @Test
  void keepsListenerWhenTheRemoteEndRejectsUnsubscribe() {
    Connection connection = connect((id, socketListener) -> socketListener.onText(error(id)));
    connection.addListener("sub-1", REALM_CREATED, event -> {});
    BiDi bidi = new BiDi(connection, Duration.ofSeconds(5));

    assertThatThrownBy(() -> bidi.clearListener(REALM_CREATED));
    assertThat(connection.isEventSubscribed(REALM_CREATED)).isTrue();

    assertThatThrownBy(() -> bidi.removeListener("sub-1"));
    assertThat(connection.isSubscribed("sub-1")).isTrue();
  }

  private Connection connect(BiConsumer<Long, WebSocket.Listener> onUnsubscribe) {
    WebSocket socket =
        new WebSocket() {
          @Override
          public WebSocket send(Message message) {
            Map<String, Object> frame = JSON.toType(((TextMessage) message).text(), Json.MAP_TYPE);
            if ("session.unsubscribe".equals(frame.get("method"))) {
              onUnsubscribe.accept(((Number) frame.get("id")).longValue(), listener);
            }
            return this;
          }

          @Override
          public void close() {}
        };
    return new Connection(
        new HttpClient() {
          @Override
          public WebSocket openSocket(HttpRequest request, WebSocket.Listener l) {
            listener = l;
            return socket;
          }

          @Override
          public HttpResponse execute(HttpRequest request) {
            throw new UnsupportedOperationException("execute");
          }
        },
        "ws://localhost:4444/session/1/se/bidi");
  }

  // Gives a wrongly delivered event time to reach the listener before the unsubscribe completes
  private static void awaitQuietly(CountDownLatch latch) {
    try {
      latch.await(500, TimeUnit.MILLISECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  private static String success(long id) {
    return "{\"type\": \"success\", \"id\": " + id + ", \"result\": {}}";
  }

  private static String error(long id) {
    return "{\"type\": \"error\", \"id\": "
        + id
        + ", \"error\": \"invalid argument\", \"message\": \"nope\"}";
  }
}
