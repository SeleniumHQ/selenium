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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.remote.Dialect.W3C;
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
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;
import org.openqa.selenium.support.ui.FluentWait;
import org.testcontainers.containers.GenericContainer;

class RedisBackedDistributorTest {

  @SuppressWarnings("resource")
  private GenericContainer<?> redisContainer =
      new GenericContainer<>("redis:8-alpine").withExposedPorts(6379);

  private URI redisUri;
  private Tracer tracer;
  private EventBus bus;
  private RedisBackedDistributor distributor;
  private LocalSessionMap sessions;
  private NewSessionQueue queue;
  private final Secret secret = new Secret("test-secret");
  private final Capabilities stereotype = new ImmutableCapabilities("browserName", "cheese");

  @BeforeEach
  void setUp() throws URISyntaxException {
    redisContainer.start();
    redisUri =
        new URI("redis://" + redisContainer.getHost() + ":" + redisContainer.getMappedPort(6379));

    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();

    sessions = new LocalSessionMap(tracer, bus);
    queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            Duration.ofSeconds(1),
            secret,
            5);

    distributor =
        new RedisBackedDistributor(
            tracer,
            bus,
            HttpClient.Factory.createDefault(),
            sessions,
            queue,
            new DefaultSlotSelector(),
            secret,
            Duration.ofSeconds(120),
            false,
            Duration.ofMillis(10),
            Runtime.getRuntime().availableProcessors(),
            new DefaultSlotMatcher(),
            Duration.ofSeconds(30),
            redisUri);

