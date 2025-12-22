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

import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.net.URI;
import java.time.Duration;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.logging.Logger;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.data.SessionClosedReason;
import org.openqa.selenium.grid.data.SessionRemovalInfo;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.AttributeMap;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Tracer;

public class LocalSessionMap extends SessionMap {

  private static final Logger LOG = Logger.getLogger(LocalSessionMap.class.getName());

  private final EventBus bus;
  private final IndexedSessionMap knownSessions = new IndexedSessionMap();

  /**
   * Tracks removed sessions with their removal reason and timestamp for 60 minutes to provide
   * better diagnostics when a NoSuchSessionException occurs.
   */
  private final Cache<SessionId, SessionRemovalInfo> recentlyRemovedSessions =
      Caffeine.newBuilder().expireAfterWrite(Duration.ofMinutes(60)).build();

  public LocalSessionMap(Tracer tracer, EventBus bus) {
    super(tracer);

    this.bus = Require.nonNull("Event bus", bus);

    // Listen to SessionClosedEvent and extract both sessionId and reason
    bus.addListener(
        SessionClosedEvent.listener(
            data -> removeWithReason(data.getSessionId(), data.getReason())));

    bus.addListener(
        NodeRemovedEvent.listener(
            nodeStatus -> {
              batchRemoveByUri(nodeStatus.getExternalUri(), SessionClosedReason.NODE_REMOVED);
            }));

    bus.addListener(
        NodeRestartedEvent.listener(
            previousNodeStatus -> {
              batchRemoveByUri(
                  previousNodeStatus.getExternalUri(), SessionClosedReason.NODE_RESTARTED);
            }));
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

    SessionId id = session.getId();
    knownSessions.put(id, session);

    try (Span span = tracer.getCurrentContext().createSpan("local_sessionmap.add")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(), getClass().getName());
      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);

