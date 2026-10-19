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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;
import java.util.logging.Logger;
import org.jetbrains.annotations.ApiStatus;
import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;

@Beta
@ApiStatus.Internal
public class BiDi implements Closeable {
  private static final Logger LOG = Logger.getLogger(BiDi.class.getName());

  private final Duration timeout;
  private final Connection connection;
  // Subscription ids for listeners registered against specific browsing context(s), keyed by
  // event, so clearListener(Set<String>, Event) can unsubscribe only those instead of every
  // listener for the event (which would also drop unrelated subscriptions, global or scoped to
  // other contexts).
  private final Map<Event<?>, List<String>> contextListenerIds = new ConcurrentHashMap<>();

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

  public <X> String addListener(Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    String subscriptionId = subscribe(Map.of("events", List.of(event.getMethod())));
    connection.addListener(subscriptionId, event, handler);
    return subscriptionId;
  }

  public <X> String addListener(String browsingContextId, Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Browsing context id", browsingContextId);
    Require.nonNull("Handler to call", handler);

    String subscriptionId =
        subscribe(
            Map.of("contexts", List.of(browsingContextId), "events", List.of(event.getMethod())));
    connection.addListener(subscriptionId, event, handler);
    contextListenerIds
        .computeIfAbsent(event, key -> new CopyOnWriteArrayList<>())
        .add(subscriptionId);
    return subscriptionId;
  }

  public <X> String addListener(
      Set<String> browsingContextIds, Event<X> event, Consumer<X> handler) {
    Require.nonEmpty("List of browsing context ids", browsingContextIds);
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    String subscriptionId =
        subscribe(Map.of("contexts", browsingContextIds, "events", List.of(event.getMethod())));
    connection.addListener(subscriptionId, event, handler);
    contextListenerIds
        .computeIfAbsent(event, key -> new CopyOnWriteArrayList<>())
        .add(subscriptionId);
    return subscriptionId;
  }

  // The subscription id returned by the browser is the sole identifier we need to unsubscribe
  // later: it is unique regardless of whether the subscription was scoped to events, contexts, or
  // user contexts, so there is no need to separately track how a listener was subscribed.
  private String subscribe(Map<String, Object> params) {
    Map<String, Object> result = send(new Command<>("session.subscribe", params, Map.class));
    Object subscriptionId = result.get("subscription");
    if (!(subscriptionId instanceof String) || ((String) subscriptionId).isEmpty()) {
      throw new BiDiException(
          "session.subscribe did not return a valid subscription id: " + result);
    }
    return (String) subscriptionId;
  }

  public <X> void clearListener(Set<String> browsingContextIds, Event<X> event) {
    Require.nonEmpty("List of browsing context ids", browsingContextIds);
    Require.nonNull("Event to listen for", event);

    // The browser throws an error if we try to unsubscribe an event that was not subscribed in the
    // first place
    if (!connection.isEventSubscribed(event)) {
      return;
    }

    List<String> subscriptionIds = contextListenerIds.remove(event);
    if (subscriptionIds != null && !subscriptionIds.isEmpty()) {
      // Subscription was context-specific: unsubscribe only those subscriptions, leaving any
      // other listener registered for this event (global, or scoped to a different context)
      // untouched.
      send(
          new Command<>(
              "session.unsubscribe",
              Map.of("contexts", browsingContextIds, "events", List.of(event.getMethod()))));
      subscriptionIds.forEach(connection::removeListener);
    } else {
      // Subscription was global: context-specific unsubscription is invalid per the BiDi
      // protocol, so fall back to a global unsubscription.
      this.clearListener(event);
    }
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

  public void removeListener(String id) {
    Require.nonNull("Listener id", id);

    // The browser throws an error if we try to unsubscribe a subscription id that was not
    // subscribed in the first place
    if (connection.isSubscribed(id)) {
      send(new Command<>("session.unsubscribe", Map.of("subscriptions", List.of(id))));
      connection.removeListener(id);
    }
  }

  public void clearListeners() {
    connection.clearListeners();
  }

  public BiDiSessionStatus getBidiSessionStatus() {
    return send(new Command<>("session.status", emptyMap(), BiDiSessionStatus.class));
  }

  public Handle asHandle() {
    return new Handle(this);
  }
}
