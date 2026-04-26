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
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import redis.embedded.RedisServer;

class RedisBackedNodeRegistryTest {

  private RedisServer server;
  private GridRedisClient redis;
  private EventBus bus;
  private RedisBackedNodeRegistry registry;
  private Tracer tracer;
  private URI redisUri;
  private final Secret secret = new Secret("test-secret");

  @BeforeEach
  void setUp() throws URISyntaxException {
    int port = PortProber.findFreePort();
    redisUri = new URI("redis://localhost:" + port);
    server = RedisServer.builder().port(port).build();
    server.start();
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
    safelyCall(() -> server.stop());
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
        .withTimeout(Duration.ofSeconds(5))
        .pollingEvery(Duration.ofMillis(100))
        .until(r -> !r.getStatus().getNodes().isEmpty());

    // After registration, the model should have the node (as DOWN initially).
    String raw = redis.get("grid:node:" + id + ":status");
    assertThat(raw).isNotNull();
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
}
