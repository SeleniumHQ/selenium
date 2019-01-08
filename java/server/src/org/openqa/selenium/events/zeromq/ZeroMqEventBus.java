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

import static java.nio.charset.StandardCharsets.UTF_8;

import com.google.common.collect.EvictingQueue;

import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.Type;
import org.openqa.selenium.json.Json;
import org.zeromq.ZContext;
import org.zeromq.ZMQ;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.logging.Logger;

public class ZeroMqEventBus implements EventBus {

  private static final Logger LOG = Logger.getLogger(EventBus.class.getName());
  private static final Json JSON = new Json();
  // "640k should be enough for anyone"
  private static final int MAX_SUBSCRIBERS = 64;
  private static final Type NEW_SUBSCRIBER = new Type("subscriber-added");

  private final ZMQ.Socket publisher;
  private final Map<Type, List<Consumer<Event>>> listeners = new ConcurrentHashMap<>();
  private final AtomicBoolean isRunning = new AtomicBoolean(true);
  private final Queue<UUID> recentMessages = EvictingQueue.create(128);
  private final Regularly eventPoller;
  private final Function<Type, List<Consumer<Event>>> registerType;
  private final boolean isInProcess;

  public ZeroMqEventBus(ZContext context, String connection, boolean bind) {
    Objects.requireNonNull(context, "Context must be set.");
    Objects.requireNonNull(connection, "Connection string must be set.");

    isInProcess = connection.startsWith("inproc:");

    ZMQ.Poller poller = context.createPoller(MAX_SUBSCRIBERS);

    registerType = t -> {
      poller.register(createSubscriberSocket(context, connection, t));
      announceAndAwait(t, Duration.ofSeconds(1));
      return new LinkedList<>();
    };

    listeners.put(NEW_SUBSCRIBER, new LinkedList<>());
    poller.register(createSubscriberSocket(context, connection, NEW_SUBSCRIBER));

    eventPoller = new Regularly("Message queue listening on: " + connection);
    eventPoller.submit(
        () -> {
          poller.poll(0);

          for (int i = 0; i < poller.getNext(); i++) {
            if (poller.pollin(i)) {
              ZMQ.Socket subscriber = poller.getSocket(i);
              Type type = new Type(new String(subscriber.recv(ZMQ.DONTWAIT), UTF_8));
              UUID id = UUID.fromString(new String(subscriber.recv(ZMQ.DONTWAIT), UTF_8));
              String data = new String(subscriber.recv(ZMQ.DONTWAIT), UTF_8);

              if (recentMessages.contains(id)) {
                continue;
              }
              recentMessages.add(id);

              List<Consumer<Event>> typeListeners = listeners.get(type);
              if (typeListeners == null) {
                continue;
              }

              Object converted = JSON.toType(data, Object.class);
              Event event = new Event(id, type, converted);
              typeListeners.parallelStream().forEach(listener -> listener.accept(event));
            }
          }

        },
        Duration.ofMillis(150),
        Duration.ofMillis(150));

    publisher = context.createSocket(ZMQ.PUB);
    publisher.setImmediate(true);

    boolean connected;
    if (bind) {
      connected = publisher.bind(connection);
    } else {
      connected = publisher.connect(connection);
    }

    if (!connected) {
      throw new RuntimeException("Unable to bind socket: " + publisher.errno());
    }

    announceAndAwait(NEW_SUBSCRIBER, Duration.ofSeconds(2));
  }

  private ZMQ.Socket createSubscriberSocket(
      ZContext context,
      String connection,
      Type type) {
    ZMQ.Socket subscriber = context.createSocket(ZMQ.SUB);
    subscriber.setImmediate(true);
    subscriber.subscribe(type.getName().getBytes(UTF_8));
    subscriber.connect(connection);

    return subscriber;
  }

  @Override
  public void addListener(Type type, Consumer<Event> listener) {
    Objects.requireNonNull(type, "Event type must be set.");
    Objects.requireNonNull(listener, "Event listener must be set.");

    List<Consumer<Event>> typeListeners = listeners.computeIfAbsent(type, registerType);
    typeListeners.add(listener);
  }

  @Override
  public void fire(Event event) {
    Objects.requireNonNull(event, "Event to fire must be set.");

    publisher.sendMore(event.getType().getName().getBytes(UTF_8));
    publisher.sendMore(event.getId().toString().getBytes(UTF_8));

    byte[] payload = JSON.toJson(event.getData()).getBytes(UTF_8);

    publisher.send(payload);
  }

  @Override
  public void close() {
    isRunning.set(false);
    publisher.close();
    eventPoller.shutdown();
  }

  private void announceAndAwait(Type type, Duration timeout) {
    // If we're in process, everything is synchronous anyway, so there's no need for this.
    if (isInProcess) {
      return;
    }

    // We should really have a REQ/REP socket pair we use, but we don't want to have to set up a new
    // socket and bind that to a port. Instead, we'll post some messages to a unique type, and hope
    // that nothing is listening for it. We only need to do that if we're binding to the port. And,
    // yes, we are cowboys. Why do you ask?

    String key = UUID.randomUUID().toString();

    AtomicBoolean ready = new AtomicBoolean(false);
    Consumer<Event> probe = event -> {
      if (key.equals(event.getData())) {
        ready.set(true);
      }
    };
    List<Consumer<Event>> consumers = listeners.get(NEW_SUBSCRIBER);
    consumers.add(probe);

    Instant end = Instant.now().plus(timeout);
    while (!ready.get() && Instant.now().isBefore(end)) {
      try {
        Thread.sleep(50);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      }
      fire(new Event(NEW_SUBSCRIBER, key));
    }
    consumers.remove(probe);

    if (!ready.get()) {
      LOG.warning("Announcement of topic timed out: " + type);
    }
  }
}
