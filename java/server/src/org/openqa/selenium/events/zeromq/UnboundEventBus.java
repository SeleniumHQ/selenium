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
import org.zeromq.ZContext;
import org.zeromq.ZMQ;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;
import java.util.logging.Logger;

class UnboundZmqEventBus implements EventBus {

  private static final Logger LOG = Logger.getLogger(EventBus.class.getName());
  private static final Json JSON = new Json();
  private final ExecutorService executor;
  private final Map<Type, List<Consumer<Event>>> listeners = new ConcurrentHashMap<>();
  private final Queue<UUID> recentMessages = EvictingQueue.create(128);

  private ZMQ.Socket pub;
  private ZMQ.Socket sub;

  UnboundZmqEventBus(ZContext context, String connection) {
    executor = Executors.newScheduledThreadPool(2, r -> {
      Thread thread = new Thread(r);
      thread.setName("Event Bus");
      thread.setDaemon(true);
      return thread;
    });

    pub = context.createSocket(ZMQ.PUB);
    pub.setImmediate(true);
    sub = context.createSocket(ZMQ.SUB);
    sub.setImmediate(true);
    sub.subscribe(new byte[0]);

    executor.submit(() -> {
      LOG.info("Obtaining end points");
      ZMQ.Socket req = context.createSocket(ZMQ.REQ);
      req.connect(connection);
      req.send("");
      String xpubConn = req.recvStr();
      String xsubConn = req.recvStr();
      req.close();

      LOG.info(String.format("Connecting to %s and %s", xpubConn, xsubConn));

      sub.connect(xpubConn);
      pub.connect(xsubConn);

      ZMQ.Poller poller = context.createPoller(1);
      poller.register(sub, ZMQ.Poller.POLLIN);

      LOG.info("Sockets created");

      executor.submit(() -> {
        LOG.info("Bus started");
        while (!Thread.currentThread().isInterrupted()) {
          try {
            poller.poll(150);
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
    });

    // Give ourselves up to a second to connect, using The World's Worst heuristic. If we don't
    // manage to connect, it's not the end of the world, as the socket we're connecting to may not
    // be up yet.
    long end = System.currentTimeMillis() + 1000;
    while (pub.getLastEndpoint() == null && System.currentTimeMillis() < end) {
      try {
        Thread.sleep(100);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      }
    }
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
    pub.send(JSON.toJson(event.getData()).getBytes(UTF_8));
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
