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

package org.openqa.selenium.grid.sessionmap.local;

import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;

public class LocalSessionMap extends SessionMap {

  private static final Logger LOG = Logger.getLogger(LocalSessionMap.class.getName());

  private final EventBus bus;
  private final Map<SessionId, Session> knownSessions = new ConcurrentHashMap<>();
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* be fair */ true);

  public LocalSessionMap(Tracer tracer, EventBus bus) {
    super(tracer);

    this.bus = Require.nonNull("Event bus", bus);

    bus.addListener(SessionClosedEvent.listener(id -> {
      try (Span span = tracer.getCurrentContext().createSpan("local_sessionmap.remove")) {
        Map<String, EventAttributeValue> attributeMap = new HashMap<>();
        attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(),
                         EventAttribute.setValue(getClass().getName()));
        SESSION_ID.accept(span, id);
        SESSION_ID_EVENT.accept(attributeMap, id);
        knownSessions.remove(id);
        String sessionDeletedMessage = "Deleted session from local Session Map";
        span.addEvent(sessionDeletedMessage, attributeMap);
        LOG.info(String.format("%s, Id: %s", sessionDeletedMessage, id));
      }
    }));

    bus.addListener(NodeRemovedEvent.listener(nodeStatus -> nodeStatus.getSlots().stream()
      .filter(slot -> slot.getSession() != null)
      .map(slot -> slot.getSession().getId())
      .forEach(knownSessions::remove)));

    bus.addListener(NodeRestartedEvent.listener(nodeStatus -> knownSessions.values()
      .removeIf(value -> value.getUri().equals(nodeStatus.getExternalUri()))));

  }

  public static SessionMap create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();

    return new LocalSessionMap(tracer, bus);
  }

  @Override
  public boolean isReady() {
    return bus.isReady();
  }

  @Override
  public boolean add(Session session) {
    Require.nonNull("Session", session);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try (Span span = tracer.getCurrentContext().createSpan("local_sessionmap.add")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(),
        EventAttribute.setValue(getClass().getName()));
      SessionId id = session.getId();
      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);
      knownSessions.put(session.getId(), session);
      span.addEvent("Added session into local session map", attributeMap);

      return true;
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public Session get(SessionId id) {
    Require.nonNull("Session ID", id);

    Lock readLock = lock.readLock();
    readLock.lock();
    try {
      Session session = knownSessions.get(id);
      if (session == null) {
        throw new NoSuchSessionException("Unable to find session with ID: " + id);
      }

      return session;
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public void remove(SessionId id) {
    Require.nonNull("Session ID", id);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      knownSessions.remove(id);
    } finally {
      writeLock.unlock();
    }
  }
}
