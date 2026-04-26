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

package org.openqa.selenium.grid.distributor.redis;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.testcontainers.containers.GenericContainer;

class RedisBackedNodeRegistryTest {

  @SuppressWarnings("resource")
  private GenericContainer<?> redisContainer =
      new GenericContainer<>("redis:8-alpine").withExposedPorts(6379);

  private GridRedisClient redis;
  private EventBus bus;
  private RedisBackedNodeRegistry registry;
  private Tracer tracer;
  private URI redisUri;
  private final Secret secret = new Secret("test-secret");

  @BeforeEach
  void setUp() throws URISyntaxException {
    redisContainer.start();
    redisUri =
        new URI("redis://" + redisContainer.getHost() + ":" + redisContainer.getMappedPort(6379));
    redis = new GridRedisClient(redisUri);
    bus = new GuavaEventBus();
    tracer = DefaultTestTracer.createTracer();
    registry = makeRegistry();
  }

  private RedisBackedNodeRegistry makeRegistry() {
    return new RedisBackedNodeRegistry(
        tracer,
        bus,
        HttpClient.Factory.createDefault(),
        secret,
        Duration.ofSeconds(30),
        Executors.newSingleThreadScheduledExecutor(),
        Duration.ofSeconds(0),
        Executors.newSingleThreadScheduledExecutor(),
        redis);
  }

  @AfterEach
  void tearDown() {
    safelyCall(() -> registry.close());
    safelyCall(() -> redis.close());
    safelyCall(() -> redisContainer.stop());
    safelyCall(() -> bus.close());
  }

  private NodeStatus makeNodeStatus(NodeId id, URI uri, Availability availability) {
    ImmutableCapabilities caps = new ImmutableCapabilities("browserName", "chrome");
    SlotId slotId = new SlotId(id, UUID.randomUUID());
    Slot slot = new Slot(slotId, caps, Instant.now(), null);
    return new NodeStatus(
        id,
        uri,
        5,
        Set.of(slot),
        availability,
        Duration.ofSeconds(30),
        Duration.ofMinutes(5),
        "4.0",
        java.util.Map.of());
  }

  private URI uri(int port) {
    try {
      return new URI("http://localhost:" + port);
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  @Test
  void registryStartsEmpty() {
    DistributorStatus status = registry.getStatus();
    assertThat(status.getNodes()).isEmpty();
  }

  @Test
  void registerNodeFromEventBusEventStoresInRedis() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus status = makeNodeStatus(id, uri(PortProber.findFreePort()), UP);

    registry.register(status);

    // Give Redis and event bus a moment to process.
    new FluentWait<>(registry)
        .withTimeout(Duration.ofSeconds(30))
        .pollingEvery(Duration.ofMillis(100))
        .until(r -> !r.getStatus().getNodes().isEmpty());

    // After registration, the model should have the node (as DOWN initially).
    String raw = redis.get("grid:node:" + id + ":status");
    assertThat(raw).isNotNull();
  }

  @Test
  void registryReconstructsLocalNodeProxyFromRedisOnStartup() {
    safelyCall(() -> registry.close());
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus status = makeNodeStatus(id, uri(PortProber.findFreePort()), UP);
    RedisBackedGridModel model = new RedisBackedGridModel(redis, bus);
    model.add(status);
    model.setAvailability(id, UP);

    RedisBackedNodeRegistry reconstructed = makeRegistry();
    try {
      assertThat(reconstructed.getNode(id)).isNotNull();
      assertThat(reconstructed.getUpNodes()).extracting(NodeStatus::getNodeId).contains(id);
    } finally {
      safelyCall(() -> reconstructed.close());
    }
  }

  @Test
  void healthChecksForSameNodeRunOnceAcrossReplicas() throws Exception {
    AtomicInteger healthChecks = new AtomicInteger();
    NodeId id = new NodeId(UUID.randomUUID());
    TestNode node =
        new TestNode(
            tracer,
            id,
            uri(PortProber.findFreePort()),
            secret,
            () -> {
              healthChecks.incrementAndGet();
              return new HealthCheck.Result(UP, "ok");
            });
    RedisBackedNodeRegistry secondRegistry = makeRegistry();
    try {
      registry.add(node);
      secondRegistry.add(node);

      ExecutorService executor = Executors.newFixedThreadPool(2);
      try {
        Future<?> first = executor.submit(registry::runHealthChecks);
        Future<?> second = executor.submit(secondRegistry::runHealthChecks);
        first.get();
        second.get();
      } finally {
        executor.shutdownNow();
      }

      assertThat(healthChecks.get()).isEqualTo(1);
    } finally {
      safelyCall(() -> secondRegistry.close());
    }
  }

  @Test
  void upNodeCountReflectsRedisState() {
    NodeId id1 = new NodeId(UUID.randomUUID());
    NodeId id2 = new NodeId(UUID.randomUUID());
    // Manually seed Redis to simulate a restarted replica reading existing state.
    redis.addNodeAvailability(UP, makeNodeStatus(id1, uri(5001), UP));
    redis.addNodeAvailability(UP, makeNodeStatus(id2, uri(5002), UP));

    long count = redis.getNodesByAvailability(UP).size();
    assertThat(count).isEqualTo(2);
  }

  @Test
  void downNodeCountReflectsRedisState() {
    NodeId id = new NodeId(UUID.randomUUID());
    redis.addNodeAvailability(DOWN, makeNodeStatus(id, uri(5003), DOWN));

    long count = redis.getNodesByAvailability(DOWN).size();
    assertThat(count).isEqualTo(1);
  }

  @Test
  void isReadyReturnsTrueWhenBusIsReady() {
    assertThat(registry.isReady()).isTrue();
  }

  private static class TestNode extends Node {

    private final NodeStatus status;
    private final HealthCheck healthCheck;

    TestNode(
        Tracer tracer, NodeId nodeId, URI uri, Secret registrationSecret, HealthCheck healthCheck) {
      super(tracer, nodeId, uri, registrationSecret, Duration.ofSeconds(5));
      this.healthCheck = healthCheck;
      this.status =
          new NodeStatus(
              nodeId,
              uri,
              1,
              Set.of(),
              UP,
              Duration.ofSeconds(5),
              Duration.ofSeconds(5),
              "test",
              Map.of("name", "test", "arch", "test", "version", "test"));
    }

    @Override
    public Either<WebDriverException, CreateSessionResponse> newSession(
        CreateSessionRequest sessionRequest) {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse executeWebDriverCommand(HttpRequest req) {
      throw new UnsupportedOperationException();
    }

    @Override
    public Session getSession(SessionId id) throws NoSuchSessionException {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse uploadFile(HttpRequest req, SessionId id) {
      throw new UnsupportedOperationException();
    }

    @Override
    public HttpResponse downloadFile(HttpRequest req, SessionId id) {
      throw new UnsupportedOperationException();
    }

    @Override
    public void stop(SessionId id) throws NoSuchSessionException {
      throw new UnsupportedOperationException();
    }

    @Override
    public boolean isSessionOwner(SessionId id) {
      return false;
    }

    @Override
    public boolean tryAcquireConnection(SessionId id) {
      return false;
    }

    @Override
    public void releaseConnection(SessionId id) {}

    @Override
    public boolean isSupporting(Capabilities capabilities) {
      return true;
    }

    @Override
    public NodeStatus getStatus() {
      return status;
    }

    @Override
    public HealthCheck getHealthCheck() {
      return healthCheck;
    }

    @Override
    public void drain() {
      draining.set(true);
    }

    @Override
    public boolean isReady() {
      return true;
    }
  }
}
