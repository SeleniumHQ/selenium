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

import static java.util.Collections.emptyMap;

import java.io.Closeable;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.logging.Logger;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;

public class BiDi implements Closeable {
  private static final Logger LOG = Logger.getLogger(BiDi.class.getName());

  private final Duration timeout;
  private final Connection connection;

  /**
   * @deprecated Use constructor with timeout parameter: {@link #BiDi(Connection, Duration)}
   */
  @Deprecated(forRemoval = true)
  public BiDi(Connection connection) {
    this(connection, Duration.ofSeconds(30));
  }

  public BiDi(Connection connection, Duration timeout) {
    this.connection = Require.nonNull("WebSocket connection", connection);
    this.timeout = Require.nonNull("WebSocket timeout", timeout);
  }

  @Override
  public void close() {
    try {
      clearListeners();
    } catch (WebDriverException e) {
      LOG.warning(() -> "Failed to clear BiDi listeners: " + e);
    }

    disconnectSession();

    try {
      connection.close();
    } catch (WebDriverException e) {
      LOG.warning(() -> "Failed to close BiDi connection: " + e);
    }
  }

  public void disconnectSession() {
    // TODO: Identify how to close a BiDi session.
    // Seems like https://w3c.github.io/webdriver-bidi/#issue-9f7aff26 needs to be fleshed out.
  }

  public <X> X send(Command<X> command) {
    Require.nonNull("Command to send", command);
    return connection.sendAndWait(command, timeout);
  }

  public <X> X send(Command<X> command, Duration timeout) {
    Require.nonNull("Command to send", command);
    Require.nonNull("Timeout", timeout);
    return connection.sendAndWait(command, timeout);
  }

  public <X> long addListener(Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    send(new Command<>("session.subscribe", Map.of("events", List.of(event.getMethod()))));

    return connection.addListener(event, handler);
  }

  public <X> long addListener(String browsingContextId, Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Browsing context id", browsingContextId);
    Require.nonNull("Handler to call", handler);

    send(
        new Command<>(
            "session.subscribe",
            Map.of("contexts", List.of(browsingContextId), "events", List.of(event.getMethod()))));

    return connection.addListener(event, handler);
  }

  public <X> long addListener(Set<String> browsingContextIds, Event<X> event, Consumer<X> handler) {
    Require.nonNull("List of browsing context ids", browsingContextIds);
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    send(
        new Command<>(
            "session.subscribe",
            Map.of("contexts", browsingContextIds, "events", List.of(event.getMethod()))));

    return connection.addListener(event, handler);
  }

  public <X> void clearListener(Event<X> event) {
    Require.nonNull("Event to listen for", event);

    // The browser throws an error if we try to unsubscribe an event that was not subscribed in the
    // first place
    if (connection.isEventSubscribed(event)) {
      send(new Command<>("session.unsubscribe", Map.of("events", List.of(event.getMethod()))));
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
    return send(new Command<>("session.status", emptyMap(), BiDiSessionStatus.class));
  }
}
