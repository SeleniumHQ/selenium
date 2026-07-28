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

package org.openqa.selenium.grid.distributor.local;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.data.Availability.UP;

import java.lang.reflect.Field;
import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class LocalNodeRegistryTest {

  private final Secret registrationSecret = new Secret("bavarian smoked");
  private Tracer tracer;
  private EventBus bus;
  private ScheduledExecutorService nodeHealthCheckService;
  private ScheduledExecutorService purgeDeadNodesService;
  private LocalNodeRegistry registry;

  @BeforeEach
  void setUp() {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    nodeHealthCheckService = Executors.newSingleThreadScheduledExecutor();
    purgeDeadNodesService = Executors.newSingleThreadScheduledExecutor();
    registry =
        new LocalNodeRegistry(
            tracer,
            bus,
            config -> {
              throw new UnsupportedOperationException("Not used by this test");
            },
            registrationSecret,
            Duration.ofHours(1),
            nodeHealthCheckService,
            Duration.ZERO,
            purgeDeadNodesService);
  }

  @AfterEach
  @SuppressWarnings("ConstantValue")
  void tearDown() {
    if (registry != null) {
      registry.close();
    }
    if (nodeHealthCheckService != null) {
      nodeHealthCheckService.shutdownNow();
    }
    if (purgeDeadNodesService != null) {
      purgeDeadNodesService.shutdownNow();
    }
    if (bus != null) {
      bus.close();
    }
  }

  @Test
  void shouldNotRunOverlappingHealthChecks() throws Exception {
    AtomicInteger checksRun = new AtomicInteger(0);
    CountDownLatch checkStarted = new CountDownLatch(1);
    CountDownLatch releaseCheck = new CountDownLatch(1);
    NodeId nodeId = new NodeId(UUID.randomUUID());

    Node node =
        new TestNode(
            tracer,
            nodeId,
            URI.create("http://example:4444"),
            registrationSecret,
            () -> {
              checksRun.incrementAndGet();
              checkStarted.countDown();
              try {
                releaseCheck.await(2, TimeUnit.SECONDS);
              } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
              }
              return new HealthCheck.Result(UP, "ok");
            });
    registry.add(node);

    ExecutorService runner = Executors.newSingleThreadExecutor();
    try {
      Future<?> firstRun = runner.submit(registry::runHealthChecks);

      assertThat(checkStarted.await(2, TimeUnit.SECONDS)).isTrue();
      registry.runHealthChecks();
      assertThat(checksRun.get()).isEqualTo(1);

      releaseCheck.countDown();
      firstRun.get(2, TimeUnit.SECONDS);
    } finally {
      runner.shutdownNow();
    }
  }

  @Test
  void shouldRunHealthChecksForMultipleNodesConcurrently() throws Exception {
    // Each check parks on a shared latch to prove that all 3 run concurrently — one thread
    // per node via the cached pool — rather than queuing behind a fixed-size pool.
    int nodeCount = 3;
    CountDownLatch allStarted = new CountDownLatch(nodeCount);
    CountDownLatch releaseAll = new CountDownLatch(1);

    for (int i = 0; i < nodeCount; i++) {
      NodeId nodeId = new NodeId(UUID.randomUUID());
      Node node =
          new TestNode(
              tracer,
              nodeId,
              URI.create("http://example" + i + ":4444"),
              registrationSecret,
              () -> {
                allStarted.countDown();
                try {
                  // Block until all checks have started, confirming concurrent execution.
                  assertThat(releaseAll.await(5, TimeUnit.SECONDS)).isTrue();
                } catch (InterruptedException e) {
                  Thread.currentThread().interrupt();
                }
                return new HealthCheck.Result(UP, "ok");
              });
      registry.add(node);
    }

    ExecutorService runner = Executors.newSingleThreadExecutor();
    try {
      Future<?> healthCheckFuture = runner.submit(registry::runHealthChecks);

      // All 3 checks must start before any single one finishes — proving concurrent execution.
      assertThat(allStarted.await(5, TimeUnit.SECONDS)).isTrue();

      releaseAll.countDown();
      healthCheckFuture.get(5, TimeUnit.SECONDS);
    } finally {
      runner.shutdownNow();
    }
  }

  @Test
  void addLogsAtWarningWhenNodeStatusThrows() {
    // An exception here aborts registration entirely (see the catch block in add()) -- that's an
    // actionable failure, not routine diagnostics, so it must be visible at WARNING by default.
    NodeId nodeId = new NodeId(UUID.randomUUID());
    RuntimeException statusFailure = new RuntimeException("node heartbeat started before ready");
    Node node =
        new TestNode(
            tracer,
            nodeId,
            URI.create("http://example:4444"),
            registrationSecret,
            () -> {
              throw new AssertionError("health check must not run for a node that failed add()");
            }) {
          @Override
          public NodeStatus getStatus() {
            throw statusFailure;
          }
        };

    Logger log = Logger.getLogger(LocalNodeRegistry.class.getName());
    List<LogRecord> records = new ArrayList<>();
    Handler capture =
        new Handler() {
          @Override
          public void publish(LogRecord record) {
            records.add(record);
          }

          @Override
          public void flush() {}

          @Override
          public void close() {}
        };
    capture.setLevel(Level.ALL);
    Level oldLevel = log.getLevel();
    log.setLevel(Level.ALL);
    log.addHandler(capture);
    try {
      registry.add(node);

      assertThat(records).hasSize(1);
      assertThat(records.get(0).getLevel()).isEqualTo(Level.WARNING);
      assertThat(records.get(0).getThrown()).isSameAs(statusFailure);
    } finally {
      log.removeHandler(capture);
      log.setLevel(oldLevel);
    }
  }

  @Test
  void closeShouldShutdownNodeHealthCheckWorkerPool() throws Exception {
    ExecutorService nodeHealthCheckExecutor = getNodeHealthCheckExecutor(registry);
    assertThat(nodeHealthCheckExecutor.isShutdown()).isFalse();

    registry.close();

    assertThat(nodeHealthCheckExecutor.isShutdown()).isTrue();
  }

  private static ExecutorService getNodeHealthCheckExecutor(LocalNodeRegistry registry)
      throws NoSuchFieldException, IllegalAccessException {
    Field field = LocalNodeRegistry.class.getDeclaredField("nodeHealthCheckExecutor");
    field.setAccessible(true);
    return (ExecutorService) field.get(registry);
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
