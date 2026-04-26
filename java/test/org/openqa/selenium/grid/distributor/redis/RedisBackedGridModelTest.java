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
import static org.assertj.core.api.Assertions.tuple;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.SessionId;
import org.testcontainers.containers.GenericContainer;

class RedisBackedGridModelTest {

  @SuppressWarnings("resource")
  private GenericContainer<?> redisContainer =
      new GenericContainer<>("redis:8-alpine").withExposedPorts(6379);

  private GridRedisClient redis;
  private EventBus bus;
  private RedisBackedGridModel model;
  private URI redisUri;

  @BeforeEach
  void setUp() throws URISyntaxException {
    redisContainer.start();
    redisUri =
        new URI("redis://" + redisContainer.getHost() + ":" + redisContainer.getMappedPort(6379));
    redis = new GridRedisClient(redisUri);
    bus = new GuavaEventBus();
    model = new RedisBackedGridModel(redis, bus);
  }

  @AfterEach
  void tearDown() {
    safelyCall(() -> redis.close());
    safelyCall(() -> redisContainer.stop());
    safelyCall(() -> bus.close());
  }

  // ---- Helpers ---------------------------------------------------------------

  private NodeStatus makeNode(NodeId id, URI uri) {
    ImmutableCapabilities caps = new ImmutableCapabilities("browserName", "chrome");
    SlotId slotId = new SlotId(id, UUID.randomUUID());
    Slot slot = new Slot(slotId, caps, Instant.now(), null);
    return new NodeStatus(
        id,
        uri,
        5,
        Set.of(slot),
        UP,
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

  // ---- Tests -----------------------------------------------------------------

  @Test
  void addNodeStartsAsDown() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));

    model.add(node);

