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

import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;

import java.time.Instant;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeDrainStarted;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.distributor.GridModel;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.SessionId;

/**
 * Redis-backed implementation of {@link GridModel}. All grid state is stored in Redis, enabling
 * multiple Distributor replicas to share a consistent view of the grid without any JVM-local state.
 *
 * <p>Key schema:
 *
 * <ul>
 *   <li>{@code grid:node:{nodeId}:status} — JSON-serialized {@link NodeStatus}
 *   <li>{@code grid:nodes:UP / DOWN / DRAINING} — Redisson RSet of NodeId strings
 *   <li>{@code grid:node:{nodeId}:lastTouch} — epoch-millis of last heartbeat
 *   <li>{@code grid:node:{nodeId}:healthFailCount} — consecutive failure count
 *   <li>{@code grid:slot:{nodeId}:{slotUUID}:session} — {@code "RESERVED"} or JSON(Session)
 * </ul>
 */
public class RedisBackedGridModel extends GridModel {

  private static final Logger LOG = Logger.getLogger(RedisBackedGridModel.class.getName());
  private static final Json JSON = new Json();

  private static final String RESERVED_SENTINEL = "RESERVED";
  static final SessionId RESERVED = new SessionId("reserved");

  // How many times a node's heartbeat duration needs to be exceeded before marking DOWN.
  private static final int PURGE_TIMEOUT_MULTIPLIER = 4;
  private static final int UNHEALTHY_THRESHOLD = 4;

  private final GridRedisClient redis;
  private final EventBus events;

  public RedisBackedGridModel(GridRedisClient redis, EventBus events) {
    this.redis = Require.nonNull("Redis client", redis);
    this.events = Require.nonNull("Event bus", events);

    this.events.addListener(NodeDrainStarted.listener(nodeId -> setAvailability(nodeId, DRAINING)));
    this.events.addListener(SessionClosedEvent.sessionListener(this::release));
  }

  // ---- Key helpers ----------------------------------------------------------------

  private static String nodeStatusKey(NodeId id) {
    return "grid:node:" + id + ":status";
  }

  private static String lastTouchKey(NodeId id) {
    return "grid:node:" + id + ":lastTouch";
  }

  private static String healthFailKey(NodeId id) {
    return "grid:node:" + id + ":healthFailCount";
  }

  private static String slotSessionKey(SlotId slotId) {
    return "grid:slot:" + slotId.getOwningNodeId() + ":" + slotId.getSlotId() + ":session";
  }

  private static String sessionSlotKey(SessionId sessionId) {
    return "grid:session:" + sessionId + ":slotKey";
  }

  // ---- Serialization helpers ------------------------------------------------------

  private void writeNodeBlob(NodeStatus node) {
    redis.set(nodeStatusKey(node.getNodeId()), JSON.toJson(node));
  }

  @Nullable
  private NodeStatus readNodeBlob(NodeId id) {
    String raw = redis.get(nodeStatusKey(id));
    if (raw == null) {
      return null;
    }
    try {
      return JSON.toType(raw, NodeStatus.class);
    } catch (Exception e) {
      LOG.warning("Failed to deserialize NodeStatus for " + id + ": " + e.getMessage());
      return null;
    }
  }

  private NodeStatus rewrite(NodeStatus status, Availability availability) {
    return new NodeStatus(
        status.getNodeId(),
        status.getExternalUri(),
        status.getMaxSessionCount(),
        status.getSlots(),
        availability,
        status.getHeartbeatPeriod(),
        status.getSessionTimeout(),
        status.getVersion(),
        status.getOsInfo());
  }

  // ---- Availability set helpers ---------------------------------------------------

  private void addToAvailabilitySet(Availability availability, NodeId id) {
    redis.addNodeAvailability(availability, stubStatusForId(id));
  }

  private void removeFromAvailabilitySet(Availability availability, NodeId id) {
    redis.removeNodeAvailability(availability, stubStatusForId(id));
  }

  private void moveAvailability(NodeId id, Availability from, Availability to) {
    addToAvailabilitySet(to, id);
    removeFromAvailabilitySet(from, id);
  }

  private NodeStatus stubStatusForId(NodeId id) {
    // GridRedisClient.addNodeAvailability / removeNodeAvailability only reads getNodeId().
    NodeStatus existing = readNodeBlob(id);
    if (existing != null) {
      return existing;
    }
    // Fallback used only when the blob is not yet written.
    return new NodeStatus(id, null, 0, Set.of(), DOWN, null, null, "", java.util.Map.of());
  }

