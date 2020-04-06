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

import org.openqa.selenium.events.Event;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.Type;
import org.openqa.selenium.json.Json;
import org.zeromq.SocketType;
import org.zeromq.ZContext;
import org.zeromq.ZMQ;

import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;

class UnboundZmqEventBus implements EventBus {

  private static final Logger LOG = Logger.getLogger(EventBus.class.getName());
  private static final Json JSON = new Json();
  private final ExecutorService executor;
  private final Map<Type, List<Consumer<Event>>> listeners = new ConcurrentHashMap<>();
  private final Queue<UUID> recentMessages = EvictingQueue.create(128);

  private ZMQ.Socket pub;
  private ZMQ.Socket sub;

  UnboundZmqEventBus(ZContext context, String publishConnection, String subscribeConnection) {
    executor = Executors.newCachedThreadPool(r -> {
      Thread thread = new Thread(r);
      thread.setName("Event Bus");
      thread.setDaemon(true);
      return thread;
    });

    LOG.info(String.format("Connecting to %s and %s", publishConnection, subscribeConnection));

    sub = context.createSocket(SocketType.SUB);
    sub.setIPv6(isSubAddressIPv6(publishConnection));
    sub.connect(publishConnection);
    sub.subscribe(new byte[0]);

    pub = context.createSocket(SocketType.PUB);
    pub.setIPv6(isSubAddressIPv6(subscribeConnection));
    pub.connect(subscribeConnection);

    ZMQ.Poller poller = context.createPoller(1);
    poller.register(sub, ZMQ.Poller.POLLIN);

    LOG.info("Sockets created");

    AtomicBoolean pollingStarted = new AtomicBoolean(false);

    executor.submit(() -> {
      LOG.info("Bus started");
      while (!Thread.currentThread().isInterrupted()) {
        try {
          poller.poll(150);
          pollingStarted.lazySet(true);

          if (poller.pollin(0)) {
            ZMQ.Socket socket = poller.getSocket(0);

            Type type = new Type(new String(socket.recv(ZMQ.DONTWAIT), UTF_8));
            UUID id = UUID.fromString(new String(socket.recv(ZMQ.DONTWAIT), UTF_8));
            String data = new String(socket.recv(ZMQ.DONTWAIT), UTF_8);

            Object converted = JSON.toType(data, Object.class);
            Event event = new Event(id, type, converted);

            if (recentMessages.contains(id)) {
              continue;
            }
            recentMessages.add(id);

            List<Consumer<Event>> typeListeners = listeners.get(type);
            if (typeListeners == null) {
              continue;
            }

            typeListeners.parallelStream().forEach(listener -> listener.accept(event));
          }
        } catch (Throwable e) {
          if (e.getCause() != null && e.getCause() instanceof AssertionError) {
            // Do nothing.
          } else {
            throw e;
          }
        }
      }
    });

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
  }

  private boolean isSubAddressIPv6(String connection) {
    try {
      return InetAddress.getByName(new URI(connection).getHost()) instanceof Inet6Address;
    } catch (UnknownHostException | URISyntaxException e) {
      LOG.log(Level.WARNING, String.format("Could not determine if the address %s is IPv6 or IPv4", connection), e);
    }
    return false;
  }

  @Override
  public void addListener(Type type, Consumer<Event> onType) {
    Objects.requireNonNull(type, "Event type must be set.");
    Objects.requireNonNull(onType, "Event listener must be set.");

    List<Consumer<Event>> typeListeners = listeners.computeIfAbsent(type, t -> new LinkedList<>());
    typeListeners.add(onType);
  }

  @Override
  public void fire(Event event) {
    Objects.requireNonNull(event, "Event to send must be set.");

    pub.sendMore(event.getType().getName().getBytes(UTF_8));
    pub.sendMore(event.getId().toString().getBytes(UTF_8));
    pub.send(event.getRawData().getBytes(UTF_8));
  }

  @Override
  public void close() {
    executor.shutdown();
    if (sub != null) {
      sub.close();
    }
    if (pub != null) {
      pub.close();
    }
  }
}
