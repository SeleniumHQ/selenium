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

import java.io.Closeable;
import java.time.Duration;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import org.openqa.selenium.internal.Require;

public class BiDi implements Closeable {

  private final Duration timeout = Duration.ofSeconds(30);
  private final Connection connection;

  public BiDi(Connection connection) {
    this.connection = Require.nonNull("WebSocket connection", connection);
  }

  @Override
  public void close() {
    clearListeners();
    disconnectSession();
    connection.close();
  }

  public void disconnectSession() {
    // TODO: Identify how to close a BiDi session.
    // Seems like https://w3c.github.io/webdriver-bidi/#issue-9f7aff26 needs to be fleshed out.
  }

  public <X> X send(Command<X> command) {
    Require.nonNull("Command to send", command);
    return connection.sendAndWait(command, timeout);
  }

  public <X> long addListener(Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    send(
        new Command<>(
            "session.subscribe", Map.of("events", Collections.singletonList(event.getMethod()))));

    return connection.addListener(event, handler);
  }

  public <X> long addListener(String browsingContextId, Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Browsing context id", browsingContextId);
    Require.nonNull("Handler to call", handler);

    send(
        new Command<>(
            "session.subscribe",
            Map.of(
                "contexts",
                Collections.singletonList(browsingContextId),
                "events",
                Collections.singletonList(event.getMethod()))));

    return connection.addListener(event, handler);
  }

  public <X> long addListener(Set<String> browsingContextIds, Event<X> event, Consumer<X> handler) {
    Require.nonNull("List of browsing context ids", browsingContextIds);
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    send(
        new Command<>(
            "session.subscribe",
            Map.of(
                "contexts",
                browsingContextIds,
                "events",
                Collections.singletonList(event.getMethod()))));

    return connection.addListener(event, handler);
  }

  public <X> void clearListener(Event<X> event) {
    Require.nonNull("Event to listen for", event);

    // The browser throws an error if we try to unsubscribe an event that was not subscribed in the
    // first place
    if (connection.isEventSubscribed(event)) {
      send(
          new Command<>(
              "session.unsubscribe",
              Map.of("events", Collections.singletonList(event.getMethod()))));

      connection.clearListener(event);
    }
  }

  public void removeListener(long id) {
    connection.removeListener(id);
  }

  public void clearListeners() {
    connection.clearListeners();
  }

  public BiDiSessionStatus getBidiSessionStatus() {
    return send(new Command<>("session.status", Collections.emptyMap(), BiDiSessionStatus.class));
  }
}
