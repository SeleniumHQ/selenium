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
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class LocalSessionRequestQueue extends SessionRequestQueue {

  private final EventBus bus;
  private final Deque<CreateSessionRequest> sessionRequests = new ConcurrentLinkedDeque<>();
  private final ReadWriteLock lock = new ReentrantReadWriteLock(true);

  public LocalSessionRequestQueue(Tracer tracer, EventBus bus) {
    super(tracer);

    this.bus = Require.nonNull("Event bus", bus);
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
  public boolean offer(CreateSessionRequest request) {
    Require.nonNull("New Session request", request);
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    boolean added=false;
    try {
      added = sessionRequests.offer(request);
      return added;
    } finally {
      writeLock.unlock();
      if(added) {
        bus.fire(new NewSessionRequestEvent(UUID.randomUUID()));
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
}