  private Set<NodeId> getAllNodeIds() {
    Set<NodeId> ids = new HashSet<>();
    ids.addAll(redis.getNodesByAvailability(UP));
    ids.addAll(redis.getNodesByAvailability(DOWN));
    ids.addAll(redis.getNodesByAvailability(DRAINING));
    return ids;
  }

  @Nullable
  private Availability currentAvailability(NodeId id) {
    if (redis.getNodeAvailability(UP, id)) return UP;
    if (redis.getNodeAvailability(DOWN, id)) return DOWN;
    if (redis.getNodeAvailability(DRAINING, id)) return DRAINING;
    return null;
  }

  // ---- GridModel implementation ---------------------------------------------------

  @Override
  public void add(NodeStatus node) {
    Require.nonNull("Node", node);

    NodeStatus restartedNode = null;

    // Check for existing node with same URI but different ID (node restart).
    for (NodeId existingId : getAllNodeIds()) {
      NodeStatus existing = readNodeBlob(existingId);
      if (existing == null) {
        continue;
      }

      if (existing.getNodeId().equals(node.getNodeId())
          && existing.getExternalUri().equals(node.getExternalUri())) {
        // Same node refreshing — keep existing availability.
        LOG.log(Debug.getDebugLogLevel(), "Refreshing node with id {0}", node.getNodeId());
        NodeStatus refreshed = rewrite(node, existing.getAvailability());
        writeNodeBlob(refreshed);
        redis.set(lastTouchKey(node.getNodeId()), String.valueOf(Instant.now().toEpochMilli()));
        updateHealthCheckCount(node.getNodeId(), refreshed.getAvailability());
        return;
      }

      if (!existing.getNodeId().equals(node.getNodeId())
          && existing.getExternalUri() != null
          && existing.getExternalUri().equals(node.getExternalUri())) {
        // Same URI, different ID → node restarted.
        LOG.info(
            String.format(
                "Re-adding node with id %s and URI %s.", node.getNodeId(), node.getExternalUri()));
        restartedNode = existing;
        removeAllKeysForNode(existing.getNodeId());
        break;
      }

      if (existing.getNodeId().equals(node.getNodeId())) {
        // Same ID, different URI — treat as new node.
        LOG.info(
            String.format(
                "Re-adding node with id %s and URI %s.", node.getNodeId(), node.getExternalUri()));
        removeAllKeysForNode(existing.getNodeId());
        break;
      }
    }

    // Add as DOWN until health check promotes it.
    LOG.log(
        Debug.getDebugLogLevel(),
        "Adding node with id {0} and URI {1}",
        new Object[] {node.getNodeId(), node.getExternalUri()});
    NodeStatus asDown = rewrite(node, DOWN);
    writeNodeBlob(asDown);
    addToAvailabilitySet(DOWN, node.getNodeId());
    redis.set(lastTouchKey(node.getNodeId()), String.valueOf(Instant.now().toEpochMilli()));
    redis.set(healthFailKey(node.getNodeId()), "0");

    if (restartedNode != null) {
      events.fire(new NodeRestartedEvent(restartedNode));
    }
  }

  private void removeAllKeysForNode(NodeId id) {
    NodeStatus node = readNodeBlob(id);
    removeFromAvailabilitySet(UP, id);
    removeFromAvailabilitySet(DOWN, id);
    removeFromAvailabilitySet(DRAINING, id);
    redis.del(nodeStatusKey(id), lastTouchKey(id), healthFailKey(id));
    if (node != null) {
      removeSlotKeysForNode(node);
    }
  }

  @Override
  public void refresh(NodeStatus status) {
    Require.nonNull("Node status", status);

    NodeStatus existing = readNodeBlob(status.getNodeId());
    if (existing == null) {
      return;
    }

    NodeStatus updated;
    if (existing.getAvailability() == DOWN) {
      // Keep DOWN until a health check passes.
      updated = rewrite(status, DOWN);
    } else {
      updated = status;
    }

    writeNodeBlob(updated);
    redis.set(lastTouchKey(status.getNodeId()), String.valueOf(Instant.now().toEpochMilli()));
  }

