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

package org.openqa.selenium.devtools;

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.internal.Debug.getDebugLogLevel;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Multimap;
import java.io.Closeable;
import java.io.StringReader;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.devtools.idealized.target.model.SessionID;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.WebSocket;

public class Connection implements Closeable {

  private static final Logger LOG = Logger.getLogger(Connection.class.getName());
  private static final Json JSON = new Json();
  private static final Executor EXECUTOR =
      Executors.newCachedThreadPool(
          r -> {
            Thread thread = new Thread(r, "CDP Connection");
            thread.setDaemon(true);
            return thread;
          });
  private static final AtomicLong NEXT_ID = new AtomicLong(1L);
  private WebSocket socket;
  private final Map<Long, Consumer<Either<Throwable, JsonInput>>> methodCallbacks =
      new ConcurrentHashMap<>();
  private final ReadWriteLock callbacksLock = new ReentrantReadWriteLock(true);
  private final Multimap<Event<?>, Consumer<?>> eventCallbacks = HashMultimap.create();
  private final HttpClient client;
  private final String url;
  private final AtomicBoolean isClosed;

  public Connection(HttpClient client, String url) {
    Require.nonNull("HTTP client", client);
    Require.nonNull("URL to connect to", url);
    this.url = url;
    this.client = client;
    this.socket = this.client.openSocket(new HttpRequest(GET, url), new Listener());
    this.isClosed = new AtomicBoolean();
  }

  boolean isClosed() {
    return isClosed.get();
  }

  void reopen() {
    this.socket = this.client.openSocket(new HttpRequest(GET, url), new Listener());
  }

  private static class NamedConsumer<X> implements Consumer<X> {

    private final String name;
    private final Consumer<X> delegate;

    private NamedConsumer(String name, Consumer<X> delegate) {
      this.name = name;
      this.delegate = delegate;
    }

    public static <X> Consumer<X> of(String name, Consumer<X> delegate) {
      return new NamedConsumer<>(name, delegate);
    }

    @Override
    public void accept(X x) {
      delegate.accept(x);
    }

    @Override
    public String toString() {
      return "Consumer for " + name;
    }
  }

  public <X> CompletableFuture<X> send(SessionID sessionId, Command<X> command) {
    long id = NEXT_ID.getAndIncrement();

    CompletableFuture<X> result = new CompletableFuture<>();
    if (command.getSendsResponse()) {
      methodCallbacks.put(
          id,
          NamedConsumer.of(
              command.getMethod(),
              inputOrException -> {
                if (inputOrException.isRight()) {
                  try {
                    X value = command.getMapper().apply(inputOrException.right());
                    result.complete(value);
                  } catch (Throwable e) {
                    LOG.log(
                        Level.WARNING,
                        String.format("Unable to map result for %s", command.getMethod()),
                        e);
                    result.completeExceptionally(e);
                  }
                } else {
                  result.completeExceptionally(inputOrException.left());
                }
              }));
    }

    ImmutableMap.Builder<String, Object> serialized = ImmutableMap.builder();
    serialized.put("id", id);
    serialized.put("method", command.getMethod());
    serialized.put("params", command.getParams());
    if (sessionId != null) {
      serialized.put("sessionId", sessionId);
    }

    StringBuilder json = new StringBuilder();
    try (JsonOutput out = JSON.newOutput(json).writeClassName(false)) {
      out.write(serialized.build());
    }
    LOG.log(getDebugLogLevel(), "-> {0}", json);
    socket.sendText(json);

    if (!command.getSendsResponse()) {
      result.complete(null);
    }

    return result;
  }

