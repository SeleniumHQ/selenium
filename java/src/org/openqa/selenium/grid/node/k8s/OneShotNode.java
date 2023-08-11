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

package org.openqa.selenium.grid.node.k8s;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.DELETE;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.lang.reflect.Field;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.StreamSupport;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.PersistentCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeDrainComplete;
import org.openqa.selenium.grid.data.NodeDrainStarted;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.jmx.JMXHelper;
import org.openqa.selenium.grid.jmx.ManagedAttribute;
import org.openqa.selenium.grid.jmx.ManagedService;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.Tracer;

/**
 * An implementation of {@link Node} that marks itself as draining immediately after starting, and
 * which then shuts down after usage. This will allow an appropriately configured Kubernetes cluster
 * to start a new node once the session is finished.
 */
@ManagedService(
    objectName = "org.seleniumhq.grid:type=Node,name=OneShotNode",
    description = "Node for running a single webdriver session.")
public class OneShotNode extends Node {

  private static final Logger LOG = Logger.getLogger(OneShotNode.class.getName());
  private static final Json JSON = new Json();

  private final EventBus events;
  private final WebDriverInfo driverInfo;
  private final Capabilities stereotype;
  private final Duration heartbeatPeriod;
  private final URI gridUri;
  private final UUID slotId = UUID.randomUUID();
  private RemoteWebDriver driver;
  private SessionId sessionId;
  private HttpClient client;
  private Capabilities capabilities;
  private Instant sessionStart = Instant.EPOCH;

  private OneShotNode(
      Tracer tracer,
      EventBus events,
      Secret registrationSecret,
      Duration heartbeatPeriod,
      NodeId id,
      URI uri,
      URI gridUri,
      Capabilities stereotype,
      WebDriverInfo driverInfo) {
    super(tracer, id, uri, registrationSecret);

    this.heartbeatPeriod = heartbeatPeriod;
    this.events = Require.nonNull("Event bus", events);
    this.gridUri = Require.nonNull("Public Grid URI", gridUri);
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.driverInfo = Require.nonNull("Driver info", driverInfo);

    new JMXHelper().register(this);
  }

  public static Node create(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    EventBusOptions eventOptions = new EventBusOptions(config);
    BaseServerOptions serverOptions = new BaseServerOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);
    NodeOptions nodeOptions = new NodeOptions(config);

    Map<String, Object> raw =
        new Json()
            .toType(
                config
                    .get("k8s", "stereotype")
                    .orElseThrow(() -> new ConfigException("Unable to find node stereotype")),
                MAP_TYPE);

    Capabilities stereotype = new ImmutableCapabilities(raw);

    Optional<String> driverName = config.get("k8s", "driver_name").map(String::toLowerCase);

    // Find the webdriver info corresponding to the driver name
    WebDriverInfo driverInfo =
        StreamSupport.stream(ServiceLoader.load(WebDriverInfo.class).spliterator(), false)
            .filter(info -> info.isSupporting(stereotype))
            .filter(
                info ->
                    driverName
                        .map(name -> name.equals(info.getDisplayName().toLowerCase()))
                        .orElse(true))
            .findFirst()
            .orElseThrow(
                () ->
                    new ConfigException(
                        "Unable to find matching driver for %s and %s",
                        stereotype, driverName.orElse("any driver")));

    LOG.info(
        String.format("Creating one-shot node for %s with stereotype %s", driverInfo, stereotype));
    LOG.info("Grid URI is: " + nodeOptions.getPublicGridUri());

