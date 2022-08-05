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
import com.google.common.base.Ticker;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalListener;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.RetrySessionRequestException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.concurrent.GuardedRunnable;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeDrainComplete;
import org.openqa.selenium.grid.data.NodeDrainStarted;
import org.openqa.selenium.grid.data.NodeHeartBeatEvent;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.ManagedAttribute;
import org.openqa.selenium.grid.jmx.ManagedService;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.grid.node.docker.DockerSession;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.grid.node.CapabilityResponseEncoder.getEncoder;
import static org.openqa.selenium.remote.HttpSessionId.getSessionId;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

@ManagedService(objectName = "org.seleniumhq.grid:type=Node,name=LocalNode",
  description = "Node running the webdriver sessions.")
public class LocalNode extends Node {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger(LocalNode.class.getName());
  private final EventBus bus;
  private final URI externalUri;
  private final URI gridUri;
  private final Duration heartbeatPeriod;
  private final HealthCheck healthCheck;
  private final int maxSessionCount;
  private final int configuredSessionCount;
  private final boolean cdpEnabled;
  private final AtomicBoolean drainAfterSessions = new AtomicBoolean();
  private final List<SessionSlot> factories;
  private final Cache<SessionId, SessionSlot> currentSessions;
  private final Cache<SessionId, TemporaryFilesystem> tempFileSystems;
  private final AtomicInteger pendingSessions = new AtomicInteger();
  private final AtomicInteger sessionCount = new AtomicInteger();

  private LocalNode(
    Tracer tracer,
    EventBus bus,
    URI uri,
    URI gridUri,
    HealthCheck healthCheck,
    int maxSessionCount,
    int drainAfterSessionCount,
    boolean cdpEnabled,
    Ticker ticker,
    Duration sessionTimeout,
    Duration heartbeatPeriod,
    List<SessionSlot> factories,
    Secret registrationSecret) {
    super(tracer, new NodeId(UUID.randomUUID()), uri, registrationSecret);

    this.bus = Require.nonNull("Event bus", bus);

    this.externalUri = Require.nonNull("Remote node URI", uri);
    this.gridUri = Require.nonNull("Grid URI", gridUri);
    this.maxSessionCount = Math.min(
      Require.positive("Max session count", maxSessionCount), factories.size());
    this.heartbeatPeriod = heartbeatPeriod;
    this.factories = ImmutableList.copyOf(factories);
    Require.nonNull("Registration secret", registrationSecret);
    this.configuredSessionCount = drainAfterSessionCount;
    this.drainAfterSessions.set(this.configuredSessionCount > 0);
    this.sessionCount.set(drainAfterSessionCount);
    this.cdpEnabled = cdpEnabled;

    this.healthCheck = healthCheck == null ?
                       () -> {
                         NodeStatus status = getStatus();
                         return new HealthCheck.Result(
                           status.getAvailability(),
                           String.format("%s is %s", uri, status.getAvailability()));
                       } : healthCheck;

    this.tempFileSystems = CacheBuilder.newBuilder()
      .expireAfterAccess(sessionTimeout)
      .ticker(ticker)
      .removalListener((RemovalListener<SessionId, TemporaryFilesystem>) notification -> {
        TemporaryFilesystem tempFS = notification.getValue();
        tempFS.deleteTemporaryFiles();
        tempFS.deleteBaseDir();
      })
      .build();

    this.currentSessions = CacheBuilder.newBuilder()
      .expireAfterAccess(sessionTimeout)
      .ticker(ticker)
      .removalListener((RemovalListener<SessionId, SessionSlot>) notification -> {
        if (notification.getKey() != null && notification.getValue() != null) {
          // Attempt to stop the session
          SessionSlot slot = notification.getValue();
          SessionId sessionId = notification.getKey();
          slot.stop();
          // Invalidate temp file system
          this.tempFileSystems.invalidate(sessionId);
          // Decrement pending sessions if Node is draining
          if (this.isDraining()) {
            int done = pendingSessions.decrementAndGet();
            if (done <= 0) {
              LOG.info("Node draining complete!");
              bus.fire(new NodeDrainComplete(this.getId()));
            }
          }
        } else {
          LOG.log(Debug.getDebugLogLevel(), "Received stop session notification with null values");
        }
      })
      .build();

    ScheduledExecutorService sessionCleanupNodeService =
      Executors.newSingleThreadScheduledExecutor(
        r -> {
          Thread thread = new Thread(r);
          thread.setDaemon(true);
          thread.setName("Local Node - Session Cleanup " + externalUri);
          return thread;
        });
    sessionCleanupNodeService.scheduleAtFixedRate(
      GuardedRunnable.guard(currentSessions::cleanUp), 30, 30, TimeUnit.SECONDS);

    ScheduledExecutorService tempFileCleanupNodeService =
      Executors.newSingleThreadScheduledExecutor(
        r -> {
          Thread thread = new Thread(r);
          thread.setDaemon(true);
          thread.setName("TempFile Cleanup Node " + externalUri);
          return thread;
        });
    tempFileCleanupNodeService.scheduleAtFixedRate(
      GuardedRunnable.guard(tempFileSystems::cleanUp), 30, 30, TimeUnit.SECONDS);

    ScheduledExecutorService heartbeatNodeService =
      Executors.newSingleThreadScheduledExecutor(
        r -> {
          Thread thread = new Thread(r);
          thread.setDaemon(true);
          thread.setName("HeartBeat Node " + externalUri);
          return thread;
        });
    heartbeatNodeService.scheduleAtFixedRate(
      GuardedRunnable.guard(() -> bus.fire(new NodeHeartBeatEvent(getStatus()))),
      heartbeatPeriod.getSeconds(),
      heartbeatPeriod.getSeconds(),
      TimeUnit.SECONDS);

    Runtime.getRuntime().addShutdownHook(new Thread(this::stopAllSessions));
    new JMXHelper().register(this);
  }

