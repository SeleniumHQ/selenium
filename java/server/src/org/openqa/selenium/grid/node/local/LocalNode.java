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
import com.google.common.cache.RemovalListener;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import io.opentelemetry.trace.Span;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.component.HealthCheck;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summingInt;
import static org.openqa.selenium.grid.data.SessionClosedEvent.SESSION_CLOSED;
import static org.openqa.selenium.grid.node.CapabilityResponseEncoder.getEncoder;
import static org.openqa.selenium.remote.HttpSessionId.getSessionId;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

public class LocalNode extends Node {

  public static final Json JSON = new Json();
  private final URI externalUri;
  private final HealthCheck healthCheck;
  private final int maxSessionCount;
  private final List<SessionSlot> factories;
  private final Cache<SessionId, SessionSlot> currentSessions;
  private final Regularly regularly;
  private final String registrationSecret;

  private LocalNode(
    Tracer tracer,
    EventBus bus,
    URI uri,
    HealthCheck healthCheck,
    int maxSessionCount,
    Ticker ticker,
    Duration sessionTimeout,
    List<SessionSlot> factories,
    String registrationSecret) {
    super(tracer, UUID.randomUUID(), uri);

    Preconditions.checkArgument(
      maxSessionCount > 0,
      "Only a positive number of sessions can be run: " + maxSessionCount);

    this.externalUri = Objects.requireNonNull(uri);
    this.healthCheck = Objects.requireNonNull(healthCheck);
    this.maxSessionCount = Math.min(maxSessionCount, factories.size());
    this.factories = ImmutableList.copyOf(factories);
    this.registrationSecret = registrationSecret;

    this.currentSessions = CacheBuilder.newBuilder()
      .expireAfterAccess(sessionTimeout)
      .ticker(ticker)
      .removalListener((RemovalListener<SessionId, SessionSlot>) notification -> {
        // If we were invoked explicitly, then return: we know what we're doing.
        if (!notification.wasEvicted()) {
          return;
        }

        killSession(notification.getValue());
      })
      .build();

    this.regularly = new Regularly("Local Node: " + externalUri);
    regularly.submit(currentSessions::cleanUp, Duration.ofSeconds(30), Duration.ofSeconds(30));

    bus.addListener(SESSION_CLOSED, event -> {
      try {
        this.stop(event.getData(SessionId.class));
      } catch (NoSuchSessionException ignore) {
      }
    });
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
  public Optional<CreateSessionResponse> newSession(CreateSessionRequest sessionRequest) {
    Span span = tracer.getCurrentSpan();
    Logger.getLogger(LocalNode.class.getName()).info("Creating new session using span: " + span);
    Objects.requireNonNull(sessionRequest, "Session request has not been set.");

    if (span != null) {
      span.setAttribute("session_count", getCurrentSessionCount());
    }

    if (getCurrentSessionCount() >= maxSessionCount) {
      return Optional.empty();
    }

    Optional<ActiveSession> possibleSession = Optional.empty();
    SessionSlot slot = null;
    for (SessionSlot factory : factories) {
      if (!factory.isAvailable() || !factory.test(sessionRequest.getCapabilities())) {
        continue;
      }

      possibleSession = factory.apply(sessionRequest);
      if (possibleSession.isPresent()) {
        slot = factory;
        break;
      }
    }

    if (!possibleSession.isPresent()) {
      return Optional.empty();
    }

    ActiveSession session = possibleSession.get();
    currentSessions.put(session.getId(), slot);

    if (span != null) {
      SESSION_ID.accept(span, session.getId());
      CAPABILITIES.accept(span, session.getCapabilities());
      span.setAttribute("session.downstream.dialect", session.getDownstreamDialect().toString());
      span.setAttribute("session.upstream.dialect", session.getUpstreamDialect().toString());
      span.setAttribute("session.uri", session.getUri().toString());
    }

    // The session we return has to look like it came from the node, since we might be dealing
    // with a webdriver implementation that only accepts connections from localhost
    Session externalSession = createExternalSession(session, externalUri);
    return Optional.of(new CreateSessionResponse(
      externalSession,
      getEncoder(session.getDownstreamDialect()).apply(externalSession)));
  }

  @Override
  protected boolean isSessionOwner(SessionId id) {
    Objects.requireNonNull(id, "Session ID has not been set");
    return currentSessions.getIfPresent(id) != null;
  }

  @Override
  public Session getSession(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID has not been set");

    SessionSlot slot = currentSessions.getIfPresent(id);
    if (slot == null) {
      throw new NoSuchSessionException("Cannot find session with id: " + id);
    }

    return createExternalSession(slot.getSession(), externalUri);
  }

  @Override
  public HttpResponse executeWebDriverCommand(HttpRequest req) {
    // True enough to be good enough
    SessionId id = getSessionId(req.getUri()).map(SessionId::new)
      .orElseThrow(() -> new NoSuchSessionException("Cannot find session: " + req));

    SessionSlot slot = currentSessions.getIfPresent(id);
    if (slot == null) {
      throw new NoSuchSessionException("Cannot find session with id: " + id);
    }

    HttpResponse toReturn = slot.execute(req);
    if (req.getMethod() == DELETE && req.getUri().equals("/session/" + id)) {
      stop(id);
    }
    return toReturn;
  }

  @Override
  public void stop(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID has not been set");

    SessionSlot slot = currentSessions.getIfPresent(id);
    if (slot == null) {
      throw new NoSuchSessionException("Cannot find session with id: " + id);
    }

    killSession(slot);
  }

  private Session createExternalSession(ActiveSession other, URI externalUri) {
    return new Session(other.getId(), externalUri, other.getCapabilities());
  }

  private void killSession(SessionSlot slot) {
    currentSessions.invalidate(slot.getSession().getId());
    // Attempt to stop the session
    if (!slot.isAvailable()) {
      slot.stop();
    }
  }

  @Override
  public NodeStatus getStatus() {
    Map<Capabilities, Integer> stereotypes = factories.stream()
      .collect(groupingBy(SessionSlot::getStereotype, summingInt(caps -> 1)));

    ImmutableSet<NodeStatus.Active> activeSessions = currentSessions.asMap().values().stream()
      .map(slot -> new NodeStatus.Active(
        slot.getStereotype(),
        slot.getSession().getId(),
        slot.getSession().getCapabilities()))
      .collect(toImmutableSet());

    return new NodeStatus(
      getId(),
      externalUri,
      maxSessionCount,
      stereotypes,
      activeSessions,
      registrationSecret);
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
        .map(SessionSlot::getStereotype)
        .collect(Collectors.toSet()));
  }

