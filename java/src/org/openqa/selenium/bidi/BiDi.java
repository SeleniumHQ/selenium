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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Consumer;
import java.util.function.Supplier;
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
  // Held across the remote round trip of every subscription change, so that no change can observe
  // or undo the half-finished local state of another (callbacks detached but the unsubscribe not
  // yet answered, or a rejected unsubscribe restoring callbacks that a later change removed)
  private final Lock subscriptionLock = new ReentrantLock();

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

    return subscribe(Map.of("events", List.of(event.getMethod())), event, handler);
  }

  public <X> String addListener(String browsingContextId, Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Browsing context id", browsingContextId);
    Require.nonNull("Handler to call", handler);

    return subscribe(
        Map.of("contexts", List.of(browsingContextId), "events", List.of(event.getMethod())),
        event,
        handler);
  }

  public <X> String addListener(
      Set<String> browsingContextIds, Event<X> event, Consumer<X> handler) {
    Require.nonEmpty("List of browsing context ids", browsingContextIds);
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    return subscribe(
        Map.of("contexts", browsingContextIds, "events", List.of(event.getMethod())),
        event,
        handler);
  }

  <X> String addListener(Event<X> event, Consumer<X> handler, SubscriptionScope scope) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);
    Require.nonNull("Subscription scope", scope);

    Map<String, Object> params = new HashMap<>(scope.toMap());
    params.put("events", List.of(event.getMethod()));
    String subscriptionId = subscribe(params);
    connection.addListener(subscriptionId, event, handler);
    return subscriptionId;
  }

  // The subscription id returned by the browser is the sole identifier we need to unsubscribe
  // later: it is unique regardless of whether the subscription was scoped to events, contexts, or
  // user contexts, so there is no need to separately track how a listener was subscribed.
  private <X> String subscribe(Map<String, Object> params, Event<X> event, Consumer<X> handler) {
    return whileHoldingSubscriptionLock(
        () -> {
          Map<String, Object> result = send(new Command<>("session.subscribe", params, Map.class));
          Object subscriptionId = result.get("subscription");
          if (!(subscriptionId instanceof String) || ((String) subscriptionId).isEmpty()) {
            throw new BiDiException(
                "session.subscribe did not return a valid subscription id: " + result);
          }
          connection.addListener((String) subscriptionId, event, handler);
          return (String) subscriptionId;
        });
  }

  public <X> void clearListener(Set<String> browsingContextIds, Event<X> event) {
    Require.nonEmpty("List of browsing context ids", browsingContextIds);
    // This is not the correct implementation, everything needs to be tired to subscription id.
    // This is currently used by hand-written BiDi code, soon to be replaced by generated BiDi code.
    // After that this method will be removed.
    // This is just to avoid changes to hand-written classes meanwhile.
    this.clearListener(event);
  }

  public <X> void clearListener(Event<X> event) {
    Require.nonNull("Event to listen for", event);

    // The browser throws an error if we try to unsubscribe an event that was not subscribed in the
    // first place. Local callbacks are removed before unsubscribing so events that arrive during
    // the unsubscribe round trip are not delivered to a listener the caller has already cleared.
    whileHoldingSubscriptionLock(
        () -> {
          if (connection.isEventSubscribed(event)) {
            unsubscribe(
                connection.detachListeners(event), Map.of("events", List.of(event.getMethod())));
          }
          return null;
        });
  }

  public void removeListener(String id) {
    Require.nonNull("Listener id", id);

    // The browser throws an error if we try to unsubscribe a subscription id that was not
    // subscribed in the first place
    whileHoldingSubscriptionLock(
        () -> {
          if (connection.isSubscribed(id)) {
            unsubscribe(connection.detachListeners(id), Map.of("subscriptions", List.of(id)));
          }
          return null;
        });
  }

  private void unsubscribe(
      Map<Event<?>, Map<String, Consumer<?>>> detached, Map<String, Object> params) {
    try {
      send(new Command<>("session.unsubscribe", params));
    } catch (RuntimeException e) {
      // The remote end still has the subscription, so keep delivering its events and let the
      // caller retry
      connection.restoreListeners(detached);
      throw e;
    }
  }

  public void clearListeners() {
    whileHoldingSubscriptionLock(
        () -> {
          connection.clearListeners();
          return null;
        });
  }

  private <T> T whileHoldingSubscriptionLock(Supplier<T> change) {
    if (connection.isDispatchingEventsOnCurrentThread()) {
      // The change holding the lock cannot finish until this event handler returns and releases
      // the callbacks, so waiting for it here would never end
      if (!subscriptionLock.tryLock()) {
        throw new BiDiException(
            "Cannot change BiDi subscriptions from an event handler while another subscription"
                + " change is in progress");
      }
    } else {
      subscriptionLock.lock();
    }
    try {
      return change.get();
    } finally {
      subscriptionLock.unlock();
    }
  }

  public BiDiSessionStatus getBidiSessionStatus() {
    return send(new Command<>("session.status", emptyMap(), BiDiSessionStatus.class));
  }

  public Handle asHandle() {
    return new Handle(this);
  }
}