    new FluentWait<>(bus).withTimeout(Duration.ofSeconds(5)).until(HasReadyState::isReady);
  }

  @AfterEach
  void tearDown() {
    safelyCall(() -> distributor.close());
    safelyCall(() -> bus.close());
    safelyCall(() -> redisContainer.stop());
  }

  private URI createUri() {
    try {
      return new URI("http://localhost:" + PortProber.findFreePort());
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  private Node createNode(Capabilities nodeCaps) {
    URI uri = createUri();
    LocalNode.Builder builder = LocalNode.builder(tracer, bus, uri, uri, secret);
    builder.add(nodeCaps, new TestSessionFactory((id, caps) -> new HandledSession(uri, caps)));
    builder.maximumConcurrentSessions(12);
    return builder.build();
  }

  private Node createSingleSlotNode(Capabilities nodeCaps) {
    URI uri = createUri();
    LocalNode.Builder builder = LocalNode.builder(tracer, bus, uri, uri, secret);
    builder.add(nodeCaps, new TestSessionFactory((id, caps) -> new HandledSession(uri, caps)));
    builder.maximumConcurrentSessions(1);
    return builder.build();
  }

  private Node createFailingNode(Capabilities nodeCaps, AtomicInteger attempts) {
    URI uri = createUri();
    LocalNode.Builder builder = LocalNode.builder(tracer, bus, uri, uri, secret);
    builder.add(
        nodeCaps,
        new TestSessionFactory(
            (id, caps) -> {
              attempts.incrementAndGet();
              throw new SessionNotCreatedException("intentional failure");
            }));
    builder.maximumConcurrentSessions(1);
    return builder.build();
  }

  private SessionRequest createRequest(Capabilities caps) {
    return new SessionRequest(
        new RequestId(UUID.randomUUID()),
        Instant.now(),
        Set.of(W3C),
        Set.of(caps),
        Map.of(),
        Map.of());
  }

  @Test
  void isReadyWhenRedisAndBusAreAvailable() {
    assertThat(distributor.isReady()).isTrue();
  }

  @Test
  void distributorStartsWithNoNodes() {
    assertThat(distributor.getStatus().getNodes()).isEmpty();
  }

  @Test
  void addNodeAppearsInStatus() {
    Node node = createNode(stereotype);
    distributor.add(node);

    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(10))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> !d.getStatus().getNodes().isEmpty());

    assertThat(distributor.getStatus().getNodes()).hasSize(1);
  }

  @Test
  void canCreateSessionWhenNodeIsAvailable() {
    Node node = createNode(stereotype);
    distributor.add(node);

    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(30))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> d.getStatus().hasCapacity());

    Either<?, ?> result = distributor.newSession(createRequest(stereotype));
    assertThat(result.isRight()).isTrue();
  }

  @Test
  void queuePollingCreatesQueuedSessionRequests() throws Exception {
    Node node = createNode(stereotype);
    distributor.add(node);

    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(30))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> d.getStatus().hasCapacity());

    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      Future<HttpResponse> response =
          executor.submit(() -> queue.addToQueue(createRequest(stereotype)));

      assertThat(response.get(5, TimeUnit.SECONDS).isSuccessful()).isTrue();
      assertThat(queue.peekEmpty()).isTrue();
    } finally {
      executor.shutdownNow();
    }
  }

  @Test
  void failedSessionCreationClearsRedisReservation() {
    AtomicInteger attempts = new AtomicInteger();
    Node node = createFailingNode(stereotype, attempts);
    distributor.add(node);

    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(30))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> d.getStatus().hasCapacity());

    Either<?, ?> first = distributor.newSession(createRequest(stereotype));
    Either<?, ?> second = distributor.newSession(createRequest(stereotype));

    assertThat(first.isLeft()).isTrue();
    assertThat(second.isLeft()).isTrue();
    assertThat(attempts.get()).isEqualTo(2);
  }

  @Test
  void concurrentReplicasOnlyCreateOneSessionForSingleRedisSlot() throws Exception {
    Node node = createSingleSlotNode(stereotype);
    RedisBackedDistributor secondDistributor =
        new RedisBackedDistributor(
            tracer,
            bus,
            HttpClient.Factory.createDefault(),
            new LocalSessionMap(tracer, bus),
            new LocalNewSessionQueue(
                tracer,
                new DefaultSlotMatcher(),
                Duration.ofSeconds(2),
                Duration.ofSeconds(2),
                Duration.ofSeconds(1),
                secret,
                5),
            new DefaultSlotSelector(),
            secret,
            Duration.ofSeconds(120),
            false,
            Duration.ofMillis(10),
            Runtime.getRuntime().availableProcessors(),
            new DefaultSlotMatcher(),
            Duration.ofSeconds(30),
            redisUri);
    try {
      distributor.add(node);
      secondDistributor.add(node);

      new FluentWait<>(distributor)
          .withTimeout(Duration.ofSeconds(30))
          .pollingEvery(Duration.ofMillis(100))
          .until(d -> d.getStatus().hasCapacity());

      ExecutorService executor = Executors.newFixedThreadPool(2);
      try {
        Future<Either<?, ?>> first =
            executor.submit(() -> distributor.newSession(createRequest(stereotype)));
        Future<Either<?, ?>> second =
            executor.submit(() -> secondDistributor.newSession(createRequest(stereotype)));

        long successfulSessions =
            Set.of(first.get(), second.get()).stream().filter(Either::isRight).count();

        assertThat(successfulSessions).isEqualTo(1);
      } finally {
        executor.shutdownNow();
      }
    } finally {
      secondDistributor.close();
    }
  }

  @Test
  void secondReplicaSeesSessionCreatedByFirstReplica() {
    Node node = createNode(stereotype);
    RedisBackedDistributor secondDistributor =
        new RedisBackedDistributor(
            tracer,
            bus,
            HttpClient.Factory.createDefault(),
            new LocalSessionMap(tracer, bus),
            new LocalNewSessionQueue(
                tracer,
                new DefaultSlotMatcher(),
                Duration.ofSeconds(2),
                Duration.ofSeconds(2),
                Duration.ofSeconds(1),
                secret,
                5),
            new DefaultSlotSelector(),
            secret,
            Duration.ofSeconds(120),
            false,
            Duration.ofMillis(10),
            Runtime.getRuntime().availableProcessors(),
            new DefaultSlotMatcher(),
            Duration.ofSeconds(30),
            redisUri);
    try {
      distributor.add(node);
      secondDistributor.add(node);

      new FluentWait<>(distributor)
          .withTimeout(Duration.ofSeconds(30))
          .pollingEvery(Duration.ofMillis(100))
          .until(d -> d.getStatus().hasCapacity());

      Either<?, ?> result = distributor.newSession(createRequest(stereotype));
      assertThat(result.isRight()).isTrue();

      assertThat(
              secondDistributor.getStatus().getNodes().stream()
                  .flatMap(status -> status.getSlots().stream())
                  .filter(slot -> slot.getSession() != null)
                  .count())
          .isEqualTo(1);
    } finally {
      secondDistributor.close();
    }
  }

  @Test
  void drainNodePreventsNewSessions() {
    Node node = createNode(stereotype);
    distributor.add(node);

    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(30))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> d.getStatus().hasCapacity());

    distributor.drain(node.getId());

    // After draining a node with no active sessions it is removed from the grid immediately.
    // DistributorStatus.hasCapacity() only counts UP nodes, so this goes false when gone.
    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(30))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> !d.getStatus().hasCapacity());

    Either<?, ?> result = distributor.newSession(createRequest(stereotype));
    assertThat(result.isLeft()).isTrue();
  }

  @Test
  void removeNodeDisappearsFromStatus() {
    Node node = createNode(stereotype);
    distributor.add(node);

    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(10))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> !d.getStatus().getNodes().isEmpty());

    distributor.remove(node.getId());

    new FluentWait<>(distributor)
        .withTimeout(Duration.ofSeconds(10))
        .pollingEvery(Duration.ofMillis(100))
        .until(d -> d.getStatus().getNodes().isEmpty());

    assertThat(distributor.getStatus().getNodes()).isEmpty();
  }

  @Test
  void createRequiresBackendUrlWhenRedisDistributorIsConfigured() {
    Map<String, Object> rawConfig =
        Map.of(
            "events",
            Map.of("implementation", GuavaEventBus.class.getName()),
            "sessions",
            Map.of("implementation", LocalSessionMap.class.getName()),
            "sessionqueue",
            Map.of("implementation", LocalNewSessionQueue.class.getName()),
            "distributor",
            Map.of(
                "implementation",
                RedisBackedDistributor.class.getName(),
                "healthcheck-interval",
                10,
                "purge-nodes-interval",
                0));

    assertThatThrownBy(() -> RedisBackedDistributor.create(new MapConfig(rawConfig)))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("backend-url");
  }

  @Test
  void createRejectsInvalidBackendUrl() {
    Map<String, Object> rawConfig =
        Map.of(
            "events",
            Map.of("implementation", GuavaEventBus.class.getName()),
            "sessions",
            Map.of("implementation", LocalSessionMap.class.getName()),
            "sessionqueue",
            Map.of("implementation", LocalNewSessionQueue.class.getName()),
            "distributor",
            Map.of(
                "implementation",
                RedisBackedDistributor.class.getName(),
                "backend-url",
                "not a uri",
                "healthcheck-interval",
                10,
                "purge-nodes-interval",
                0));

    assertThatThrownBy(() -> RedisBackedDistributor.create(new MapConfig(rawConfig)))
        .isInstanceOf(ConfigException.class)
        .hasMessageContaining("backend-url");
  }

  @Test
  void createUsesConfiguredBackendUrl() {
    Map<String, Object> rawConfig =
        Map.of(
            "events",
            Map.of("implementation", GuavaEventBus.class.getName()),
            "sessions",
            Map.of("implementation", LocalSessionMap.class.getName()),
            "sessionqueue",
            Map.of(
                "implementation",
                LocalNewSessionQueue.class.getName(),
                "session-request-timeout",
                2,
                "session-request-timeout-period",
                1),
            "distributor",
            Map.of(
                "implementation",
                RedisBackedDistributor.class.getName(),
                "backend-url",
                redisUri.toString(),
                "healthcheck-interval",
                10,
                "purge-nodes-interval",
                0));

    Distributor created = RedisBackedDistributor.create(new MapConfig(rawConfig));
    try {
      assertThat(created.isReady()).isTrue();
    } finally {
      safelyCall(() -> ((RedisBackedDistributor) created).close());
    }
  }

  private class HandledSession extends Session implements HttpHandler {
    HandledSession(URI uri, Capabilities caps) {
      super(new SessionId(UUID.randomUUID()), uri, stereotype, caps, Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) {
      return new HttpResponse();
    }
  }
}