  public static Builder builder(
    Tracer tracer,
    EventBus bus,
    HttpClient.Factory httpClientFactory,
    URI uri,
    String registrationSecret) {
    return new Builder(tracer, bus, httpClientFactory, uri, registrationSecret);
  }

  public static class Builder {

    private final Tracer tracer;
    private final EventBus bus;
    private final HttpClient.Factory httpClientFactory;
    private final URI uri;
    private final String registrationSecret;
    private final ImmutableList.Builder<SessionSlot> factories;
    private int maxCount = Runtime.getRuntime().availableProcessors() * 5;
    private Ticker ticker = Ticker.systemTicker();
    private Duration sessionTimeout = Duration.ofMinutes(5);
    private HealthCheck healthCheck;

    public Builder(
      Tracer tracer,
      EventBus bus,
      HttpClient.Factory httpClientFactory,
      URI uri,
      String registrationSecret) {
      this.tracer = Objects.requireNonNull(tracer);
      this.bus = Objects.requireNonNull(bus);
      this.httpClientFactory = Objects.requireNonNull(httpClientFactory);
      this.uri = Objects.requireNonNull(uri);
      this.registrationSecret = registrationSecret;
      this.factories = ImmutableList.builder();
    }

    public Builder add(Capabilities stereotype, SessionFactory factory) {
      Objects.requireNonNull(stereotype, "Capabilities must be set.");
      Objects.requireNonNull(factory, "Session factory must be set.");

      factories.add(new SessionSlot(bus, stereotype, factory));

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
          () -> new HealthCheck.Result(true, uri + " is ok", registrationSecret) :
          healthCheck;

      return new LocalNode(
        tracer,
        bus,
        uri,
        check,
        maxCount,
        ticker,
        sessionTimeout,
        factories.build(),
        registrationSecret);
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