    Set<NodeStatus> snapshot = model.getSnapshot();
    assertThat(snapshot).hasSize(1);
    assertThat(snapshot.iterator().next().getAvailability()).isEqualTo(DOWN);
  }

  @Test
  void setAvailabilityChangesNodeState() {
    NodeId id = new NodeId(UUID.randomUUID());
    model.add(makeNode(id, uri(5678)));

    model.setAvailability(id, UP);

    NodeStatus found =
        model.getSnapshot().stream()
            .filter(n -> n.getNodeId().equals(id))
            .findFirst()
            .orElseThrow();
    assertThat(found.getAvailability()).isEqualTo(UP);
  }

  @Test
  void removeNodeClearsFromSnapshot() {
    NodeId id = new NodeId(UUID.randomUUID());
    model.add(makeNode(id, uri(5678)));
    model.setAvailability(id, UP);
    assertThat(model.getSnapshot()).hasSize(1);

    model.remove(id);

    assertThat(model.getSnapshot()).isEmpty();
  }

  @Test
  void purgeDeadNodesRemovesNodesAfterUnhealthyThreshold() {
    NodeId id = new NodeId(UUID.randomUUID());
    model.add(makeNode(id, uri(5678)));
    model.setAvailability(id, UP);

    model.updateHealthCheckCount(id, DOWN);
    model.updateHealthCheckCount(id, DOWN);
    model.updateHealthCheckCount(id, DOWN);
    model.updateHealthCheckCount(id, DOWN);
    model.updateHealthCheckCount(id, DOWN);
    model.purgeDeadNodes();

    assertThat(model.getSnapshot()).isEmpty();
  }

  @Test
  void purgeDeadNodesMovesStaleUpNodeDownAndRemovesStaleDownNode() {
    NodeId upId = new NodeId(UUID.randomUUID());
    model.add(makeNode(upId, uri(5678)));
    model.setAvailability(upId, UP);

    NodeId downId = new NodeId(UUID.randomUUID());
    model.add(makeNode(downId, uri(5679)));

    long staleTouch = Instant.now().minus(Duration.ofMinutes(3)).toEpochMilli();
    redis.set("grid:node:" + upId + ":lastTouch", String.valueOf(staleTouch));
    redis.set("grid:node:" + downId + ":lastTouch", String.valueOf(staleTouch));

    model.purgeDeadNodes();

    assertThat(model.getSnapshot())
        .extracting(NodeStatus::getNodeId, NodeStatus::getAvailability)
        .containsExactlyInAnyOrder(tuple(upId, DOWN));
  }

  @Test
  void reserveSlotRequiresNodeToBeUp() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node);
    // Still DOWN — reservation should fail.
    SlotId slotId = node.getSlots().iterator().next().getId();

    boolean reserved = model.reserve(slotId);

    assertThat(reserved).isFalse();
  }

  @Test
  void reserveSlotSucceedsWhenNodeIsUp() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node);
    model.setAvailability(id, UP);
    SlotId slotId = node.getSlots().iterator().next().getId();

    boolean reserved = model.reserve(slotId);

    assertThat(reserved).isTrue();
  }

  @Test
  void concurrentReservationsOnSameSlotOnlyOneWins() throws InterruptedException {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node);
    model.setAvailability(id, UP);
    SlotId slotId = node.getSlots().iterator().next().getId();

    int threads = 10;
    CountDownLatch startLatch = new CountDownLatch(1);
    CountDownLatch doneLatch = new CountDownLatch(threads);
    AtomicInteger wins = new AtomicInteger(0);
    ExecutorService executor = Executors.newFixedThreadPool(threads);

    for (int i = 0; i < threads; i++) {
      executor.submit(
          () -> {
            try {
              startLatch.await();
              if (model.reserve(slotId)) {
                wins.incrementAndGet();
              }
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            } finally {
              doneLatch.countDown();
            }
          });
    }

    startLatch.countDown();
    assertThat(doneLatch.await(10, TimeUnit.SECONDS)).isTrue();
    executor.shutdown();

    assertThat(wins.get()).isEqualTo(1);
  }

  @Test
  void releaseSlotMakesItFreeAgain() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node);
    model.setAvailability(id, UP);
    SlotId slotId = node.getSlots().iterator().next().getId();
    model.reserve(slotId);

    // Assign a real session.
    Session session =
        new Session(
            new SessionId(UUID.randomUUID()),
            uri(5678),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("browserName", "chrome"),
            Instant.now());
    model.setSession(slotId, session);

    // Release the session.
    model.release(session.getId());

    // The slot should be free again — reservation should succeed.
    boolean reserved = model.reserve(slotId);
    assertThat(reserved).isTrue();
  }

  @Test
  void updateHealthCheckCountTracksFailures() {
    NodeId id = new NodeId(UUID.randomUUID());
    model.add(makeNode(id, uri(5678)));

    model.updateHealthCheckCount(id, DOWN);
    model.updateHealthCheckCount(id, DOWN);

    Long count = redis.getAsLong("grid:node:" + id + ":healthFailCount");
    assertThat(count).isEqualTo(2L);
  }

  @Test
  void updateHealthCheckCountResetsOnUp() {
    NodeId id = new NodeId(UUID.randomUUID());
    model.add(makeNode(id, uri(5678)));
    model.updateHealthCheckCount(id, DOWN);
    model.updateHealthCheckCount(id, DOWN);

    model.updateHealthCheckCount(id, UP);

    Long count = redis.getAsLong("grid:node:" + id + ":healthFailCount");
    assertThat(count).isEqualTo(0L);
  }

  @Test
  void refreshPreservesDownWhenNodeIsDown() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node); // Added as DOWN

    // Create a status claiming UP.
    NodeStatus claimsUp =
        new NodeStatus(
            id,
            uri(5678),
            5,
            node.getSlots(),
            UP,
            Duration.ofSeconds(30),
            Duration.ofMinutes(5),
            "4.0",
            java.util.Map.of());
    model.refresh(claimsUp);

    NodeStatus result =
        model.getSnapshot().stream()
            .filter(n -> n.getNodeId().equals(id))
            .findFirst()
            .orElseThrow();
    assertThat(result.getAvailability()).isEqualTo(DOWN);
  }

  @Test
  void reAddingSameUriWithDifferentNodeIdFiresRestartAndRemovesOldNode() {
    URI nodeUri = uri(5678);
    NodeId firstId = new NodeId(UUID.randomUUID());
    NodeStatus first = makeNode(firstId, nodeUri);
    AtomicReference<NodeStatus> restarted = new AtomicReference<>();
    bus.addListener(NodeRestartedEvent.listener(restarted::set));

    model.add(first);
    model.setAvailability(firstId, UP);
    SlotId firstSlotId = first.getSlots().iterator().next().getId();
    model.reserve(firstSlotId);

    NodeId secondId = new NodeId(UUID.randomUUID());
    model.add(makeNode(secondId, nodeUri));

    assertThat(restarted.get()).isNotNull();
    assertThat(restarted.get().getNodeId()).isEqualTo(firstId);
    assertThat(model.getSnapshot()).extracting(NodeStatus::getNodeId).containsExactly(secondId);
    assertThat(
            redis.get(
                "grid:slot:"
                    + firstSlotId.getOwningNodeId()
                    + ":"
                    + firstSlotId.getSlotId()
                    + ":session"))
        .isNull();
  }

  @Test
  void reAddingSameNodeIdWithDifferentUriRemovesOldNodeState() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus first = makeNode(id, uri(5678));
    model.add(first);
    model.setAvailability(id, UP);
    SlotId firstSlotId = first.getSlots().iterator().next().getId();
    model.reserve(firstSlotId);

    URI newUri = uri(5679);
    model.add(makeNode(id, newUri));

    NodeStatus status = model.getSnapshot().iterator().next();
    assertThat(status.getNodeId()).isEqualTo(id);
    assertThat(status.getExternalUri()).isEqualTo(newUri);
    assertThat(
            redis.get(
                "grid:slot:"
                    + firstSlotId.getOwningNodeId()
                    + ":"
                    + firstSlotId.getSlotId()
                    + ":session"))
        .isNull();
  }

  @Test
  void getSnapshotReturnsAllNodes() {
    NodeId id1 = new NodeId(UUID.randomUUID());
    NodeId id2 = new NodeId(UUID.randomUUID());
    model.add(makeNode(id1, uri(5001)));
    model.add(makeNode(id2, uri(5002)));
    model.setAvailability(id1, UP);
    model.setAvailability(id2, DRAINING);

    Set<NodeStatus> snapshot = model.getSnapshot();
    assertThat(snapshot).hasSize(2);
  }

  @Test
  void setSessionAssociatesSessionWithSlot() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node);
    model.setAvailability(id, UP);
    SlotId slotId = node.getSlots().iterator().next().getId();
    model.reserve(slotId);

    Session session =
        new Session(
            new SessionId(UUID.randomUUID()),
            uri(5678),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("browserName", "chrome"),
            Instant.now());
    model.setSession(slotId, session);

    NodeStatus result =
        model.getSnapshot().stream()
            .filter(n -> n.getNodeId().equals(id))
            .findFirst()
            .orElseThrow();
    Slot slot =
        result.getSlots().stream().filter(s -> s.getId().equals(slotId)).findFirst().orElseThrow();
    assertThat(slot.getSession()).isNotNull();
    assertThat(slot.getSession().getId()).isEqualTo(session.getId());
  }

  @Test
  void reservedSentinelHasTtlSoOrphanedReservationExpires() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node);
    model.setAvailability(id, UP);
    SlotId slotId = node.getSlots().iterator().next().getId();

    boolean reserved = model.reserve(slotId);

    assertThat(reserved).isTrue();
    String key = "grid:slot:" + slotId.getOwningNodeId() + ":" + slotId.getSlotId() + ":session";
    // Key must exist and have a TTL (pttl returns > 0 when TTL is set).
    Long pttl = redis.getConnection().sync().pttl(key);
    assertThat(pttl).isGreaterThan(0);
  }

  @Test
  void setSessionOverwritesReservedKeyWithNoTtlSoRealSessionPersists() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node);
    model.setAvailability(id, UP);
    SlotId slotId = node.getSlots().iterator().next().getId();
    model.reserve(slotId);

    Session session =
        new Session(
            new SessionId(UUID.randomUUID()),
            uri(5678),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("browserName", "chrome"),
            Instant.now());
    model.setSession(slotId, session);

    String key = "grid:slot:" + slotId.getOwningNodeId() + ":" + slotId.getSlotId() + ":session";
    // After setSession(), the key has no TTL (pttl returns -1 for persistent keys).
    Long pttl = redis.getConnection().sync().pttl(key);
    assertThat(pttl).isEqualTo(-1);
  }

  @Test
  void releaseUsesReverseIndexAndWorksWithStaleBlobForNodeBlob() {
    NodeId id = new NodeId(UUID.randomUUID());
    NodeStatus node = makeNode(id, uri(5678));
    model.add(node);
    model.setAvailability(id, UP);
    SlotId slotId = node.getSlots().iterator().next().getId();
    model.reserve(slotId);

    Session session =
        new Session(
            new SessionId(UUID.randomUUID()),
            uri(5678),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("browserName", "chrome"),
            Instant.now());
    model.setSession(slotId, session);

    // Corrupt the node blob to simulate a lost concurrent writeNodeWithUpdatedSlot write —
    // the blob no longer contains the session, but the slot key and reverse index still exist.
    String blobKey = "grid:node:" + id + ":status";
    NodeStatus blobWithNoSession =
        new NodeStatus(
            id,
            uri(5678),
            5,
            node.getSlots(), // original slots with null sessions
            UP,
            Duration.ofSeconds(30),
            Duration.ofMinutes(5),
            "4.0",
            java.util.Map.of());
    redis.set(blobKey, new org.openqa.selenium.json.Json().toJson(blobWithNoSession));

    // release() must still find and delete the slot key via the reverse index.
    model.release(session.getId());

    String slotKey =
        "grid:slot:" + slotId.getOwningNodeId() + ":" + slotId.getSlotId() + ":session";
    assertThat(redis.get(slotKey)).isNull();

    // Slot should be re-reservable.
    assertThat(model.reserve(slotId)).isTrue();
  }
}
