package org.openqa.selenium.grid.distributor.gridmodel.redis;

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
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.SessionId;

import java.net.URI;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.joining;
import static java.util.stream.Collectors.toSet;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;

public class RedisGridModel implements GridModel {

  private static final Logger LOG = Logger.getLogger(RedisGridModel.class.getName());
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final EventBus events;
  private final GridRedisClient redisClient;

  public RedisGridModel(EventBus events, URI redisServerUri) {
    this.events = Require.nonNull("Event bus", events);
    Require.nonNull("Redis Server URI", redisServerUri);
    this.redisClient = new GridRedisClient(redisServerUri);

    this.events.addListener(NodeDrainStarted.listener(nodeId -> setAvailability(nodeId, DRAINING)));
    this.events.addListener(SessionClosedEvent.listener(this::release));
  }

  public static GridModel create(Config config) {
    EventBus bus = new EventBusOptions(config).getEventBus();
    RedisGridModelOptions options = new RedisGridModelOptions(config);

    return new RedisGridModel(bus, options.getRedisServerUri());
  }

  @Override
  public void add(NodeStatus node) {
    Require.nonNull("Node", node);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      // If the ID is the same, we're re-adding a node. If the URI is the same a node probably restarted
      if (redisClient.getNode(node.getNodeId()).isPresent()) {
        LOG.info(String.format("Re-adding node with id %s and URI %s.", node.getNodeId(), node.getExternalUri()));
        for (Availability availability : Availability.values()) {
          redisClient.removeNodeAvailability(availability, node);
        }
      }

      redisClient.addNode(node);
      redisClient.addNodeAvailability(Availability.DOWN, node);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void refresh(NodeStatus node) {
    Require.nonNull("Node status", node);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      AvailabilityAndNode availabilityAndNode = findNode(node.getNodeId());

      if (availabilityAndNode == null) {
        return;
      }

      if (DOWN.equals(availabilityAndNode.availability)) {
        redisClient.removeNodeAvailability(DOWN, availabilityAndNode.status);
        redisClient.addNode(availabilityAndNode.status);
        redisClient.addNodeAvailability(DOWN, availabilityAndNode.status);
      }

      redisClient.removeNodeAvailability(availabilityAndNode.availability, availabilityAndNode.status);
      redisClient.addNode(node);
      redisClient.addNodeAvailability(node.getAvailability(), node);
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
        // Update the current state of the Node
        redisClient.addNode(availabilityAndNode.status);
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

      redisClient.removeNodeAvailability(availabilityAndNode.availability, availabilityAndNode.status);
      redisClient.removeNode(id);
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
      Set<NodeId> up = redisClient.getNodesByAvailability(UP);
      Set<NodeStatus> upNodes = redisClient.getNodes(up);
      Set<NodeStatus> lost = upNodes.stream()
        .filter(status -> now - status.touched() > status.heartbeatPeriod().toMillis() * 2)
        .collect(toSet());

      Set<NodeId> down = redisClient.getNodesByAvailability(DOWN);
      Set<NodeStatus> downNodes = redisClient.getNodes(down);
      Set<NodeStatus> resurrected = downNodes.stream()
        .filter(status -> now - status.touched() <= status.heartbeatPeriod().toMillis())
        .collect(toSet());

      Set<NodeStatus> dead = downNodes.stream()
        .filter(status -> now - status.touched() > status.heartbeatPeriod().toMillis() * 4)
        .collect(toSet());

      if (lost.size() > 0) {
        LOG.info(String.format(
          "Switching nodes %s from UP to DOWN",
          lost.stream()
            .map(node -> String.format("%s (uri: %s)", node.getNodeId(), node.getExternalUri()))
            .collect(joining(", "))));
        Set<NodeId> lostNodeIds = lost.stream()
          .map(NodeStatus::getNodeId).collect(Collectors.toSet());

        redisClient.removeAllNodeAvailability(UP, lostNodeIds);
        redisClient.addAllNodeAvailability(DOWN, lostNodeIds);
      }

      if (resurrected.size() > 0) {
        LOG.info(String.format(
          "Switching nodes %s from DOWN to UP",
          resurrected.stream()
            .map(node -> String.format("%s (uri: %s)", node.getNodeId(), node.getExternalUri()))
            .collect(joining(", "))));

        Set<NodeId> resurrectedNodeIds = resurrected.stream()
          .map(NodeStatus::getNodeId).collect(Collectors.toSet());
        redisClient.removeAllNodeAvailability(DOWN, resurrectedNodeIds);
        redisClient.addAllNodeAvailability(UP, resurrectedNodeIds);
      }

      if (dead.size() > 0) {
        LOG.info(String.format(
          "Removing nodes %s that are DOWN for too long",
          dead.stream()
            .map(node -> String.format("%s (uri: %s)", node.getNodeId(), node.getExternalUri()))
            .collect(joining(", "))));
        Set<NodeId> deadNodeIds = dead.stream()
          .map(NodeStatus::getNodeId).collect(Collectors.toSet());
        redisClient.removeAllNodeAvailability(DOWN, deadNodeIds);
        redisClient.removeAllNodes(deadNodeIds);
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

      redisClient.removeNodeAvailability(availabilityAndNode.availability, availabilityAndNode.status);
      redisClient.addNodeAvailability(availability, availabilityAndNode.status);

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

      Arrays.stream(Availability.values()).forEach(availability -> {
        Set<NodeId> nodeIds = redisClient.getNodesByAvailability(availability);
        Set<NodeStatus> nodes = redisClient.getNodes(nodeIds);
        nodes.stream()
          .map(status -> rewrite(status, availability))
          .forEach(snapshot::add);
      });

      return snapshot.build();
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public void release(SessionId id) {
    if (id == null) {
      return;
    }

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Set<NodeId> nodes = redisClient.getAllNodes();
      for (NodeId nodeId : nodes) {
        AvailabilityAndNode availabilityAndNode = findNode(nodeId);
        NodeStatus node = availabilityAndNode.status;
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
            amend(availabilityAndNode.availability, node, released);
            return;
          }
        }
      }
    } finally {
      writeLock.unlock();
    }
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
  public AvailabilityAndNode findNode(NodeId nodeId) {
    for (Availability availability : Availability.values()) {
      if (redisClient.getNodeAvailability(availability, nodeId)) {
        Optional<NodeStatus> maybeNode = redisClient.getNode(nodeId);
        if (maybeNode.isPresent()) {
          return new AvailabilityAndNode(availability, maybeNode.get());
        }
      }
    }
    return null;
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
  public void amend(Availability availability, NodeStatus status, Slot slot) {
    Set<Slot> newSlots = new HashSet<>(status.getSlots());
    newSlots.removeIf(s -> s.getId().equals(slot.getId()));
    newSlots.add(slot);

    redisClient.removeNodeAvailability(availability, status);
    NodeStatus updatedStatus = new NodeStatus(
      status.getNodeId(),
      status.getExternalUri(),
      status.getMaxSessionCount(),
      newSlots,
      status.getAvailability(),
      status.heartbeatPeriod(),
      status.getVersion(),
      status.getOsInfo());
    redisClient.addNode(updatedStatus);
    redisClient.addNodeAvailability(availability, updatedStatus);
  }

  @Override
  public NodeStatus rewrite(NodeStatus status, Availability availability) {
    return new NodeStatus(
      status.getNodeId(),
      status.getExternalUri(),
      status.getMaxSessionCount(),
      status.getSlots(),
      availability,
      status.heartbeatPeriod(),
      status.getVersion(),
      status.getOsInfo());
  }

  public GridRedisClient getRedisClient() {
    return redisClient;
  }
}
