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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.NewSessionErrorResponse;
import org.openqa.selenium.grid.data.NewSessionRejectedEvent;
import org.openqa.selenium.grid.data.NewSessionRequestEvent;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.ManagedAttribute;
import org.openqa.selenium.grid.jmx.ManagedService;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.SessionRequest;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.time.Duration;
import java.util.Deque;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@ManagedService(objectName = "org.seleniumhq.grid:type=SessionQueue,name=LocalSessionQueue",
  description = "New session queue")
public class LocalNewSessionQueue extends NewSessionQueue {

  private static final Logger LOG = Logger.getLogger(LocalNewSessionQueue.class.getName());
  private final EventBus bus;
  private final Deque<SessionRequest> sessionRequests = new ConcurrentLinkedDeque<>();
  private final ReadWriteLock lock = new ReentrantReadWriteLock(true);
  private final ScheduledExecutorService executorService =
    Executors.newSingleThreadScheduledExecutor();
  private final Thread shutdownHook = new Thread(this::callExecutorShutdown);
  private final String timedOutErrorMessage = String.format(
    "New session request rejected after being in the queue for more than %s",
    format(requestTimeout));

  public LocalNewSessionQueue(
    Tracer tracer,
    EventBus bus,
    Duration retryInterval,
    Duration requestTimeout) {
    super(tracer, retryInterval, requestTimeout);
    this.bus = Require.nonNull("Event bus", bus);
    Runtime.getRuntime().addShutdownHook(shutdownHook);

    Regularly regularly = new Regularly("New Session Queue Clean up");
    Duration purgeTimeout = requestTimeout.multipliedBy(2);
    regularly.submit(this::purgeTimedOutRequests, purgeTimeout, purgeTimeout);

    new JMXHelper().register(this);
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
  @ManagedAttribute(name = "NewSessionQueueSize")
  public int getQueueSize() {
    Lock readLock = lock.readLock();
    readLock.lock();
    try {
      return sessionRequests.size();
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public List<Set<Capabilities>> getQueuedRequests() {
    Lock readLock = lock.readLock();
    readLock.lock();
    try {
      return sessionRequests.stream()
        .map(SessionRequest::getDesiredCapabilities)
        .collect(Collectors.toList());
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public boolean offerLast(SessionRequest request) {
    Require.nonNull("New Session request", request);

    Span span = tracer.getCurrentContext().createSpan("local_sessionqueue.add");

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(
          AttributeKey.LOGGER_CLASS.getKey(), EventAttribute.setValue(getClass().getName()));

      boolean added = sessionRequests.offerLast(request);

      attributeMap.put(
          AttributeKey.REQUEST_ID.getKey(),
          EventAttribute.setValue(request.getRequestId().toString()));
      attributeMap.put("request.added", EventAttribute.setValue(added));
      span.addEvent("Add new session request to the queue", attributeMap);

      if (added) {
        bus.fire(new NewSessionRequestEvent(request.getRequestId()));
      }

      return added;
    } finally {
      writeLock.unlock();
      span.close();
    }
  }

  @Override
  public boolean offerFirst(SessionRequest request) {
    Require.nonNull("New Session request", request);
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      boolean added = sessionRequests.offerFirst(request);
      if (added) {
        executorService.schedule(() -> retryRequest(request),
          super.retryInterval.getSeconds(), TimeUnit.SECONDS);
      }
      return added;
    } finally {
      writeLock.unlock();
    }
  }

  private void retryRequest(SessionRequest sessionRequest) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      RequestId requestId = sessionRequest.getRequestId();
      if (hasRequestTimedOut(sessionRequest)) {
        LOG.log(Level.INFO, "Request {0} timed out", requestId);
        sessionRequests.remove(sessionRequest);
        bus.fire(new NewSessionRejectedEvent(
          new NewSessionErrorResponse(requestId, timedOutErrorMessage)));
      } else {
        LOG.log(Level.INFO,
          "Adding request back to the queue. All slots are busy. Request: {0}",
          requestId);
        bus.fire(new NewSessionRequestEvent(requestId));
      }
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public Optional<SessionRequest> remove(RequestId id) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      // Peek  the deque and check if the request-id matches. Most cases, it would.
      // If so poll the deque else iterate over the deque and find a match.
      Optional<SessionRequest> firstSessionRequest =
        Optional.ofNullable(sessionRequests.peekFirst());

      Optional<SessionRequest> request = Optional.empty();
      if (firstSessionRequest.isPresent()) {
        if (id.equals(firstSessionRequest.get().getRequestId())) {
          request = Optional.ofNullable(sessionRequests.pollFirst());
        } else {
          Optional<SessionRequest> matchedRequest = sessionRequests
            .stream()
            .filter(sessionRequest -> id.equals(sessionRequest.getRequestId()))
            .findFirst();

          if (matchedRequest.isPresent()) {
            SessionRequest sessionRequest = matchedRequest.get();
            sessionRequests.remove(sessionRequest);
            request = Optional.of(sessionRequest);
          }
        }
      }

      if (request.isPresent()) {
        if (hasRequestTimedOut(request.get())) {
          bus.fire(new NewSessionRejectedEvent(
            new NewSessionErrorResponse(id, timedOutErrorMessage)));
          return Optional.empty();
        }
      }
      return request;
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
      for (SessionRequest sessionRequest = sessionRequests.poll(); sessionRequest != null;
           sessionRequest = sessionRequests.poll()) {
        count++;
        NewSessionErrorResponse errorResponse =
          new NewSessionErrorResponse(sessionRequest.getRequestId(),
            "New session request cancelled.");

        bus.fire(new NewSessionRejectedEvent(errorResponse));
      }
      return count;
    } finally {
      writeLock.unlock();
    }
  }

  private void purgeTimedOutRequests() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Iterator<SessionRequest> iterator = sessionRequests.iterator();
      while (iterator.hasNext()) {
        SessionRequest sessionRequest = iterator.next();
        if (hasRequestTimedOut(sessionRequest)) {
          iterator.remove();
          bus.fire(new NewSessionRejectedEvent(
            new NewSessionErrorResponse(sessionRequest.getRequestId(), timedOutErrorMessage)));
        }
      }
    } finally {
      writeLock.unlock();
    }
  }

  public void callExecutorShutdown() {
    LOG.info("Shutting down session queue executor service");
    executorService.shutdown();
  }

  private static String format(Duration duration) {
    long hours = duration.toHours();
    int minutes = (int) duration.toMinutes() % 60;
    int secs = (int) (duration.getSeconds() % 60);

    StringBuilder toReturn = new StringBuilder();
    if (hours != 0) {
      toReturn.append(hours).append("h ");
    }
    if (hours != 0 || minutes != 0) {
      toReturn.append(minutes).append("m ");
    }
    toReturn.append(secs).append("s");
    return toReturn.toString();
  }
}

