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

package org.openqa.selenium.grid.distributor;

import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
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
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.internal.Debug;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Logger;

import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;

public class GridModel {

  private static final SessionId RESERVED = new SessionId("reserved");
  private static final Logger LOG = Logger.getLogger(GridModel.class.getName());
  // How many times a node's heartbeat duration needs to be exceeded before the node is considered purgeable.
  private static final int PURGE_TIMEOUT_MULTIPLIER = 4;
  private static final int UNHEALTHY_THRESHOLD = 4;
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final Set<NodeStatus> nodes = Collections.newSetFromMap(new ConcurrentHashMap<>());
  private final Map<NodeId, Instant> nodePurgeTimes = new ConcurrentHashMap<>();
  private final Map<NodeId, Integer> nodeHealthCount = new ConcurrentHashMap<>();
  private final EventBus events;

  public GridModel(EventBus events) {
    this.events = Require.nonNull("Event bus", events);

    this.events.addListener(NodeDrainStarted.listener(nodeId -> setAvailability(nodeId, DRAINING)));
    this.events.addListener(SessionClosedEvent.listener(this::release));
  }

  public static GridModel create(Config config) {
    EventBus bus = new EventBusOptions(config).getEventBus();

    return new GridModel(bus);
  }

  public void add(NodeStatus node) {
    Require.nonNull("Node", node);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      // If we've already added the node, remove it.
      Iterator<NodeStatus> iterator = nodes.iterator();
      while (iterator.hasNext()) {
        NodeStatus next = iterator.next();

        // If the ID and the URI are the same, use the same
        // availability as the version we have now: we're just refreshing
        // an existing node.
        if (next.getNodeId().equals(node.getNodeId()) && next.getExternalUri().equals(node.getExternalUri())) {
          iterator.remove();

          LOG.log(Debug.getDebugLogLevel(), "Refreshing node with id %s", node.getNodeId());
          NodeStatus refreshed = rewrite(node, next.getAvailability());
          nodes.add(refreshed);
          nodePurgeTimes.put(refreshed.getNodeId(), Instant.now());
          updateHealthCheckCount(refreshed.getNodeId(), refreshed.getAvailability());

          return;
        }

        // If the URI is the same but NodeId is different, then the Node has restarted
        if(!next.getNodeId().equals(node.getNodeId()) &&
           next.getExternalUri().equals(node.getExternalUri())) {
          LOG.info(String.format("Re-adding node with id %s and URI %s.", node.getNodeId(), node.getExternalUri()));

          events.fire(new NodeRestartedEvent(node));
          iterator.remove();
          break;
        }

        // If the URI has changed, then assume this is a new node and fall
        // out of the loop: we want to add it as `DOWN` until something
        // changes our mind.
        if (next.getNodeId().equals(node.getNodeId())) {
          LOG.info(String.format("Re-adding node with id %s and URI %s.", node.getNodeId(), node.getExternalUri()));
          iterator.remove();
          break;
        }
      }

      // Nodes are initially added in the "down" state until something changes their availability
      LOG.log(
        Debug.getDebugLogLevel(),
        String.format("Adding node with id %s and URI %s", node.getNodeId(), node.getExternalUri()));
      NodeStatus refreshed = rewrite(node, DOWN);
      nodes.add(refreshed);
      nodePurgeTimes.put(refreshed.getNodeId(), Instant.now());
      updateHealthCheckCount(refreshed.getNodeId(), refreshed.getAvailability());
    } finally {
      writeLock.unlock();
    }
  }

  public void refresh(NodeStatus status) {
    Require.nonNull("Node status", status);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Iterator<NodeStatus> iterator = nodes.iterator();
      while (iterator.hasNext()) {
        NodeStatus node = iterator.next();

        if (node.getNodeId().equals(status.getNodeId())) {
          iterator.remove();

          // if the node was marked as "down", keep it down until a healthcheck passes:
          // just because the node can hit the event bus doesn't mean it's reachable
          if (node.getAvailability() == DOWN) {
            nodes.add(rewrite(status, DOWN));
          } else {
            // Otherwise, trust what it tells us.
            nodes.add(status);
          }

          nodePurgeTimes.put(status.getNodeId(), Instant.now());

          return;
        }
      }
    } finally {
      writeLock.unlock();
    }
  }

  public void touch(NodeId id) {
    Require.nonNull("Node ID", id);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      NodeStatus node = getNode(id);
      if (node != null) {
        nodePurgeTimes.put(node.getNodeId(), Instant.now());
      }
    } finally {
      writeLock.unlock();
    }
  }

  public void remove(NodeId id) {
    Require.nonNull("Node ID", id);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      nodes.removeIf(n -> n.getNodeId().equals(id));
      nodePurgeTimes.remove(id);
      nodeHealthCount.remove(id);
    } finally {
      writeLock.unlock();
    }
  }

  public void purgeDeadNodes() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Map<NodeStatus, NodeStatus> replacements = new HashMap<>();
      Set<NodeStatus> toRemove = new HashSet<>();

      for (NodeStatus node : nodes) {
        NodeId id = node.getNodeId();
        if (nodeHealthCount.getOrDefault(id, 0) > UNHEALTHY_THRESHOLD) {
          LOG.info(String.format("Removing Node %s, unhealthy threshold has been reached",
                                 node.getExternalUri()));
          toRemove.add(node);
          break;
        }

        Instant now = Instant.now();
        Instant lastTouched = nodePurgeTimes.getOrDefault(id, Instant.now());
        Instant lostTime = lastTouched.plus(node.getHeartbeatPeriod().multipliedBy(PURGE_TIMEOUT_MULTIPLIER / 2));
        Instant deadTime = lastTouched.plus(node.getHeartbeatPeriod().multipliedBy(PURGE_TIMEOUT_MULTIPLIER));

        if (node.getAvailability() == UP && lostTime.isBefore(now)) {
          LOG.info(String.format("Switching Node %s from UP to DOWN", node.getExternalUri()));
          replacements.put(node, rewrite(node, DOWN));
        }
        if (node.getAvailability() == DOWN && deadTime.isBefore(now)) {
          LOG.info(String.format("Removing Node %s, DOWN for too long", node.getExternalUri()));
          toRemove.add(node);
        }
      }

      replacements.forEach((before, after) -> {
        nodes.remove(before);
        nodes.add(after);
      });
      toRemove.forEach(node -> {
        nodes.remove(node);
        nodePurgeTimes.remove(node.getNodeId());
        nodeHealthCount.remove(node.getNodeId());
        events.fire(new NodeRemovedEvent(node));
      });
    } finally {
      writeLock.unlock();
    }
  }

  public void setAvailability(NodeId id, Availability availability) {
    Require.nonNull("Node ID", id);
    Require.nonNull("Availability", availability);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      NodeStatus node = getNode(id);

      if (node == null) {
        return;
      }

      if (availability.equals(node.getAvailability())) {
        if (node.getAvailability() == UP) {
          nodePurgeTimes.put(node.getNodeId(), Instant.now());
        }
      } else {
        LOG.info(String.format(
          "Switching Node %s (uri: %s) from %s to %s",
          id,
          node.getExternalUri(),
          node.getAvailability(),
          availability));

        NodeStatus refreshed = rewrite(node, availability);
        nodes.remove(node);
        nodes.add(refreshed);
        nodePurgeTimes.put(node.getNodeId(), Instant.now());
      }
    } finally {
      writeLock.unlock();
    }
  }

  public boolean reserve(SlotId slotId) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      NodeStatus node = getNode(slotId.getOwningNodeId());
      if (node == null) {
        LOG.warning(String.format("Asked to reserve slot on node %s, but unable to find node", slotId.getOwningNodeId()));
        return false;
      }

      if (!UP.equals(node.getAvailability())) {
        LOG.warning(String.format(
          "Asked to reserve a slot on node %s, but node is %s",
          slotId.getOwningNodeId(),
          node.getAvailability()));
        return false;
      }

      Optional<Slot> maybeSlot = node.getSlots().stream()
        .filter(slot -> slotId.equals(slot.getId()))
        .findFirst();

      if (!maybeSlot.isPresent()) {
        LOG.warning(String.format(
          "Asked to reserve slot on node %s, but no slot with id %s found",
          node.getNodeId(),
          slotId));
        return false;
      }

      reserve(node, maybeSlot.get());
      return true;
    } finally {
      writeLock.unlock();
    }
  }

  public Set<NodeStatus> getSnapshot() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return ImmutableSet.copyOf(nodes);
    } finally {
      readLock.unlock();
    }
  }

  private NodeStatus getNode(NodeId id) {
    Require.nonNull("Node ID", id);

    Lock readLock = lock.readLock();
    readLock.lock();
    try {
      return nodes.stream()
        .filter(n -> n.getNodeId().equals(id))
        .findFirst()
        .orElse(null);
    } finally {
      readLock.unlock();
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
      status.getVersion(),
      status.getOsInfo());
  }

  public void release(SessionId id) {
    if (id == null) {
      return;
    }

    LOG.info("Releasing slot for session id " + id);
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      for (NodeStatus node : nodes) {
        for (Slot slot : node.getSlots()) {
          if (slot.getSession() == null) {
            continue;
          }

          if (id.equals(slot.getSession().getId())) {
            Slot released = new Slot(
              slot.getId(),
              slot.getStereotype(),
              slot.getLastStarted(),
              null);
            amend(node.getAvailability(), node, released);
            return;
          }
        }
      }
    } finally {
      writeLock.unlock();
    }
  }

  public void reserve(NodeStatus status, Slot slot) {
    Instant now = Instant.now();

    Slot reserved = new Slot(
      slot.getId(),
      slot.getStereotype(),
      now,
      new Session(
        RESERVED,
        status.getExternalUri(),
        slot.getStereotype(),
        slot.getStereotype(),
        now));

    amend(UP, status, reserved);
  }

  public void setSession(SlotId slotId, Session session) {
    Require.nonNull("Slot ID", slotId);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      NodeStatus node = getNode(slotId.getOwningNodeId());
      if (node == null) {
        LOG.warning("Grid model and reality have diverged. Unable to find node " + slotId.getOwningNodeId());
        return;
      }

      Optional<Slot> maybeSlot = node.getSlots().stream()
        .filter(slot -> slotId.equals(slot.getId()))
        .findFirst();

      if (!maybeSlot.isPresent()) {
        LOG.warning("Grid model and reality have diverged. Unable to find slot " + slotId);
        return;
      }

      Slot slot = maybeSlot.get();
      Session maybeSession = slot.getSession();
      if (maybeSession == null) {
        LOG.warning("Grid model and reality have diverged. Slot is not reserved. " + slotId);
        return;
      }

      if (!RESERVED.equals(maybeSession.getId())) {
        LOG.warning(
          "Grid model and reality have diverged. Slot has session and is not reserved. " + slotId);
        return;
      }

      Slot updated = new Slot(
        slot.getId(),
        slot.getStereotype(),
        session == null ? slot.getLastStarted() : session.getStartTime(),
        session);

      amend(node.getAvailability(), node, updated);
    } finally {
      writeLock.unlock();
    }
  }

  public void updateHealthCheckCount(NodeId id, Availability availability) {
    Require.nonNull("Node ID", id);
    Require.nonNull("Availability", availability);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      int unhealthyCount = nodeHealthCount.getOrDefault(id, 0);

      // Keep track of consecutive number of times the Node health check fails
      if (availability.equals(DOWN)) {
        nodeHealthCount.put(id, unhealthyCount + 1);
      }

      // If the Node is healthy again before crossing the threshold, then reset the count.
      if (unhealthyCount <= UNHEALTHY_THRESHOLD && availability.equals(UP)) {
        nodeHealthCount.put(id, 0);
      }
    } finally {
      writeLock.unlock();
    }
  }

  private void amend(Availability availability, NodeStatus status, Slot slot) {
    Set<Slot> newSlots = new HashSet<>(status.getSlots());
    newSlots.removeIf(s -> s.getId().equals(slot.getId()));
    newSlots.add(slot);

    NodeStatus node = getNode(status.getNodeId());

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      nodes.remove(node);
      nodes.add(new NodeStatus(
        status.getNodeId(),
        status.getExternalUri(),
        status.getMaxSessionCount(),
        newSlots,
        availability,
        status.getHeartbeatPeriod(),
        status.getVersion(),
        status.getOsInfo()));
    } finally {
      writeLock.unlock();
    }
  }
}
