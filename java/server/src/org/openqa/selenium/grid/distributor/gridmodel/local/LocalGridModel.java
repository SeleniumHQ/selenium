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

package org.openqa.selenium.grid.distributor.gridmodel.local;

import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeDrainStarted;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.distributor.GridModel;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;

import java.time.Instant;
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

import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toSet;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;

public class LocalGridModel implements GridModel {

  private static final Logger LOG = Logger.getLogger(LocalGridModel.class.getName());
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final Map<Availability, Set<NodeStatus>> nodes = new ConcurrentHashMap<>();
  private final EventBus events;

  public LocalGridModel(EventBus events) {
    this.events = Require.nonNull("Event bus", events);

    this.events.addListener(NodeDrainStarted.listener(nodeId -> setAvailability(nodeId, DRAINING)));
    this.events.addListener(SessionClosedEvent.listener(this::release));
  }

  public static GridModel create(Config config) {
    EventBus bus = new EventBusOptions(config).getEventBus();

    return new LocalGridModel(bus);
  }

  @Override
  public void add(NodeStatus node) {
    Require.nonNull("Node", node);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      // If we've already added the node, remove it.
      for (Set<NodeStatus> nodes : nodes.values()) {
        Iterator<NodeStatus> iterator = nodes.iterator();
        while (iterator.hasNext()) {
          NodeStatus next = iterator.next();

          // If the ID is the same, we're re-adding a node. If the URI is the same a node probably restarted
          if (next.getNodeId().equals(node.getNodeId()) || next.getExternalUri().equals(node.getExternalUri())) {
            LOG.info(String.format("Re-adding node with id %s and URI %s.", node.getNodeId(), node.getExternalUri()));
            iterator.remove();
          }
        }
      }

      // Nodes are initially added in the "down" state until something changes their availability
      nodes(DOWN).add(node);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void refresh(NodeStatus status) {
    Require.nonNull("Node status", status);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      AvailabilityAndNode availabilityAndNode = findNode(status.getNodeId());

      if (availabilityAndNode == null) {
        return;
      }

      // if the node was marked as "down", keep it down until a healthcheck passes:
      // just because the node can hit the event bus doesn't mean it's reachable
      if (DOWN.equals(availabilityAndNode.availability)) {
        nodes(DOWN).remove(availabilityAndNode.status);
        nodes(DOWN).add(status);
      }

      // But do trust the node if it tells us it's draining
      nodes(availabilityAndNode.availability).remove(availabilityAndNode.status);
      nodes(status.getAvailability()).add(status);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void touch(NodeId id) {
    Require.nonNull("Node ID", id);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      AvailabilityAndNode availabilityAndNode = findNode(id);
      if (availabilityAndNode != null) {
        availabilityAndNode.status.touch();
      }
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void remove(NodeId id) {
    Require.nonNull("Node ID", id);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      AvailabilityAndNode availabilityAndNode = findNode(id);
      if (availabilityAndNode == null) {
        return;
      }

      nodes(availabilityAndNode.availability).remove(availabilityAndNode.status);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void purgeDeadNodes() {
    long now = System.currentTimeMillis();
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Set<NodeStatus> lost = nodes(UP).stream()
        .filter(status -> now - status.getTouched() > status.getHeartbeatPeriod().toMillis() * 2)
        .collect(toSet());
      Set<NodeStatus> resurrected = nodes(DOWN).stream()
        .filter(status -> now - status.getTouched() <= status.getHeartbeatPeriod().toMillis())
        .collect(toSet());
      Set<NodeStatus> dead = nodes(DOWN).stream()
        .filter(status -> now - status.getTouched() > status.getHeartbeatPeriod().toMillis() * 4)
        .collect(toSet());
      if (lost.size() > 0) {
        LOG.info(String.format(
          "Switching nodes %s from UP to DOWN",
          lost.stream()
            .map(node -> String.format("%s (uri: %s)", node.getNodeId(), node.getExternalUri()))
            .collect(joining(", "))));
        nodes(UP).removeAll(lost);
        nodes(DOWN).addAll(lost);
      }
      if (resurrected.size() > 0) {
        LOG.info(String.format(
          "Switching nodes %s from DOWN to UP",
          resurrected.stream()
            .map(node -> String.format("%s (uri: %s)", node.getNodeId(), node.getExternalUri()))
            .collect(joining(", "))));
        nodes(DOWN).removeAll(resurrected);
        nodes(UP).addAll(resurrected);
      }
      if (dead.size() > 0) {
        LOG.info(String.format(
          "Removing nodes %s that are DOWN for too long",
          dead.stream()
            .map(node -> String.format("%s (uri: %s)", node.getNodeId(), node.getExternalUri()))
            .collect(joining(", "))));
        nodes(DOWN).removeAll(dead);
      }
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public Availability setAvailability(NodeId id, Availability availability) {
    Require.nonNull("Node ID", id);
    Require.nonNull("Availability", availability);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      AvailabilityAndNode availabilityAndNode = findNode(id);

      if (availabilityAndNode == null) {
        return DOWN;
      }

      if (availability.equals(availabilityAndNode.availability)) {
        return availability;
      }

      nodes(availabilityAndNode.availability).remove(availabilityAndNode.status);
      nodes(availability).add(availabilityAndNode.status);

      LOG.info(String.format(
        "Switching node %s (uri: %s) from %s to %s",
        id,
        availabilityAndNode.status.getExternalUri(),
        availabilityAndNode.availability,
        availability));
      return availabilityAndNode.availability;
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public boolean reserve(SlotId slotId) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      AvailabilityAndNode node = findNode(slotId.getOwningNodeId());
      if (node == null) {
        LOG.warning(String.format("Asked to reserve slot on node %s, but unable to find node", slotId.getOwningNodeId()));
        return false;
      }

      if (!UP.equals(node.availability)) {
        LOG.warning(String.format(
          "Asked to reserve a slot on node %s, but node is %s",
          slotId.getOwningNodeId(),
          node.availability));
        return false;
      }

      Optional<Slot> maybeSlot = node.status.getSlots().stream()
        .filter(slot -> slotId.equals(slot.getId()))
        .findFirst();

      if (!maybeSlot.isPresent()) {
        LOG.warning(String.format(
          "Asked to reserve slot on node %s, but no slot with id %s found",
          node.status.getNodeId(),
          slotId));
        return false;
      }

      reserve(node.status, maybeSlot.get());
      return true;
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public Set<NodeStatus> getSnapshot() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      ImmutableSet.Builder<NodeStatus> snapshot = ImmutableSet.builder();
      for (Map.Entry<Availability, Set<NodeStatus>> entry : nodes.entrySet()) {
        entry.getValue().stream()
          .map(status -> rewrite(status, entry.getKey()))
          .forEach(snapshot::add);
      }
      return snapshot.build();
    } finally {
      readLock.unlock();
    }
  }

  public Set<NodeStatus> nodes(Availability availability) {
    return nodes.computeIfAbsent(availability, ignored -> new HashSet<>());
  }

  @Override
  public AvailabilityAndNode findNode(NodeId id) {
    for (Map.Entry<Availability, Set<NodeStatus>> entry : nodes.entrySet()) {
      for (NodeStatus nodeStatus : entry.getValue()) {
        if (id.equals(nodeStatus.getNodeId())) {
          return new AvailabilityAndNode(entry.getKey(), nodeStatus);
        }
      }
    }
    return null;
  }

  @Override
  public NodeStatus rewrite(NodeStatus status, Availability availability) {
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

  @Override
  public void release(SessionId id) {
    if (id == null) {
      return;
    }

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      for (Map.Entry<Availability, Set<NodeStatus>> entry : nodes.entrySet()) {
        for (NodeStatus node : entry.getValue()) {
          for (Slot slot : node.getSlots()) {
            if (slot.getSession()==null) {
              continue;
            }

            if (id.equals(slot.getSession().getId())) {
              Slot released = new Slot(
                slot.getId(),
                slot.getStereotype(),
                slot.getLastStarted(),
                null);
              amend(entry.getKey(), node, released);
              return;
            }
          }
        }
      }
    } finally {
      writeLock.unlock();
    }
  }

  @Override
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

  @Override
  public void setSession(SlotId slotId, Session session) {
    Require.nonNull("Slot ID", slotId);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      AvailabilityAndNode node = findNode(slotId.getOwningNodeId());
      if (node == null) {
        LOG.warning("Grid model and reality have diverged. Unable to find node " + slotId.getOwningNodeId());
        return;
      }

      Optional<Slot> maybeSlot = node.status.getSlots().stream()
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

      Session current = maybeSession;
      if (!RESERVED.equals(current.getId())) {
        LOG.warning("Grid model and reality have diverged. Slot has session and is not reserved. " + slotId);
        return;
      }

      Slot updated = new Slot(
        slot.getId(),
        slot.getStereotype(),
        session == null ? slot.getLastStarted() : session.getStartTime(),
        session);

      amend(node.availability, node.status, updated);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void amend(Availability availability, NodeStatus status, Slot slot) {
    Set<Slot> newSlots = new HashSet<>(status.getSlots());
    newSlots.removeIf(s -> s.getId().equals(slot.getId()));
    newSlots.add(slot);

    nodes(availability).remove(status);
    nodes(availability).add(new NodeStatus(
      status.getNodeId(),
      status.getExternalUri(),
      status.getMaxSessionCount(),
      newSlots,
      status.getAvailability(),
      status.getHeartbeatPeriod(),
      status.getVersion(),
      status.getOsInfo()));
  }
}