  public static Builder builder(
    Tracer tracer,
    EventBus bus,
    URI uri,
    URI gridUri,
    Secret registrationSecret) {
    return new Builder(tracer, bus, uri, gridUri, registrationSecret);
  }

  @Override
  public boolean isReady() {
    return bus.isReady();
  }

  @VisibleForTesting
  @ManagedAttribute(name = "CurrentSessions")
  public int getCurrentSessionCount() {
    // It seems wildly unlikely we'll overflow an int
    return Math.toIntExact(currentSessions.size());
  }

  @ManagedAttribute(name = "MaxSessions")
  public int getMaxSessionCount() {
    return maxSessionCount;
  }

  @ManagedAttribute(name = "Status")
  public Availability getAvailability() {
    return isDraining() ? DRAINING : UP;
  }

  @ManagedAttribute(name = "TotalSlots")
  public int getTotalSlots() {
    return factories.size();
  }

  @ManagedAttribute(name = "UsedSlots")
  public long getUsedSlots() {
    return factories.stream().filter(sessionSlot -> !sessionSlot.isAvailable()).count();
  }

  @ManagedAttribute(name = "Load")
  public float getLoad() {
    long inUse = factories.stream().filter(sessionSlot -> !sessionSlot.isAvailable()).count();
    return inUse / (float) maxSessionCount * 100f;
  }

  @ManagedAttribute(name = "RemoteNodeUri")
  public URI getExternalUri() {
    return this.getUri();
  }

  @ManagedAttribute(name = "GridUri")
  public URI getGridUri() {
    return this.gridUri;
  }

  @ManagedAttribute(name = "NodeId")
  public String getNodeId() {
    return getId().toString();
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return factories.parallelStream().anyMatch(factory -> factory.test(capabilities));
  }

  @Override
  public Either<WebDriverException, CreateSessionResponse> newSession(CreateSessionRequest sessionRequest) {
    Require.nonNull("Session request", sessionRequest);

    try (Span span = tracer.getCurrentContext().createSpan("node.new_session")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      attributeMap
        .put(AttributeKey.LOGGER_CLASS.getKey(), EventAttribute.setValue(getClass().getName()));
      attributeMap.put("session.request.capabilities",
        EventAttribute.setValue(sessionRequest.getDesiredCapabilities().toString()));
      attributeMap.put("session.request.downstreamdialect",
        EventAttribute.setValue(sessionRequest.getDownstreamDialects().toString()));

      int currentSessionCount = getCurrentSessionCount();
      span.setAttribute("current.session.count", currentSessionCount);
      attributeMap.put("current.session.count", EventAttribute.setValue(currentSessionCount));

      if (getCurrentSessionCount() >= maxSessionCount) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.RESOURCE_EXHAUSTED);
        attributeMap.put("max.session.count", EventAttribute.setValue(maxSessionCount));
        span.addEvent("Max session count reached", attributeMap);
        return Either.left(new RetrySessionRequestException("Max session count reached."));
      }
      if (isDraining()) {
        span.setStatus(Status.UNAVAILABLE.withDescription("The node is draining. Cannot accept new sessions."));
        return Either.left(
          new RetrySessionRequestException("The node is draining. Cannot accept new sessions."));
      }

