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
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.NewSessionRequestEvent;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionqueue.SessionRequestQueue;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.Deque;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Logger;

public class LocalSessionRequestQueue extends SessionRequestQueue {

  private static final Logger LOG = Logger.getLogger(LocalSessionRequestQueue.class.getName());
  private final EventBus bus;
  private final Deque<CreateSessionRequest> sessionRequests = new ConcurrentLinkedDeque<>();
  private final ReadWriteLock lock = new ReentrantReadWriteLock(true);
  private final ScheduledExecutorService executorService = Executors
      .newSingleThreadScheduledExecutor();
  private final Thread shutdownHook = new Thread(this::callExecutorShutdown);

  public LocalSessionRequestQueue(Tracer tracer, EventBus bus) {
    super(tracer);
    this.bus = Require.nonNull("Event bus", bus);

    Runtime.getRuntime().addShutdownHook(shutdownHook);
  }

  public static SessionRequestQueue create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();

    return new LocalSessionRequestQueue(tracer, bus);
  }

  @Override
  public boolean isReady() {
    return bus.isReady();
  }

  @Override
  public boolean offerLast(CreateSessionRequest request, UUID requestId) {
    Require.nonNull("New Session request", request);
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    boolean added = false;
    try {
      added = sessionRequests.offerLast(request);
      if (added) {
        LOG.info("Added to the queue!!");
      }
      return added;
    } finally {
      writeLock.unlock();
      if (added) {
        bus.fire(new NewSessionRequestEvent(requestId));
      }
    }
  }

  @Override
  public boolean offerFirst(CreateSessionRequest request, UUID requestId) {
    Require.nonNull("New Session request", request);
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    boolean added = false;
    try {
      added = sessionRequests.offerFirst(request);
      return added;
    } finally {
      writeLock.unlock();
      if (added) {
        executorService.schedule(() -> {
          LOG.info("Adding request back to the queue");
          bus.fire(new NewSessionRequestEvent(requestId));
        }, 30, TimeUnit.SECONDS);
      }
    }
  }

  @Override
  public CreateSessionRequest poll() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      return sessionRequests.poll();
    } finally {
      writeLock.unlock();
    }
  }

  public void callExecutorShutdown() {
    LOG.info("Shutting down session queue executor service");
    executorService.shutdown();
  }
}