  @Override
  public void touch(NodeStatus nodeStatus) {
    Require.nonNull("Node status", nodeStatus);

    NodeStatus existing = readNodeBlob(nodeStatus.getNodeId());
    if (existing == null) {
      return;
    }

    redis.set(lastTouchKey(existing.getNodeId()), String.valueOf(Instant.now().toEpochMilli()));

    if (existing.getAvailability() != nodeStatus.getAvailability()
        && nodeStatus.getAvailability() == UP) {
      // Node reports UP while we have it DOWN — trust it.
      Availability currentAvail = currentAvailability(existing.getNodeId());
      if (currentAvail != null && currentAvail != UP) {
        moveAvailability(existing.getNodeId(), currentAvail, UP);
      }
      writeNodeBlob(nodeStatus);
    }
  }

  @Override
  public void remove(NodeId id) {
    Require.nonNull("Node ID", id);
    removeAllKeysForNode(id);
  }

  private void removeSlotKeysForNode(NodeStatus node) {
    // Clean up slot keys and any reverse index entries for real sessions on this node.
    for (Slot slot : node.getSlots()) {
      String slotKey = slotSessionKey(slot.getId());
      String slotValue = redis.get(slotKey);
      if (slotValue != null && !RESERVED_SENTINEL.equals(slotValue)) {
        try {
          Session session = JSON.toType(slotValue, Session.class);
          redis.del(sessionSlotKey(session.getId()));
        } catch (Exception e) {
          LOG.fine("Could not clean up reverse index for slot " + slotKey + ": " + e.getMessage());
        }
      }
      redis.del(slotKey);
    }
  }

  @Override
  public void purgeDeadNodes() {
    Set<NodeStatus> toRemove = new HashSet<>();

    for (NodeId id : getAllNodeIds()) {
      NodeStatus node = readNodeBlob(id);
      if (node == null) {
        continue;
      }

      Long rawCount = redis.getAsLong(healthFailKey(id));
      int failCount = rawCount == null ? 0 : rawCount.intValue();

      if (failCount > UNHEALTHY_THRESHOLD) {
        LOG.info(
            String.format(
                "Removing Node %s (uri: %s), unhealthy threshold has been reached",
                node.getNodeId(), node.getMaskedUri()));
        toRemove.add(node);
        continue;
      }

      Long rawTouch = redis.getAsLong(lastTouchKey(id));
      Instant lastTouched = rawTouch == null ? Instant.now() : Instant.ofEpochMilli(rawTouch);
      Instant now = Instant.now();
      Instant lostTime =
          lastTouched.plus(
              node.getHeartbeatPeriod().multipliedBy(PURGE_TIMEOUT_MULTIPLIER).dividedBy(2));
      Instant deadTime =
          lastTouched.plus(node.getHeartbeatPeriod().multipliedBy(PURGE_TIMEOUT_MULTIPLIER));

      Availability avail = currentAvailability(id);

      if (avail == UP && lostTime.isBefore(now)) {
        LOG.info(
            String.format(
                "Switching Node %s (uri: %s) from UP to DOWN",
                node.getNodeId(), node.getMaskedUri()));
        moveAvailability(id, UP, DOWN);
        writeNodeBlob(rewrite(node, DOWN));
        redis.set(lastTouchKey(id), String.valueOf(Instant.now().toEpochMilli()));
      } else if (avail == DOWN && deadTime.isBefore(now)) {
        LOG.info(
            String.format(
                "Removing Node %s (uri: %s), DOWN for too long",
                node.getNodeId(), node.getMaskedUri()));
        toRemove.add(node);
      }
    }

    toRemove.forEach(
        node -> {
          removeAllKeysForNode(node.getNodeId());
          events.fire(new NodeRemovedEvent(node));
        });
  }

  @Override
  public void setAvailability(NodeId id, Availability availability) {
    Require.nonNull("Node ID", id);
    Require.nonNull("Availability", availability);

    NodeStatus node = readNodeBlob(id);
    if (node == null) {
      return;
    }

    Availability current = currentAvailability(id);
    if (current == null) {
      // Node not in any set — add it to the requested set.
      addToAvailabilitySet(availability, id);
      writeNodeBlob(rewrite(node, availability));
      return;
    }

    if (availability.equals(current)) {
      if (current == UP) {
        redis.set(lastTouchKey(id), String.valueOf(Instant.now().toEpochMilli()));
      }
      return;
    }

    LOG.info(
        String.format(
            "Switching Node %s (uri: %s) from %s to %s",
            id, node.getMaskedUri(), current, availability));

    moveAvailability(id, current, availability);
    writeNodeBlob(rewrite(node, availability));
    redis.set(lastTouchKey(id), String.valueOf(Instant.now().toEpochMilli()));
  }