      // Identify possible slots to use as quickly as possible to enable concurrent session starting
      SessionSlot slotToUse = null;
      synchronized (factories) {
        for (SessionSlot factory : factories) {
          if (!factory.isAvailable() || !factory.test(sessionRequest.getDesiredCapabilities())) {
            continue;
          }

          factory.reserve();
          slotToUse = factory;
          break;
        }
      }

      if (slotToUse == null) {
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.NOT_FOUND);
        span.addEvent("No slot matched the requested capabilities. ", attributeMap);
        return Either.left(
          new RetrySessionRequestException("No slot matched the requested capabilities."));
      }

      Either<WebDriverException, ActiveSession> possibleSession = slotToUse.apply(sessionRequest);

      if (possibleSession.isRight()) {
        ActiveSession session = possibleSession.right();
        currentSessions.put(session.getId(), slotToUse);

        checkSessionCount();

        SessionId sessionId = session.getId();
        Capabilities caps = session.getCapabilities();
        SESSION_ID.accept(span, sessionId);
        CAPABILITIES.accept(span, caps);
        String downstream = session.getDownstreamDialect().toString();
        String upstream = session.getUpstreamDialect().toString();
        String sessionUri = session.getUri().toString();
        span.setAttribute(AttributeKey.DOWNSTREAM_DIALECT.getKey(), downstream);
        span.setAttribute(AttributeKey.UPSTREAM_DIALECT.getKey(), upstream);
        span.setAttribute(AttributeKey.SESSION_URI.getKey(), sessionUri);

        // The session we return has to look like it came from the node, since we might be dealing
        // with a webdriver implementation that only accepts connections from localhost
        Session externalSession = createExternalSession(
          session,
          externalUri,
          slotToUse.isSupportingCdp(),
          sessionRequest.getDesiredCapabilities());

        String sessionCreatedMessage = "Session created by the Node";
        LOG.info(String.format("%s. Id: %s, Caps: %s", sessionCreatedMessage, sessionId, caps));

        return Either.right(new CreateSessionResponse(
          externalSession,
          getEncoder(session.getDownstreamDialect()).apply(externalSession)));
      } else {
        slotToUse.release();
        span.setAttribute(AttributeKey.ERROR.getKey(), true);
        span.setStatus(Status.ABORTED);
        span.addEvent("Unable to create session with the driver", attributeMap);
        return Either.left(possibleSession.left());
      }
    }
  }

  @Override
  public boolean isSessionOwner(SessionId id) {
    Require.nonNull("Session ID", id);
    return currentSessions.getIfPresent(id) != null;
  }

  @Override
  public Session getSession(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    SessionSlot slot = currentSessions.getIfPresent(id);
    if (slot == null) {
      throw new NoSuchSessionException("Cannot find session with id: " + id);
    }

    return createExternalSession(
      slot.getSession(),
      externalUri,
      slot.isSupportingCdp(),
      slot.getSession().getCapabilities());
  }

  @Override
  public TemporaryFilesystem getTemporaryFilesystem(SessionId id) throws IOException {
    try {
      return tempFileSystems.get(id, () -> TemporaryFilesystem.getTmpFsBasedOn(
          TemporaryFilesystem.getDefaultTmpFS().createTempDir("session", id.toString())));
    } catch (ExecutionException e) {
      throw new IOException(e);
    }
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
  public HttpResponse uploadFile(HttpRequest req, SessionId id) {

    // When the session is running in a Docker container, the upload file command
    // needs to be forwarded to the container as well.
    SessionSlot slot = currentSessions.getIfPresent(id);
    if (slot != null && slot.getSession() instanceof DockerSession) {
      return executeWebDriverCommand(req);
    }

    Map<String, Object> incoming = JSON.toType(string(req), Json.MAP_TYPE);

    File tempDir;
    try {
      TemporaryFilesystem tempfs = getTemporaryFilesystem(id);
      tempDir = tempfs.createTempDir("upload", "file");

      Zip.unzip((String) incoming.get("file"), tempDir);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    // Select the first file
    File[] allFiles = tempDir.listFiles();
    if (allFiles == null) {
      throw new WebDriverException(
          String.format("Cannot access temporary directory for uploaded files %s", tempDir));
    }
    if (allFiles.length != 1) {
      throw new WebDriverException(
          String.format("Expected there to be only 1 file. There were: %s", allFiles.length));
    }

    ImmutableMap<String, Object> result = ImmutableMap.of(
        "value", allFiles[0].getAbsolutePath());

    return new HttpResponse().setContent(asJson(result));
  }

  @Override
  public void stop(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    SessionSlot slot = currentSessions.getIfPresent(id);
    if (slot == null) {
      throw new NoSuchSessionException("Cannot find session with id: " + id);
    }

    currentSessions.invalidate(id);
  }

  private void stopAllSessions() {
    if (currentSessions.size() > 0) {
      LOG.info("Trying to stop all running sessions before shutting down...");
      currentSessions.invalidateAll();
    }
  }

  private Session createExternalSession(ActiveSession other, URI externalUri,
                                        boolean isSupportingCdp, Capabilities requestCapabilities) {
    // We merge the session request capabilities and the session ones to keep the values sent
    // by the user in the session information
    Capabilities toUse = ImmutableCapabilities
      .copyOf(requestCapabilities.merge(other.getCapabilities()));

    // Add se:cdp if necessary to send the cdp url back
    if ((isSupportingCdp || toUse.getCapability("se:cdp") != null) && cdpEnabled) {
      String cdpPath = String.format("/session/%s/se/cdp", other.getId());
      toUse = new PersistentCapabilities(toUse).setCapability("se:cdp", rewrite(cdpPath));
    } else {
      // Remove any se:cdp* from the response, CDP is not supported nor enabled
      MutableCapabilities cdpFiltered = new MutableCapabilities();
      toUse.asMap().forEach((key, value) -> {
        if (!key.startsWith("se:cdp")) {
          cdpFiltered.setCapability(key, value);
        }
      });
      toUse = new PersistentCapabilities(cdpFiltered).setCapability("se:cdpEnabled", false);
    }

    // If enabled, set the VNC endpoint for live view
    boolean isVncEnabled = toUse.getCapability("se:vncLocalAddress") != null;
    if (isVncEnabled) {
      String vncPath = String.format("/session/%s/se/vnc", other.getId());
      toUse = new PersistentCapabilities(toUse).setCapability("se:vnc", rewrite(vncPath));
    }

    return new Session(other.getId(), externalUri, other.getStereotype(), toUse, Instant.now());
  }

  private URI rewrite(String path) {
    try {
      String scheme = "https".equals(gridUri.getScheme()) ? "wss" : "ws";
      return new URI(
        scheme,
        gridUri.getUserInfo(),
        gridUri.getHost(),
        gridUri.getPort(),
        path,
        null,
        null);
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public NodeStatus getStatus() {
    Set<Slot> slots = factories.stream()
      .map(slot -> {
        Instant lastStarted = Instant.EPOCH;
        Session session = null;
        if (!slot.isAvailable()) {
          ActiveSession activeSession = slot.getSession();
          if (activeSession != null) {
            lastStarted = activeSession.getStartTime();
            session = new Session(
              activeSession.getId(),
              activeSession.getUri(),
              slot.getStereotype(),
              activeSession.getCapabilities(),
              activeSession.getStartTime());
          }
        }

        return new Slot(
          new SlotId(getId(), slot.getId()),
          slot.getStereotype(),
          lastStarted,
          session);
      })
      .collect(toImmutableSet());

    Availability availability = isDraining() ? DRAINING : UP;

    // Check status in case this Node is a RelayNode
    Optional<SessionSlot> relaySlot = factories.stream()
      .filter(SessionSlot::hasRelayFactory)
      .findFirst();
    if (relaySlot.isPresent() && !relaySlot.get().isRelayServiceUp()) {
      availability = DOWN;
    }

    return new NodeStatus(
      getId(),
      externalUri,
      maxSessionCount,
      slots,
      availability,
      heartbeatPeriod,
      getNodeVersion(),
      getOsInfo());
  }

  @Override
  public HealthCheck getHealthCheck() {
    return healthCheck;
  }

  @Override
  public void drain() {
    bus.fire(new NodeDrainStarted(getId()));
    draining = true;
    int currentSessionCount = getCurrentSessionCount();
    if (currentSessionCount == 0) {
      LOG.info("Firing node drain complete message");
      bus.fire(new NodeDrainComplete(getId()));
    } else {
      pendingSessions.set(currentSessionCount);
    }
  }

  private void checkSessionCount() {
    if (this.drainAfterSessions.get()) {
      int remainingSessions = this.sessionCount.decrementAndGet();
      LOG.log(
        Debug.getDebugLogLevel(),
        String.format("%s remaining sessions before draining Node", remainingSessions));
      if (remainingSessions <= 0) {
        LOG.info(String.format("Draining Node, configured sessions value (%s) has been reached.",
                               this.configuredSessionCount));
        drain();
      }
    }
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
      "id", getId(),
      "uri", externalUri,
      "maxSessions", maxSessionCount,
      "draining", isDraining(),
      "capabilities", factories.stream()
        .map(SessionSlot::getStereotype)
        .collect(Collectors.toSet()));
  }

  public static class Builder {

    private final Tracer tracer;
    private final EventBus bus;
    private final URI uri;
    private final URI gridUri;
    private final Secret registrationSecret;
    private final ImmutableList.Builder<SessionSlot> factories;
    private int maxSessions = NodeOptions.DEFAULT_MAX_SESSIONS;
    private int drainAfterSessionCount = NodeOptions.DEFAULT_DRAIN_AFTER_SESSION_COUNT;
    private boolean cdpEnabled = NodeOptions.DEFAULT_ENABLE_CDP;
    private Ticker ticker = Ticker.systemTicker();
    private Duration sessionTimeout = Duration.ofSeconds(NodeOptions.DEFAULT_SESSION_TIMEOUT);
    private HealthCheck healthCheck;
    private Duration heartbeatPeriod = Duration.ofSeconds(NodeOptions.DEFAULT_HEARTBEAT_PERIOD);

    private Builder(
      Tracer tracer,
      EventBus bus,
      URI uri,
      URI gridUri,
      Secret registrationSecret) {
      this.tracer = Require.nonNull("Tracer", tracer);
      this.bus = Require.nonNull("Event bus", bus);
      this.uri = Require.nonNull("Remote node URI", uri);
      this.gridUri = Require.nonNull("Grid URI", gridUri);
      this.registrationSecret = Require.nonNull("Registration secret", registrationSecret);
      this.factories = ImmutableList.builder();
    }

    public Builder add(Capabilities stereotype, SessionFactory factory) {
      Require.nonNull("Capabilities", stereotype);
      Require.nonNull("Session factory", factory);

      factories.add(new SessionSlot(bus, stereotype, factory));

      return this;
    }

    public Builder maximumConcurrentSessions(int maxCount) {
      this.maxSessions = Require.positive("Max session count", maxCount);
      return this;
    }

    public Builder drainAfterSessionCount(int sessionCount) {
      this.drainAfterSessionCount = sessionCount;
      return this;
    }

    public Builder enableCdp(boolean cdpEnabled) {
      this.cdpEnabled = cdpEnabled;
      return this;
    }

    public Builder sessionTimeout(Duration timeout) {
      sessionTimeout = timeout;
      return this;
    }

    public Builder heartbeatPeriod(Duration heartbeatPeriod) {
      this.heartbeatPeriod = heartbeatPeriod;
      return this;
    }

    public LocalNode build() {
      return new LocalNode(
        tracer,
        bus,
        uri,
        gridUri,
        healthCheck,
        maxSessions,
        drainAfterSessionCount,
        cdpEnabled,
        ticker,
        sessionTimeout,
        heartbeatPeriod,
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
        Builder.this.healthCheck = Require.nonNull("Health check", healthCheck);
        return this;
      }

      public Node build() {
        return Builder.this.build();
      }
    }
  }
}