      String sessionAddedMessage =
          String.format(
              "Added session to local Session Map, Id: %s, Node: %s", id, session.getUri());
      span.addEvent(sessionAddedMessage, attributeMap);
      LOG.info(sessionAddedMessage);
    }

    return true;
  }

  @Override
  public Session get(SessionId id) {
    Require.nonNull("Session ID", id);

    Session session = knownSessions.get(id);
    if (session == null) {
      // Check if this session was recently removed and provide detailed information
      SessionRemovalInfo removalInfo = recentlyRemovedSessions.getIfPresent(id);
      if (removalInfo != null) {
        throw new NoSuchSessionException(
            String.format("Unable to find session with ID: %s. Session was %s", id, removalInfo));
      }

      throw new NoSuchSessionException("Unable to find session with ID: " + id);
    }
    return session;
  }

  @Override
  public void remove(SessionId id) {
    removeWithReason(id, SessionClosedReason.QUIT_COMMAND);
  }

  private void removeWithReason(SessionId id, SessionClosedReason reason) {
    Require.nonNull("Session ID", id);
    Require.nonNull("Reason", reason);

    Session removedSession = knownSessions.remove(id);

    String reasonText = reason.getReasonText();
    if (removedSession != null) {
      recentlyRemovedSessions.put(id, new SessionRemovalInfo(reasonText, removedSession.getUri()));
      LOG.fine(String.format("Tracked removal for session %s with reason: %s", id, reasonText));
    }

    try (Span span = tracer.getCurrentContext().createSpan("local_sessionmap.remove")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(), getClass().getName());
      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);

      String sessionDeletedMessage =
          String.format(
              "Deleted session from local Session Map, Id: %s, Node: %s, Reason: %s",
              id,
              removedSession != null ? String.valueOf(removedSession.getUri()) : "unidentified",
              reasonText);
      span.addEvent(sessionDeletedMessage, attributeMap);
      LOG.info(sessionDeletedMessage);
    }
  }

  private void batchRemoveByUri(URI externalUri, SessionClosedReason closeReason) {
    Set<SessionId> sessionsToRemove = knownSessions.getSessionsByUri(externalUri);

    if (sessionsToRemove.isEmpty()) {
      return; // Early return for empty operations - no tracing overhead
    }

    knownSessions.batchRemove(sessionsToRemove);

    // Track removal info for each session
    for (SessionId sessionId : sessionsToRemove) {
      recentlyRemovedSessions.put(
          sessionId, new SessionRemovalInfo(closeReason.getReasonText(), externalUri));
    }

    try (Span span = tracer.getCurrentContext().createSpan("local_sessionmap.batch_remove")) {
      AttributeMap attributeMap = tracer.createAttributeMap();
      attributeMap.put(AttributeKey.LOGGER_CLASS.getKey(), getClass().getName());
      attributeMap.put("removal.reason", closeReason.getReasonText());
      attributeMap.put("node.uri", externalUri.toString());
      attributeMap.put("sessions.count", sessionsToRemove.size());

      String batchRemoveMessage =
          String.format(
              "Batch removed %d sessions from local Session Map for Node %s (reason: %s)",
              sessionsToRemove.size(), externalUri, closeReason);
      span.addEvent(batchRemoveMessage, attributeMap);
      LOG.info(batchRemoveMessage);
    }
  }

  private static class IndexedSessionMap {
    private final ConcurrentMap<SessionId, Session> sessions = new ConcurrentHashMap<>();
    private final ConcurrentMap<URI, Set<SessionId>> sessionsByUri = new ConcurrentHashMap<>();
    private final Object coordinationLock = new Object();

    public Session get(SessionId id) {
      return sessions.get(id);
    }

    public void put(SessionId id, Session session) {
      synchronized (coordinationLock) {
        Session previous = sessions.put(id, session);

        if (previous != null && previous.getUri() != null) {
          cleanupUriIndex(previous.getUri(), id);
        }

        URI sessionUri = session.getUri();
        if (sessionUri != null) {
          sessionsByUri.computeIfAbsent(sessionUri, k -> ConcurrentHashMap.newKeySet()).add(id);
        }
      }
    }

    public Session remove(SessionId id) {
      synchronized (coordinationLock) {
        Session removed = sessions.remove(id);

        if (removed != null && removed.getUri() != null) {
          cleanupUriIndex(removed.getUri(), id);
        }

        return removed;
      }
    }

    public void batchRemove(Set<SessionId> sessionIds) {
      synchronized (coordinationLock) {
        Map<URI, Set<SessionId>> uriToSessionIds = new HashMap<>();

        // Single loop: remove sessions and collect URI mappings in one pass
        for (SessionId id : sessionIds) {
          Session session = sessions.remove(id);
          if (session != null && session.getUri() != null) {
            uriToSessionIds.computeIfAbsent(session.getUri(), k -> new HashSet<>()).add(id);
          }
        }

        // Clean up URI index for all affected URIs
        for (Map.Entry<URI, Set<SessionId>> entry : uriToSessionIds.entrySet()) {
          cleanupUriIndex(entry.getKey(), entry.getValue());
        }
      }
    }

    private void cleanupUriIndex(URI uri, SessionId sessionId) {
      sessionsByUri.computeIfPresent(
          uri,
          (key, sessionIds) -> {
            sessionIds.remove(sessionId);
            return sessionIds.isEmpty() ? null : sessionIds;
          });
    }

    private void cleanupUriIndex(URI uri, Set<SessionId> sessionIdsToRemove) {
      sessionsByUri.computeIfPresent(
          uri,
          (key, sessionIds) -> {
            sessionIds.removeAll(sessionIdsToRemove);
            return sessionIds.isEmpty() ? null : sessionIds;
          });
    }

    public Set<SessionId> getSessionsByUri(URI uri) {
      Set<SessionId> result = sessionsByUri.get(uri);
      // Return an immutable copy to prevent concurrent modification issues
      return (result != null && !result.isEmpty()) ? Set.copyOf(result) : Set.of();
    }

    public Set<Map.Entry<SessionId, Session>> entrySet() {
      return Collections.unmodifiableSet(sessions.entrySet());
    }

    public Collection<Session> values() {
      return Collections.unmodifiableCollection(sessions.values());
    }

    public int size() {
      return sessions.size();
    }

    public boolean isEmpty() {
      return sessions.isEmpty();
    }

    public void clear() {
      synchronized (coordinationLock) {
        sessions.clear();
        sessionsByUri.clear();
      }
    }
  }
}