  @Override
  public boolean reserve(SlotId slotId) {
    Require.nonNull("Slot ID", slotId);

    NodeStatus node = readNodeBlob(slotId.getOwningNodeId());
    if (node == null) {
      LOG.warning(
          String.format(
              "Asked to reserve slot on node %s, but unable to find node",
              slotId.getOwningNodeId()));
      return false;
    }

    if (!UP.equals(node.getAvailability())) {
      LOG.warning(
          String.format(
              "Asked to reserve a slot on node %s, but node is %s",
              slotId.getOwningNodeId(), node.getAvailability()));
      return false;
    }

    // The slot key is authoritative for reservation state — the blob may be stale after a
    // concurrent writeNodeWithUpdatedSlot race, so we do not filter by slot.getSession() here.
    Optional<Slot> maybeSlot =
        node.getSlots().stream().filter(slot -> slotId.equals(slot.getId())).findFirst();

    if (maybeSlot.isEmpty()) {
      LOG.fine(
          String.format(
              "Asked to reserve slot %s on node %s, but slot not found", slotId, node.getNodeId()));
      return false;
    }

    // Atomic reservation — only one replica wins. TTL ensures the key auto-expires if the
    // distributor crashes after SET NX but before setSession() writes a real session, preventing
    // permanent slot lock. setSession() overwrites this key without TTL, so live sessions persist.
    long reservationTtlMs = node.getSessionTimeout().toMillis();
    boolean won = redis.setIfAbsent(slotSessionKey(slotId), RESERVED_SENTINEL, reservationTtlMs);
    if (!won) {
      return false;
    }

    // Update the node blob so snapshot reflects the reservation.
    Slot slot = maybeSlot.get();
    Instant now = Instant.now();
    Slot reserved =
        new Slot(
            slot.getId(),
            slot.getStereotype(),
            now,
            new Session(
                RESERVED, node.getExternalUri(), slot.getStereotype(), slot.getStereotype(), now));
    writeNodeWithUpdatedSlot(node, reserved);
    return true;
  }

  @Override
  public Set<NodeStatus> getSnapshot() {
    Set<NodeId> allIds = getAllNodeIds();
    Set<NodeStatus> result = new HashSet<>();
    for (NodeId id : allIds) {
      NodeStatus node = readNodeBlob(id);
      if (node != null) {
        result.add(reconcileSlots(node));
      }
    }
    return result;
  }

  /**
   * Reconciles the node blob's slot session data with what is actually stored in Redis slot keys.
   * This ensures that a replica that crashed after SET NX but before writing the blob doesn't leave
   * ghost reservations in the snapshot.
   */
  private NodeStatus reconcileSlots(NodeStatus node) {
    Set<Slot> reconciled = new HashSet<>();
    for (Slot slot : node.getSlots()) {
      String slotRaw = redis.get(slotSessionKey(slot.getId()));
      if (slotRaw == null) {
        // Slot key absent → free the slot regardless of what the blob says.
        if (slot.getSession() != null) {
          reconciled.add(new Slot(slot.getId(), slot.getStereotype(), slot.getLastStarted(), null));
        } else {
          reconciled.add(slot);
        }
      } else if (RESERVED_SENTINEL.equals(slotRaw)) {
        // Slot is reserved.
        if (slot.getSession() == null) {
          Instant now = Instant.now();
          reconciled.add(
              new Slot(
                  slot.getId(),
                  slot.getStereotype(),
                  now,
                  new Session(
                      RESERVED,
                      node.getExternalUri(),
                      slot.getStereotype(),
                      slot.getStereotype(),
                      now)));
        } else {
          reconciled.add(slot);
        }
      } else {
        // Slot has a real session JSON.
        try {
          Session session = JSON.toType(slotRaw, Session.class);
          reconciled.add(
              new Slot(slot.getId(), slot.getStereotype(), session.getStartTime(), session));
        } catch (Exception e) {
          reconciled.add(slot);
        }
      }
    }
    return new NodeStatus(
        node.getNodeId(),
        node.getExternalUri(),
        node.getMaxSessionCount(),
        reconciled,
        node.getAvailability(),
        node.getHeartbeatPeriod(),
        node.getSessionTimeout(),
        node.getVersion(),
        node.getOsInfo());
  }

