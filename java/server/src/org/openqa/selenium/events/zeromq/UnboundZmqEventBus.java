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

package org.openqa.selenium.events.zeromq;

import com.google.common.collect.EvictingQueue;
import net.jodah.failsafe.Failsafe;
import net.jodah.failsafe.RetryPolicy;
import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.EventListener;
import org.openqa.selenium.events.EventName;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.zeromq.SocketType;
import org.zeromq.ZContext;
import org.zeromq.ZMQ;

import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.nio.charset.StandardCharsets.UTF_8;

class UnboundZmqEventBus implements EventBus {

  static final EventName REJECTED_EVENT = new EventName("selenium-rejected-event");
  private static final Logger LOG = Logger.getLogger(EventBus.class.getName());
  private static final Json JSON = new Json();
  private final ScheduledExecutorService socketPollingExecutor;
  private final ExecutorService listenerNotificationExecutor;

  private final Map<EventName, List<Consumer<Event>>> listeners = new ConcurrentHashMap<>();
  private final Queue<UUID> recentMessages = EvictingQueue.create(128);
  private final String encodedSecret;

  private ZMQ.Socket pub;
  private ZMQ.Socket sub;

  UnboundZmqEventBus(ZContext context, String publishConnection, String subscribeConnection, Secret secret) {
    Require.nonNull("Secret", secret);
    StringBuilder builder = new StringBuilder();
    try (JsonOutput out = JSON.newOutput(builder)) {
      out.setPrettyPrint(false).writeClassName(false).write(secret);
    }
    this.encodedSecret = builder.toString();

    ThreadFactory threadFactory = r -> {
      Thread thread = new Thread(r);
      thread.setName("Event Bus");
      thread.setDaemon(true);
      return thread;
    };
    this.socketPollingExecutor = Executors.newSingleThreadScheduledExecutor(threadFactory);
    this.listenerNotificationExecutor = Executors.newFixedThreadPool(
      Math.max(Runtime.getRuntime().availableProcessors() / 2, 2), // At least two threads
      threadFactory);

    String connectionMessage = String.format("Connecting to %s and %s", publishConnection, subscribeConnection);
    LOG.info(connectionMessage);

    RetryPolicy<Object> retryPolicy = new RetryPolicy<>()
      .withMaxAttempts(5)
      .withDelay(5, 10, ChronoUnit.SECONDS)
      .onFailedAttempt(e -> LOG.log(Level.WARNING, String.format("%s failed", connectionMessage)))
      .onRetry(e -> LOG.log(Level.WARNING, String.format("Failure #%s. Retrying.", e.getAttemptCount())))
      .onRetriesExceeded(e -> LOG.log(Level.WARNING, "Connection aborted."));

    // Access to the zmq socket is safe here: no threads.
    Failsafe.with(retryPolicy).run(
      () -> {
        sub = context.createSocket(SocketType.SUB);
        sub.setIPv6(isSubAddressIPv6(publishConnection));
        sub.connect(publishConnection);
        sub.subscribe(new byte[0]);

        pub = context.createSocket(SocketType.PUB);
        pub.setIPv6(isSubAddressIPv6(subscribeConnection));
        pub.connect(subscribeConnection);
      }
    );
    // Connections are already established
    ZMQ.Poller poller = context.createPoller(1);
    poller.register(Objects.requireNonNull(sub), ZMQ.Poller.POLLIN);

    LOG.info("Sockets created");

    AtomicBoolean pollingStarted = new AtomicBoolean(false);

    socketPollingExecutor.scheduleWithFixedDelay(
      () -> pollForIncomingEvents(poller, secret, pollingStarted),
      0,
      100,
      TimeUnit.MILLISECONDS);

    // Give ourselves up to a second to connect, using The World's Worst heuristic. If we don't
    // manage to connect, it's not the end of the world, as the socket we're connecting to may not
    // be up yet.
    while (!pollingStarted.get()) {
      try {
        Thread.sleep(100);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      }
    }

    LOG.info("Event bus ready");
  }

  @Override
  public boolean isReady() {
    return !socketPollingExecutor.isShutdown();
  }

  private boolean isSubAddressIPv6(String connection) {
    try {
      URI uri = new URI(connection);

      if ("inproc".equals(uri.getScheme())) {
        return false;
      }

      return InetAddress.getByName(uri.getHost()) instanceof Inet6Address;
    } catch (UnknownHostException | URISyntaxException e) {
      LOG.log(Level.WARNING, String.format("Could not determine if the address %s is IPv6 or IPv4", connection), e);
    }
    return false;
  }

  @Override
  public void addListener(EventListener<?> listener) {
    Require.nonNull("Listener", listener);

    List<Consumer<Event>> typeListeners = listeners.computeIfAbsent(listener.getEventName(), t -> new LinkedList<>());
    typeListeners.add(listener);
  }

  @Override
  public void fire(Event event) {
    Require.nonNull("Event to send", event);

    socketPollingExecutor.execute(() -> {
      pub.sendMore(event.getType().getName().getBytes(UTF_8));
      pub.sendMore(encodedSecret.getBytes(UTF_8));
      pub.sendMore(event.getId().toString().getBytes(UTF_8));
      pub.send(event.getRawData().getBytes(UTF_8));
    });
  }

  @Override
  public void close() {
    socketPollingExecutor.shutdownNow();
    listenerNotificationExecutor.shutdownNow();

    if (sub != null) {
      sub.close();
    }
    if (pub != null) {
      pub.close();
    }
  }

  private void pollForIncomingEvents(ZMQ.Poller poller, Secret secret, AtomicBoolean pollingStarted) {
    try {
      int count = poller.poll(0);

      pollingStarted.lazySet(true);

      for (int i = 0; i < count; i++) {
        if (poller.pollin(i)) {
          ZMQ.Socket socket = poller.getSocket(i);

          EventName eventName = new EventName(new String(socket.recv(), UTF_8));
          Secret eventSecret =
              JSON.toType(new String(socket.recv(), UTF_8), Secret.class);
          UUID id = UUID.fromString(new String(socket.recv(), UTF_8));
          String data = new String(socket.recv(), UTF_8);

          // Don't bother doing more work if we've seen this message.
          if (recentMessages.contains(id)) {
            return;
          }

          Object converted = JSON.toType(data, Object.class);
          Event event = new Event(id, eventName, converted);

          recentMessages.add(id);

          if (!Secret.matches(secret, eventSecret)) {
            LOG.severe(
                String.format(
                    "Received message without a valid secret. Rejecting. %s -> %s", event, data));
            Event rejectedEvent =
                new Event(REJECTED_EVENT, new ZeroMqEventBus.RejectedEvent(eventName, data));

            notifyListeners(REJECTED_EVENT, rejectedEvent);

            return;
          }

          notifyListeners(eventName, event);
        }
      }
    } catch (Throwable e) {
      // if the exception escapes, then we never get scheduled again
      LOG.log(Level.WARNING, e, () -> "Caught and swallowed exception: " + e.getMessage());
    }
  }

  private void notifyListeners(EventName eventName, Event event) {
    List<Consumer<Event>> eventListeners = listeners.getOrDefault(eventName, new ArrayList<>());
    eventListeners
      .forEach(listener -> listenerNotificationExecutor.submit(() -> {
        try {
          listener.accept(event);
        } catch (Throwable t) {
          LOG.log(Level.WARNING, t, () -> "Caught exception from listener: " + listener);
        }
      }));
  }
}
