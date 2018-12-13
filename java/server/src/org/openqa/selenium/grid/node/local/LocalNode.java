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
import org.openqa.selenium.grid.component.HealthCheck;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.NodeStatus;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.Span;

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
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

public class LocalNode extends Node {

  private final URI externalUri;
  private final HealthCheck healthCheck;
  private final int maxSessionCount;
  private final List<SessionFactory> factories;
  private final Cache<SessionId, SessionAndHandler> currentSessions;

  private LocalNode(
      DistributedTracer tracer,
      URI uri,
      HealthCheck healthCheck,
      int maxSessionCount,
      Ticker ticker,
      Duration sessionTimeout,
      List<SessionFactory> factories) {
    super(tracer, UUID.randomUUID());

    Preconditions.checkArgument(
        maxSessionCount > 0,
        "Only a positive number of sessions can be run: " + maxSessionCount);

    this.externalUri = Objects.requireNonNull(uri);
    this.healthCheck = Objects.requireNonNull(healthCheck);
    this.maxSessionCount = Math.min(maxSessionCount, factories.size());
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
    try (Span span = tracer.createSpan("node.is-supporting", tracer.getActiveSpan())) {
      span.addTag("capabilities", capabilities);
      boolean toReturn = factories.parallelStream().anyMatch(factory -> factory.test(capabilities));
      span.addTag("match-made", toReturn);
      return toReturn;
    }
  }

  @Override
  public Optional<Session> newSession(Capabilities capabilities) {
    try (Span span = tracer.createSpan("node.new-session", tracer.getActiveSpan())) {
      span.addTag("capabilities", capabilities);

      if (getCurrentSessionCount() >= maxSessionCount) {
        span.addTag("result", "session count exceeded");
        return Optional.empty();
      }

      Optional<SessionAndHandler> possibleSession = factories.stream()
          .filter(factory -> factory.test(capabilities))
          .map(factory -> factory.apply(capabilities))
          .filter(Optional::isPresent)
          .findFirst()
          .map(Optional::get);

      if (!possibleSession.isPresent()) {
        span.addTag("result", "No possible session detected");
        return Optional.empty();
      }

      SessionAndHandler session = possibleSession.get();
      span.addTag("session.id", session.getId());
      span.addTag("session.capabilities", session.getCapabilities());
      span.addTag("session.uri", session.getUri());
      currentSessions.put(session.getId(), session);

      // The session we return has to look like it came from the node, since we might be dealing
      // with a webdriver implementation that only accepts connections from localhost
      return Optional.of(new Session(session.getId(), externalUri, session.getCapabilities()));
    }
  }

  @Override
  protected boolean isSessionOwner(SessionId id) {
    try (Span span = tracer.createSpan("node.is-session-owner", tracer.getActiveSpan())) {
      Objects.requireNonNull(id, "Session ID has not been set");
      span.addTag("session.id", id);
      boolean toReturn = currentSessions.getIfPresent(id) != null;
      span.addTag("result", toReturn);
      return toReturn;
    }
  }

  @Override
  public Session getSession(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID has not been set");

    try (Span span = tracer.createSpan("node.get-session", tracer.getActiveSpan())) {
      span.addTag("session.id", id);
      SessionAndHandler session = currentSessions.getIfPresent(id);
      if (session == null) {
        span.addTag("result", false);
        throw new NoSuchSessionException("Cannot find session with id: " + id);
      }

      span.addTag("session.capabilities", session.getCapabilities());
      span.addTag("session.uri", session.getUri());
      return new Session(session.getId(), externalUri, session.getCapabilities());
    }
  }

  @Override
  public void executeWebDriverCommand(HttpRequest req, HttpResponse resp) {
    try (Span span = tracer.createSpan("node.webdriver-command", tracer.getActiveSpan())) {

      span.addTag("http.method", req.getMethod());
      span.addTag("http.url", req.getUri());

      // True enough to be good enough
      if (!req.getUri().startsWith("/session/")) {
        throw new UnsupportedCommandException(String.format(
            "Unsupported command: (%s) %s", req.getMethod(), req.getMethod()));
      }

      String[] split = req.getUri().split("/", 4);
      SessionId id = new SessionId(split[2]);

      span.addTag("session.id", id);

      SessionAndHandler session = currentSessions.getIfPresent(id);
      if (session == null) {
        span.addTag("result", "Session not found");
        throw new NoSuchSessionException("Cannot find session with id: " + id);
      }

      span.addTag("session.capabilities", session.getCapabilities());
      span.addTag("session.uri", session.getUri());

      try {
        session.getHandler().execute(req, resp);
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    }
  }

  @Override
  public void stop(SessionId id) throws NoSuchSessionException {
    try (Span span = tracer.createSpan("node.stop-session", tracer.getActiveSpan())) {

      span.addTag("session.id", id);

      Objects.requireNonNull(id, "Session ID has not been set");
      SessionAndHandler session = currentSessions.getIfPresent(id);
      if (session == null) {
        throw new NoSuchSessionException("Cannot find session with id: " + id);
      }

      span.addTag("session.capabilities", session.getCapabilities());
      span.addTag("session.uri", session.getUri());

      currentSessions.invalidate(id);
      session.stop();
    }
  }

  @Override
  public NodeStatus getStatus() {
    Map<Capabilities, Integer> available = new ConcurrentHashMap<>();
    Map<Capabilities, Integer> used = new ConcurrentHashMap<>();

    for (SessionFactory factory : factories) {
      Map<Capabilities, Integer> map = factory.isAvailable() ? available : used;
      Capabilities caps = factory.getCapabilities();
      Integer count = map.getOrDefault(caps, 0);
      map.put(caps, count + 1);
    }

    return new NodeStatus(
        getId(),
        externalUri,
        maxSessionCount,
        available,
        used);
  }

  @Override
  public HealthCheck getHealthCheck() {
    return healthCheck;
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "id", getId(),
        "uri", externalUri,
        "maxSessions", maxSessionCount,
        "capabilities", factories.stream()
            .map(SessionFactory::getCapabilities)
            .collect(Collectors.toSet()));
  }

  public static Builder builder(DistributedTracer tracer, URI uri, SessionMap sessions) {
    return new Builder(tracer, uri, sessions);
  }

  public static class Builder {

    private final DistributedTracer tracer;
    private final URI uri;
    private final SessionMap sessions;
    private final ImmutableList.Builder<SessionFactory> factories;
    private int maxCount = Runtime.getRuntime().availableProcessors() * 5;
    private Ticker ticker = Ticker.systemTicker();
    private Duration sessionTimeout = Duration.ofMinutes(5);
    private HealthCheck healthCheck;

    public Builder(DistributedTracer tracer, URI uri, SessionMap sessions) {
      this.tracer = Objects.requireNonNull(tracer);
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
      HealthCheck check =
          healthCheck == null ?
          () -> new HealthCheck.Result(true, uri + " is ok") :
          healthCheck;

      return new LocalNode(tracer, uri, check, maxCount, ticker, sessionTimeout, factories.build());
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

      public Advanced healthCheck(HealthCheck healthCheck) {
        Builder.this.healthCheck = Objects.requireNonNull(healthCheck, "Health check must be set.");
        return this;
      }

      public Node build() {
        return Builder.this.build();
      }
    }
  }

}
