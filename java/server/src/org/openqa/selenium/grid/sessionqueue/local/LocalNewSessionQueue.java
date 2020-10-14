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

package org.openqa.selenium.grid.sessionqueue.local;

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.NewSessionErrorResponse;
import org.openqa.selenium.grid.data.NewSessionRejectedEvent;
import org.openqa.selenium.grid.data.NewSessionRequestEvent;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.time.Duration;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;

public class LocalNewSessionQueue extends NewSessionQueue {

  private static final Logger LOG = Logger.getLogger(LocalNewSessionQueue.class.getName());
  private final EventBus bus;
  private final Deque<RequestId> requestIdQueue = new ConcurrentLinkedDeque<>();
  private final Map<RequestId, HttpRequest> sessionRequests = new ConcurrentHashMap<>();
  private final ReadWriteLock lock = new ReentrantReadWriteLock(true);
  private final ScheduledExecutorService executorService = Executors
      .newSingleThreadScheduledExecutor();
  private final Thread shutdownHook = new Thread(this::callExecutorShutdown);

  public LocalNewSessionQueue(Tracer tracer, EventBus bus, Duration retryInterval,
                              Duration requestTimeout) {
    super(tracer, retryInterval, requestTimeout);
    this.bus = Require.nonNull("Event bus", bus);
    Runtime.getRuntime().addShutdownHook(shutdownHook);
  }

  public static NewSessionQueue create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();
    Duration retryInterval = new NewSessionQueueOptions(config).getSessionRequestRetryInterval();
    Duration requestTimeout = new NewSessionQueueOptions(config).getSessionRequestTimeout();
    return new LocalNewSessionQueue(tracer, bus, retryInterval, requestTimeout);
  }

  @Override
  public boolean isReady() {
    return bus.isReady();
  }

  @Override
  public boolean offerLast(HttpRequest request, RequestId requestId) {
    Require.nonNull("New Session request", request);

    Span span = tracer.getCurrentContext().createSpan("local_sessionqueue.add");
    boolean added = false;

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(),
        EventAttribute.setValue(getClass().getName()));

      added = requestIdQueue.offerLast(requestId);
      addRequestHeaders(request, requestId);

      if (added) {
        sessionRequests.put(requestId, request);
      }
      attributeMap.put(
          AttributeKey.REQUEST_ID.getKey(), EventAttribute.setValue(requestId.toString()));
      attributeMap.put("request.added", EventAttribute.setValue(added));
      span.addEvent("Add new session request to the queue", attributeMap);

      return added;
    } finally {
      writeLock.unlock();
      span.close();
      if (added) {
        bus.fire(new NewSessionRequestEvent(requestId));
      }
    }
  }

  @Override
  public boolean offerFirst(HttpRequest request, RequestId requestId) {
    Require.nonNull("New Session request", request);
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    boolean added = false;
    try {
      added = requestIdQueue.offerFirst(requestId);
      if (added) {
        sessionRequests.put(requestId, request);
      }
      return added;
    } finally {
      writeLock.unlock();
      if (added) {
        executorService.schedule(() -> retryRequest(request, requestId),
                                 super.retryInterval.getSeconds(), TimeUnit.SECONDS);
      }
    }
  }

  private void retryRequest(HttpRequest request, RequestId requestId) {
    if (hasRequestTimedOut(request)) {
      LOG.log(Level.INFO, "Request {0} timed out", requestId);
      Lock writeLock = lock.writeLock();
      writeLock.lock();
      try {
        if (requestIdQueue.remove(requestId)) {
          sessionRequests.remove(requestId);
        }
      } finally {
        writeLock.unlock();
        bus.fire(new NewSessionRejectedEvent(
            new NewSessionErrorResponse(requestId, "New session request timed out")));
      }
    } else {
      LOG.log(Level.INFO,
              "Adding request back to the queue. All slots are busy. Request: {0}",
              requestId);
      bus.fire(new NewSessionRequestEvent(requestId));
    }
  }

  @Override
  public Optional<HttpRequest> poll(RequestId id) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      if (requestIdQueue.remove(id)) {
        Optional<HttpRequest> request = Optional.ofNullable(sessionRequests.remove(id));
        if (request.isPresent()) {
          HttpRequest httpRequest = request.get();
          if (hasRequestTimedOut(httpRequest)) {
            bus.fire(new NewSessionRejectedEvent(
                new NewSessionErrorResponse(id, "New session request timed out")));
            return Optional.empty();
          }
          return Optional.of(httpRequest);
        }
      }
      return Optional.empty();
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public int clear() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      int count = 0;
      LOG.info("Clearing new session request queue");
      for (RequestId id = requestIdQueue.poll(); id != null;
           id = requestIdQueue.poll()) {
        count++;
        sessionRequests.remove(id);
        NewSessionErrorResponse errorResponse =
            new NewSessionErrorResponse(id, "New session request cancelled.");

        bus.fire(new NewSessionRejectedEvent(errorResponse));
      }
      return count;
    } finally {
      writeLock.unlock();
    }
  }

  public void callExecutorShutdown() {
    LOG.info("Shutting down session queue executor service");
    executorService.shutdown();
  }
}

