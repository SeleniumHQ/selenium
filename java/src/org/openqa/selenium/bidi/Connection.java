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

import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.internal.Debug.getDebugLogLevel;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.io.Closeable;
import java.io.StringReader;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
import java.util.stream.Collectors;
import org.openqa.selenium.WebDriverException;
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
            Thread thread = new Thread(r, "BiDi Connection");
            thread.setDaemon(true);
            return thread;
          });
  private static final AtomicLong NEXT_ID = new AtomicLong(1L);
  private final AtomicLong EVENT_CALLBACK_ID = new AtomicLong(1);
  private WebSocket socket;
  private final Map<Long, Consumer<Either<Throwable, JsonInput>>> methodCallbacks =
      new ConcurrentHashMap<>();
  private final ReadWriteLock callbacksLock = new ReentrantReadWriteLock(true);
  private final Map<Event<?>, Map<Long, Consumer<?>>> eventCallbacks = new HashMap<>();
  private final HttpClient client;
  private final AtomicBoolean underlyingSocketClosed = new AtomicBoolean();

  public Connection(HttpClient client, String url) {
    Require.nonNull("HTTP client", client);
    Require.nonNull("URL to connect to", url);

    this.client = client;
    // If WebDriver close() is called, it closes the session if it is the last browsing context.
    // It also closes the WebSocket from the remote end.
    // If WebDriver quit() is called, it also tries to close an already closed websocket and that
    // causes errors.
    // Ideally, such errors should not prevent freeing up resources.
    // This measure is needed until "session.end" from BiDi is implemented by the browsers.
    if (!underlyingSocketClosed.get()) {
      socket = this.client.openSocket(new HttpRequest(GET, url), new Listener());
    }
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

  public <X> CompletableFuture<X> send(Command<X> command) {
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
                  } catch (Exception e) {
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

    Map<String, Object> serialized =
        Map.of(
            "id", id,
            "method", command.getMethod(),
            "params", command.getParams());

    StringBuilder json = new StringBuilder();
    try (JsonOutput out = JSON.newOutput(json).writeClassName(false)) {
      out.write(serialized);
    }
    LOG.log(getDebugLogLevel(), "-> {0}", json);
    socket.sendText(json);

    if (!command.getSendsResponse()) {
      result.complete(null);
    }

    return result;
  }

  public <X> X sendAndWait(Command<X> command, Duration timeout) {
    try {
      CompletableFuture<X> future = send(command);
      return future.get(timeout.toMillis(), MILLISECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Thread has been interrupted", e);
    } catch (ExecutionException e) {
      Throwable cause = e;
      if (e.getCause() != null) {
        cause = e.getCause();
      }
      throw new BiDiException(cause);
    } catch (TimeoutException e) {
      throw new org.openqa.selenium.TimeoutException(e);
    }
  }

  public <X> long addListener(Event<X> event, Consumer<X> handler) {
    Require.nonNull("Event to listen for", event);
    Require.nonNull("Handler to call", handler);

    long id = EVENT_CALLBACK_ID.getAndIncrement();

    Lock lock = callbacksLock.writeLock();
    lock.lock();
    try {
      eventCallbacks.computeIfAbsent(event, key -> new HashMap<>()).put(id, handler);
    } finally {
      lock.unlock();
    }
    return id;
  }

  public <X> void clearListener(Event<X> event) {
    Lock lock = callbacksLock.writeLock();
    lock.lock();
    try {
      eventCallbacks.remove(event);
    } finally {
      lock.unlock();
    }
  }

  public void removeListener(long id) {
    Lock lock = callbacksLock.writeLock();
    lock.lock();
    try {
      List<Event<?>> list = new ArrayList<>();
      eventCallbacks.forEach(
          (k, v) -> {
            v.remove(id);
            if (v.isEmpty()) {
              list.add(k);
            }
          });

      list.forEach(eventCallbacks::remove);
    } finally {
      lock.unlock();
    }
  }

  public <X> boolean isEventSubscribed(Event<X> event) {
    Lock lock = callbacksLock.writeLock();
    lock.lock();
    try {
      return eventCallbacks.containsKey(event);
    } finally {
      lock.unlock();
    }
  }

  public void clearListeners() {
    Lock lock = callbacksLock.writeLock();
    lock.lock();
    try {
      List<String> events =
          eventCallbacks.keySet().stream().map(Event::getMethod).collect(Collectors.toList());

      // If WebDriver close() is called, it closes the session if it is the last browsing context.
      // It also closes the WebSocket from the remote end.
      // If we try to now send commands, depending on the underlying web socket implementation, it
      // will throw errors.
      // Ideally, such errors should not prevent freeing up resources.
      if (!underlyingSocketClosed.get()) {
        send(new Command<>("session.unsubscribe", Map.of("events", events)));
      }

      eventCallbacks.clear();
    } finally {
      lock.unlock();
    }
  }

  @Override
  public void close() {
    if (!underlyingSocketClosed.get()) {
      underlyingSocketClosed.set(true);
      socket.close();
    }
    client.close();
  }

  private class Listener implements WebSocket.Listener {

    @Override
    public void onText(CharSequence data) {
      EXECUTOR.execute(
          () -> {
            try {
              handle(data);
            } catch (Exception e) {
              throw new BiDiException("Unable to process: " + data, e);
            }
          });
    }

    @Override
    public void onClose(int code, String reason) {
      LOG.fine("BiDi connection websocket closed");
      underlyingSocketClosed.set(true);
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
      handleResponse(asString, raw);
    } else if (raw.get("method") instanceof String && raw.get("params") instanceof Map) {
      handleEventResponse(raw);
    } else {
      LOG.warning(() -> "Unhandled type:" + data);
    }
  }

  private void handleResponse(String rawDataString, Map<String, Object> rawDataMap) {
    Consumer<Either<Throwable, JsonInput>> consumer =
        methodCallbacks.remove(((Number) rawDataMap.get("id")).longValue());
    if (consumer == null) {
      return;
    }

    try (StringReader reader = new StringReader(rawDataString);
        JsonInput input = JSON.newInput(reader)) {
      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "result":
            consumer.accept(Either.right(input));
            break;

          case "error":
            consumer.accept(Either.left(new WebDriverException(rawDataString)));
            input.skipValue();
            break;

          default:
            input.skipValue();
        }
      }
      input.endObject();
    }
  }

  private void handleEventResponse(Map<String, Object> rawDataMap) {
    LOG.log(
        getDebugLogLevel(),
        () ->
            "Method"
                + rawDataMap.get("method")
                + "called with"
                + eventCallbacks.size()
                + "callbacks available");
    Lock lock = callbacksLock.readLock();
    // A waiting writer will block a reader to enter the lock, even if there are currently other
    // readers holding the lock. TryLock will bypass the waiting writers and acquire the read lock.
    // A thread processing an event (and holding the read-lock) might wait for another event before
    // continue processing the event (and releasing the read-lock). Without tryLock this would end
    // in a deadlock, as soon as a writer will try to acquire a write-lock.
    if (!lock.tryLock()) {
      lock.lock();
    }
    try {
      eventCallbacks.entrySet().stream()
          .filter(
              event -> {
                LOG.log(
                    getDebugLogLevel(),
                    "Matching {0} with {1}",
                    new Object[] {rawDataMap.get("method"), event.getKey().getMethod()});
                return rawDataMap.get("method").equals(event.getKey().getMethod());
              })
          .forEach(
              event -> {
                Map<String, Object> params = (Map<String, Object>) rawDataMap.get("params");
                Object value = null;
                if (params != null) {
                  value = event.getKey().getMapper().apply(params);
                }
                if (value == null) {
                  return;
                }

                final Object finalValue = value;

                for (Consumer<?> action : event.getValue().values()) {
                  @SuppressWarnings("unchecked")
                  Consumer<Object> obj = (Consumer<Object>) action;
                  LOG.log(
                      getDebugLogLevel(),
                      "Calling callback for {0} using {1} being passed {2}",
                      new Object[] {event.getKey(), obj, finalValue});
                  obj.accept(finalValue);
                }
              });
    } finally {
      lock.unlock();
    }
  }
}
