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

package org.openqa.selenium.grid.node.local;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.google.common.base.Ticker;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

public class LocalNode extends Node {

  private final URI externalUri;
  private final int maxSessionCount;
  private final List<SessionFactory> factories;
  private final Cache<SessionId, SessionAndHandler> currentSessions;

  private LocalNode(
      URI uri,
      int maxSessionCount,
      Ticker ticker,
      Duration sessionTimeout,
      List<SessionFactory> factories) {
    super(UUID.randomUUID());

    Preconditions.checkArgument(
        maxSessionCount > 0,
        "Only a positive number of sessions can be run: " + maxSessionCount);

    this.externalUri = Objects.requireNonNull(uri);
    this.maxSessionCount = maxSessionCount;
    this.factories = ImmutableList.copyOf(factories);

    this.currentSessions = CacheBuilder.newBuilder()
        .expireAfterAccess(sessionTimeout)
        .ticker(ticker)
        .build();
  }

  @VisibleForTesting
  public int getCurrentSessionCount() {
    // It seems wildly unlikely we'll overflow an int
    return Math.toIntExact(currentSessions.size());
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return factories.parallelStream().anyMatch(factory -> factory.test(capabilities));
  }

  @Override
  public Optional<Session> newSession(Capabilities capabilities) {
    if (getCurrentSessionCount() >= maxSessionCount) {
      return Optional.empty();
    }

    Optional<SessionAndHandler> possibleSession = factories.stream()
        .filter(factory -> factory.test(capabilities))
        .map(factory -> factory.apply(capabilities))
        .filter(Optional::isPresent)
        .findFirst()
        .map(Optional::get);

    if (!possibleSession.isPresent()) {
      return Optional.empty();
    }

    SessionAndHandler session = possibleSession.get();
    currentSessions.put(session.getId(), session);

    // The session we return has to look like it came from the node, since we might be dealing
    // with a webdriver implementation that only accepts connections from localhost
    return Optional.of(new Session(session.getId(), externalUri, session.getCapabilities()));
  }

  @Override
  protected boolean isSessionOwner(SessionId id) {
    Objects.requireNonNull(id, "Session ID has not been set");
    return currentSessions.getIfPresent(id) != null;
  }

  @Override
  public Session getSession(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID has not been set");
    SessionAndHandler session = currentSessions.getIfPresent(id);
    if (session == null) {
      throw new NoSuchSessionException("Cannot find session with id: " + id);
    }

    return new Session(session.getId(), externalUri, session.getCapabilities());
  }

  @Override
  public void executeWebDriverCommand(HttpRequest req, HttpResponse resp) {
    // True enough to be good enough
    if (!req.getUri().startsWith("/session/")) {
      throw new UnsupportedCommandException(String.format(
          "Unsupported command: (%s) %s", req.getMethod(), req.getMethod()));
    }

    String[] split = req.getUri().split("/", 4);
    SessionId id = new SessionId(split[2]);

    SessionAndHandler session = currentSessions.getIfPresent(id);
    if (session == null) {
      throw new NoSuchSessionException("Cannot find session with id: " + id);
    }
    try {
      session.getHandler().execute(req, resp);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Override
  public void stop(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID has not been set");
    SessionAndHandler session = currentSessions.getIfPresent(id);
    if (session == null) {
      throw new NoSuchSessionException("Cannot find session with id: " + id);
    }

    currentSessions.invalidate(id);
    session.stop();
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "id", getId(),
        "uri", externalUri,
        "capabilities", factories.stream()
            .map(SessionFactory::getCapabilities)
            .collect(Collectors.toSet()));
  }

  public static Builder builder(URI uri, SessionMap sessions) {
    return new Builder(uri, sessions);
  }

  public static class Builder {

    private final URI uri;
    private final SessionMap sessions;
    private final ImmutableList.Builder<SessionFactory> factories;
    private int maxCount = Runtime.getRuntime().availableProcessors() * 5;
    private Ticker ticker = Ticker.systemTicker();
    private Duration sessionTimeout = Duration.ofMinutes(5);

    public Builder(URI uri, SessionMap sessions) {
      this.uri = Objects.requireNonNull(uri);
      this.sessions = Objects.requireNonNull(sessions);
      this.factories = ImmutableList.builder();
    }

    public Builder add(Capabilities stereotype, Function<Capabilities, Session> factory) {
      Objects.requireNonNull(stereotype, "Capabilities must be set.");
      Objects.requireNonNull(factory, "Session factory must be set.");

      factories.add(new SessionFactory(sessions, stereotype, factory));

      return this;
    }

    public Builder maximumConcurrentSessions(int maxCount) {
      Preconditions.checkArgument(
          maxCount > 0,
          "Only a positive number of sessions can be run: " + maxCount);

      this.maxCount = maxCount;
      return this;
    }

    public Builder sessionTimeout(Duration timeout) {
      sessionTimeout = timeout;
      return this;
    }

    public LocalNode build() {
      return new LocalNode(uri, maxCount, ticker, sessionTimeout, factories.build());
    }

    public Advanced advanced() {
      return new Advanced();
    }

    public class Advanced {

      public Advanced clock(Clock clock) {
        ticker = new Ticker() {
          @Override
          public long read() {

            return clock.instant().toEpochMilli() * Duration.ofMillis(1).toNanos();
          }
        };
        return this;
      }

      public Node build() {
        return Builder.this.build();
      }
    }
  }

}