    return new OneShotNode(
        loggingOptions.getTracer(),
        eventOptions.getEventBus(),
        secretOptions.getRegistrationSecret(),
        nodeOptions.getHeartbeatPeriod(),
        new NodeId(UUID.randomUUID()),
        serverOptions.getExternalUri(),
        nodeOptions
            .getPublicGridUri()
            .orElseThrow(() -> new ConfigException("Unable to determine public grid address")),
        stereotype,
        driverInfo);
  }

  @Override
  public Either<WebDriverException, CreateSessionResponse> newSession(
      CreateSessionRequest sessionRequest) {
    if (driver != null) {
      throw new IllegalStateException("Only expected one session at a time");
    }

    Optional<WebDriver> driver = driverInfo.createDriver(sessionRequest.getDesiredCapabilities());
    if (!driver.isPresent()) {
      return Either.left(new WebDriverException("Unable to create a driver instance"));
    }

    if (!(driver.get() instanceof RemoteWebDriver)) {
      driver.get().quit();
      return Either.left(new WebDriverException("Driver is not a RemoteWebDriver instance"));
    }

    this.driver = (RemoteWebDriver) driver.get();
    this.sessionId = this.driver.getSessionId();
    this.client = extractHttpClient(this.driver);
    this.capabilities = rewriteCapabilities(this.driver);
    this.sessionStart = Instant.now();

    LOG.info(
        "Encoded response: "
            + JSON.toJson(
                ImmutableMap.of(
                    "value",
                    ImmutableMap.of(
                        "sessionId", sessionId,
                        "capabilities", capabilities))));

    events.fire(new NodeDrainStarted(getId()));

    return Either.right(
        new CreateSessionResponse(
            getSession(sessionId),
            JSON.toJson(
                    ImmutableMap.of(
                        "value",
                        ImmutableMap.of(
                            "sessionId", sessionId,
                            "capabilities", capabilities)))
                .getBytes(UTF_8)));
  }

  private HttpClient extractHttpClient(RemoteWebDriver driver) {
    CommandExecutor executor = driver.getCommandExecutor();

    try {
      Field client = null;
      Class<?> current = executor.getClass();
      while (client == null && (current != null || Object.class.equals(current))) {
        client = findClientField(current);
        current = current.getSuperclass();
      }

      if (client == null) {
        throw new IllegalStateException("Unable to find client field in " + executor.getClass());
      }

      if (!HttpClient.class.isAssignableFrom(client.getType())) {
        throw new IllegalStateException("Client field is not assignable to http client");
      }
      client.setAccessible(true);
      return (HttpClient) client.get(executor);
    } catch (ReflectiveOperationException e) {
      throw new IllegalStateException(e);
    }
  }

  private Field findClientField(Class<?> clazz) {
    try {
      return clazz.getDeclaredField("client");
    } catch (NoSuchFieldException e) {
      return null;
    }
  }

  private Capabilities rewriteCapabilities(RemoteWebDriver driver) {
    // Rewrite the se:options if necessary to add cdp url
    if (driverInfo.isSupportingCdp()) {
      String cdpPath = String.format("/session/%s/se/cdp", driver.getSessionId());
      return new PersistentCapabilities(driver.getCapabilities())
          .setCapability("se:cdp", rewrite(cdpPath));
    }

    return ImmutableCapabilities.copyOf(driver.getCapabilities());
  }

  private URI rewrite(String path) {
    try {
      return new URI(
          gridUri.getScheme(),
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
  public HttpResponse executeWebDriverCommand(HttpRequest req) {
    LOG.info("Executing " + req);

    HttpResponse res = client.execute(req);

    if (DELETE.equals(req.getMethod()) && req.getUri().equals("/session/" + sessionId)) {
      // Ensure the response is sent before we viciously kill the node

      new Thread(
              () -> {
                try {
                  Thread.sleep(500);
                } catch (InterruptedException e) {
                  Thread.currentThread().interrupt();
                  throw new RuntimeException(e);
                }
                LOG.info("Stopping session: " + sessionId);
                stop(sessionId);
              },
              "Node clean up: " + getId())
          .start();
    }

    return res;
  }

  @Override
  public Session getSession(SessionId id) throws NoSuchSessionException {
    if (!isSessionOwner(id)) {
      throw new NoSuchSessionException("Unable to find session with id: " + id);
    }

    return new Session(sessionId, getUri(), stereotype, capabilities, sessionStart);
  }

  @Override
  public HttpResponse uploadFile(HttpRequest req, SessionId id) {
    return null;
  }

  @Override
  public HttpResponse downloadFile(HttpRequest req, SessionId id) {
    return null;
  }

  @Override
  public void stop(SessionId id) throws NoSuchSessionException {
    LOG.info("Stop has been called: " + id);
    Require.nonNull("Session ID", id);

    if (!isSessionOwner(id)) {
      throw new NoSuchSessionException("Unable to find session " + id);
    }

    LOG.info("Quitting session " + id);
    try {
      driver.quit();
    } catch (Exception e) {
      // It's possible that the driver has already quit.
    }

    events.fire(new SessionClosedEvent(id));
    LOG.info("Firing node drain complete message");
    events.fire(new NodeDrainComplete(getId()));
  }

  @Override
  public boolean isSessionOwner(SessionId id) {
    return driver != null && sessionId.equals(id);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return driverInfo.isSupporting(capabilities);
  }

  @Override
  public NodeStatus getStatus() {
    return new NodeStatus(
        getId(),
        getUri(),
        1,
        ImmutableSet.of(
            new Slot(
                new SlotId(getId(), slotId),
                stereotype,
                Instant.EPOCH,
                driver == null
                    ? null
                    : new Session(sessionId, getUri(), stereotype, capabilities, Instant.now()))),
        isDraining() ? DRAINING : UP,
        heartbeatPeriod,
        getNodeVersion(),
        getOsInfo());
  }

  @Override
  public void drain() {
    events.fire(new NodeDrainStarted(getId()));
    draining = true;
  }

  @Override
  public HealthCheck getHealthCheck() {
    return () -> new HealthCheck.Result(isDraining() ? DRAINING : UP, "Everything is fine");
  }

  @Override
  public boolean isReady() {
    return events.isReady();
  }

  @ManagedAttribute(name = "MaxSessions")
  public int getMaxSessionCount() {
    return 1;
  }

  @ManagedAttribute(name = "Status")
  public Availability getAvailability() {
    return isDraining() ? DRAINING : UP;
  }

  @ManagedAttribute(name = "TotalSlots")
  public int getTotalSlots() {
    return 1;
  }

  @ManagedAttribute(name = "UsedSlots")
  public long getUsedSlots() {
    return client == null ? 0 : 1;
  }

  @ManagedAttribute(name = "Load")
  public float getLoad() {
    return client == null ? 0f : 100f;
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
}