  public <X> X sendAndWait(SessionID sessionId, Command<X> command, Duration timeout) {
    try {
      CompletableFuture<X> future = send(sessionId, command);
      return future.get(timeout.toMillis(), MILLISECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Thread has been interrupted", e);
    } catch (ExecutionException e) {
      Throwable cause = e;
      if (e.getCause() != null) {
        cause = e.getCause();
      }
      throw new DevToolsException(cause);
    } catch (TimeoutException e) {
      throw new org.openqa.selenium.TimeoutException(e);
    }
  }

  public <X> void addListener(Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    Lock lock = callbacksLock.writeLock();
    lock.lock();
    try {
      eventCallbacks.put(event, handler);
    } finally {
      lock.unlock();
    }
  }

  public void clearListeners() {
    Lock lock = callbacksLock.writeLock();
    lock.lock();
    try {
      eventCallbacks.clear();
    } finally {
      lock.unlock();
    }
  }

  @Override
  public void close() {
    socket.close();
    client.close();
    this.isClosed.set(true);
  }

  private class Listener implements WebSocket.Listener {

    @Override
    public void onText(CharSequence data) {
      EXECUTOR.execute(
          () -> {
            try {
              handle(data);
            } catch (Throwable t) {
              LOG.log(Level.WARNING, "Unable to process: " + data, t);
              throw new DevToolsException(t);
            }
          });
    }
  }

  private void handle(CharSequence data) {
    // It's kind of gross to decode the data twice, but this lets us get started on something
    // that feels nice to users.
    // TODO: decode once, and once only

    String asString = String.valueOf(data);
    LOG.log(getDebugLogLevel(), "<- {0}", asString);

    Map<String, Object> raw = JSON.toType(asString, MAP_TYPE);
    if (raw.get("id") instanceof Number
        && (raw.get("result") != null || raw.get("error") != null)) {
      Consumer<Either<Throwable, JsonInput>> consumer =
          methodCallbacks.remove(((Number) raw.get("id")).longValue());
      if (consumer == null) {
        return;
      }

      try (StringReader reader = new StringReader(asString);
          JsonInput input = JSON.newInput(reader)) {
        input.beginObject();
        while (input.hasNext()) {
          switch (input.nextName()) {
            case "result":
              consumer.accept(Either.right(input));
              break;

            case "error":
              consumer.accept(Either.left(new WebDriverException(asString)));
              input.skipValue();
              break;

            default:
              input.skipValue();
          }
        }
        input.endObject();
      }
    } else if (raw.get("method") instanceof String && raw.get("params") instanceof Map) {
      LOG.log(
          getDebugLogLevel(),
          "Method {0} called with {1} callbacks available",
          new Object[] {raw.get("method"), eventCallbacks.keySet().size()});
      Lock lock = callbacksLock.readLock();
      lock.lock();
      try {
        // TODO: Also only decode once.
        eventCallbacks.keySet().stream()
            .peek(
                event ->
                    LOG.log(
                        getDebugLogLevel(),
                        "Matching {0} with {1}",
                        new Object[] {raw.get("method"), event.getMethod()}))
            .filter(event -> raw.get("method").equals(event.getMethod()))
            .forEach(
                event -> {
                  // TODO: This is grossly inefficient. I apologise, and we should fix this.
                  try (StringReader reader = new StringReader(asString);
                      JsonInput input = JSON.newInput(reader)) {
                    Object value = null;
                    input.beginObject();
                    while (input.hasNext()) {
                      switch (input.nextName()) {
                        case "params":
                          value = event.getMapper().apply(input);
                          break;

                        default:
                          input.skipValue();
                          break;
                      }
                    }
                    input.endObject();

                    if (value == null) {
                      // Do nothing.
                      return;
                    }

                    final Object finalValue = value;

                    for (Consumer<?> action : eventCallbacks.get(event)) {
                      @SuppressWarnings("unchecked")
                      Consumer<Object> obj = (Consumer<Object>) action;
                      LOG.log(
                          getDebugLogLevel(),
                          "Calling callback for {0} using {1} being passed {2}",
                          new Object[] {event, obj, finalValue});
                      obj.accept(finalValue);
                    }
                  }
                });
      } finally {
        lock.unlock();
      }
    } else {
      LOG.warning("Unhandled type: " + data);
    }
  }
}