  @Override
  public void release(@Nullable SessionId id) {
    if (id == null) {
      return;
    }

    LOG.info("Releasing slot for session id " + id);

    // Fast path: the reverse index written by setSession() maps session ID → slot key directly.
    // This is O(1) and correct even when node blobs are stale due to concurrent slot updates.
    String reverseKey = sessionSlotKey(id);
    String slotKey = redis.get(reverseKey);
    if (slotKey != null) {
      redis.del(slotKey, reverseKey);
      updateBlobAfterRelease(slotKey);
      return;
    }

    // Fallback: scan node blobs for sessions created before the reverse index was introduced.
    for (NodeId nodeId : getAllNodeIds()) {
      NodeStatus node = readNodeBlob(nodeId);
      if (node == null) {
        continue;
      }
      for (Slot slot : node.getSlots()) {
        if (slot.getSession() == null) {
          continue;
        }
        if (id.equals(slot.getSession().getId())) {
          redis.del(slotSessionKey(slot.getId()));
          Slot released = new Slot(slot.getId(), slot.getStereotype(), slot.getLastStarted(), null);
          writeNodeWithUpdatedSlot(node, released);
          return;
        }
      }
    }
  }

  private void updateBlobAfterRelease(String slotKey) {
    // slotKey format: grid:slot:{nodeId}:{slotUUID}:session  (UUIDs use hyphens, not colons)
    try {
      String[] parts = slotKey.split(":");
      if (parts.length != 5) return;
      NodeId nodeId = new NodeId(UUID.fromString(parts[2]));
      UUID slotUUID = UUID.fromString(parts[3]);

      NodeStatus node = readNodeBlob(nodeId);
      if (node == null) return;

      node.getSlots().stream()
          .filter(s -> slotUUID.equals(s.getId().getSlotId()))
          .findFirst()
          .ifPresent(
              slot -> {
                Slot released =
                    new Slot(slot.getId(), slot.getStereotype(), slot.getLastStarted(), null);
                writeNodeWithUpdatedSlot(node, released);
              });
    } catch (Exception e) {
      LOG.fine(
          "Could not update node blob after release of slot key "
              + slotKey
              + ": "
              + e.getMessage());
    }
  }

  @Override
  public void setSession(SlotId slotId, @Nullable Session session) {
    Require.nonNull("Slot ID", slotId);

    NodeStatus node = readNodeBlob(slotId.getOwningNodeId());
    if (node == null) {
      LOG.warning(
          "Grid model and reality have diverged. Unable to find node " + slotId.getOwningNodeId());
      return;
    }

    Optional<Slot> maybeSlot =
        node.getSlots().stream().filter(slot -> slotId.equals(slot.getId())).findFirst();

    if (maybeSlot.isEmpty()) {
      LOG.warning("Grid model and reality have diverged. Unable to find slot " + slotId);
      return;
    }

    String slotKey = slotSessionKey(slotId);
    if (session == null) {
      redis.del(slotKey);
    } else {
      redis.set(slotKey, JSON.toJson(session));
      // Reverse index: allows release() to find the slot key directly from a session ID without
      // scanning node blobs, making release immune to stale or concurrent-overwritten blobs.
      redis.set(sessionSlotKey(session.getId()), slotKey);
    }

    Slot slot = maybeSlot.get();
    Slot updated =
        new Slot(
            slot.getId(),
            slot.getStereotype(),
            session == null ? slot.getLastStarted() : session.getStartTime(),
            session);
    writeNodeWithUpdatedSlot(node, updated);
  }

  @Override
  public void updateHealthCheckCount(NodeId id, Availability availability) {
    Require.nonNull("Node ID", id);
    Require.nonNull("Availability", availability);

    Long current = redis.getAsLong(healthFailKey(id));
    int count = current == null ? 0 : current.intValue();

    if (availability.equals(DOWN)) {
      redis.set(healthFailKey(id), String.valueOf(count + 1));
    } else if (count <= UNHEALTHY_THRESHOLD && availability.equals(UP)) {
      redis.set(healthFailKey(id), "0");
    }
  }

  // ---- Helpers --------------------------------------------------------------------

  private void writeNodeWithUpdatedSlot(NodeStatus node, Slot updatedSlot) {
    Set<Slot> newSlots = new HashSet<>(node.getSlots());
    newSlots.removeIf(s -> s.getId().equals(updatedSlot.getId()));
    newSlots.add(updatedSlot);

    NodeStatus updated =
        new NodeStatus(
            node.getNodeId(),
            node.getExternalUri(),
            node.getMaxSessionCount(),
            newSlots,
            node.getAvailability(),
            node.getHeartbeatPeriod(),
            node.getSessionTimeout(),
            node.getVersion(),
            node.getOsInfo());
    writeNodeBlob(updated);
  }
}
