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

import static java.util.stream.Collectors.toUnmodifiableSet;
import static org.openqa.selenium.concurrent.ExecutorServices.shutdownGracefully;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.internal.Debug.getDebugLogLevel;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.HealthCheckFailedException;
import org.openqa.selenium.concurrent.GuardedRunnable;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeAddedEvent;
import org.openqa.selenium.grid.data.NodeDrainComplete;
import org.openqa.selenium.grid.data.NodeHeartBeatEvent;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.NodeStatusEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.distributor.NodeRegistry;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

/**
 * Redis-backed implementation of {@link NodeRegistry}. Node HTTP proxy objects are kept in
 * JVM-local memory (a live network connection cannot be serialized), but all grid model state is
 * delegated to {@link RedisBackedGridModel}.
 *
 * <p>Multiple Distributor replicas can share the same Redis instance. Health checks are coordinated
 * via Redis leader-election locks so each node is checked exactly once per cycle across all
 * replicas.
 */
public class RedisBackedNodeRegistry implements NodeRegistry {

  private static final Logger LOG = Logger.getLogger(RedisBackedNodeRegistry.class.getName());

  /** Unique identifier for this JVM instance, used in health-check leader-election locks. */
  private final String instanceId = UUID.randomUUID().toString();

  private final Tracer tracer;
  private final EventBus bus;
  private final HttpClient.Factory clientFactory;
  private final Secret registrationSecret;
  private final Duration healthcheckInterval;
  private final RedisBackedGridModel model;
  private final GridRedisClient redis;

  // JVM-local map of live Node proxy objects — cannot be stored in Redis.
  private final Map<NodeId, Node> nodes = new ConcurrentHashMap<>();
  private final Map<NodeId, Runnable> allChecks = new ConcurrentHashMap<>();
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final ScheduledExecutorService nodeHealthCheckService;
  private final ExecutorService nodeHealthCheckExecutor;
  private final Duration purgeNodesInterval;
  private final ScheduledExecutorService purgeDeadNodesService;
  private final AtomicBoolean healthChecksInProgress = new AtomicBoolean(false);

  public RedisBackedNodeRegistry(
      Tracer tracer,
      EventBus bus,
      HttpClient.Factory clientFactory,
      Secret registrationSecret,
      Duration healthcheckInterval,
      ScheduledExecutorService nodeHealthCheckService,
      Duration purgeNodesInterval,
      ScheduledExecutorService purgeDeadNodesService,
      GridRedisClient redis) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.clientFactory = Require.nonNull("HTTP client factory", clientFactory);
    this.registrationSecret = Require.nonNull("Registration secret", registrationSecret);
    this.healthcheckInterval = Require.nonNull("Health check interval", healthcheckInterval);
    this.nodeHealthCheckService =
        Require.nonNull("Node health check service", nodeHealthCheckService);
    this.purgeNodesInterval = Require.nonNull("Purge nodes interval", purgeNodesInterval);
    this.purgeDeadNodesService = Require.nonNull("Purge dead nodes service", purgeDeadNodesService);
    this.redis = Require.nonNull("Redis client", redis);

    this.model = new RedisBackedGridModel(redis, bus);

    // Register event listeners — identical to LocalNodeRegistry.
    this.bus.addListener(NodeStatusEvent.listener(this::register));
    this.bus.addListener(NodeStatusEvent.listener(model::refresh));
    this.bus.addListener(
        NodeRestartedEvent.listener(previousNodeStatus -> remove(previousNodeStatus.getNodeId())));
    this.bus.addListener(NodeRemovedEvent.listener(nodeStatus -> remove(nodeStatus.getNodeId())));
    this.bus.addListener(NodeDrainComplete.listener(this::remove));
    this.bus.addListener(
        NodeHeartBeatEvent.listener(
            nodeStatus -> {
              if (nodes.containsKey(nodeStatus.getNodeId())) {
                model.touch(nodeStatus);
              } else {
                register(nodeStatus);
              }
            }));

    // Rebuild local proxy map from Redis on startup so this replica is immediately usable.
    reconstructLocalNodesFromRedis();

    // Schedule health checks with distributed leader election.
    this.nodeHealthCheckService.scheduleAtFixedRate(
        GuardedRunnable.guard(this::runHealthChecks),
        healthcheckInterval.toMillis(),
        healthcheckInterval.toMillis(),
        TimeUnit.MILLISECONDS);

    this.nodeHealthCheckExecutor =
        Executors.newCachedThreadPool(
            r -> {
              Thread t = new Thread(r);
              t.setName("node-health-check-" + t.getId());
              t.setDaemon(true);
              return t;
            });

    if (!this.purgeNodesInterval.isZero()) {
      this.purgeDeadNodesService.scheduleAtFixedRate(
          GuardedRunnable.guard(model::purgeDeadNodes),
          this.purgeNodesInterval.getSeconds(),
          this.purgeNodesInterval.getSeconds(),
          TimeUnit.SECONDS);
    }
  }

  /**
   * Reads all UP and DRAINING nodes from Redis and creates RemoteNode proxy objects so this replica
   * can immediately participate in scheduling and health checks.
   */
  private void reconstructLocalNodesFromRedis() {
    Set<NodeId> upIds = redis.getNodesByAvailability(UP);
    Set<NodeId> drainingIds = redis.getNodesByAvailability(DRAINING);
    Set<NodeId> toReconstruct = new java.util.HashSet<>();
    toReconstruct.addAll(upIds);
    toReconstruct.addAll(drainingIds);

    for (NodeId id : toReconstruct) {
      try {
        String raw = redis.get("grid:node:" + id + ":status");
        if (raw == null) {
          continue;
        }
        org.openqa.selenium.json.Json json = new org.openqa.selenium.json.Json();
        NodeStatus status = json.toType(raw, NodeStatus.class);
        if (nodes.containsKey(id)) {
          continue;
        }
        RemoteNode remoteNode =
            new RemoteNode(
                tracer,
                clientFactory,
                status.getNodeId(),
                status.getExternalUri(),
                registrationSecret,
                status.getSessionTimeout(),
                status.getSlots().stream()
                    .map(slot -> slot.getStereotype())
                    .collect(Collectors.toSet()));
        Lock writeLock = lock.writeLock();
        writeLock.lock();
        try {
          nodes.put(id, remoteNode);
          allChecks.put(id, asRunnableHealthCheck(remoteNode));
        } finally {
          writeLock.unlock();
        }
        LOG.info(
            String.format(
                "Reconstructed node %s at %s from Redis on startup", id, status.getExternalUri()));
      } catch (Exception e) {
        LOG.log(
            Level.WARNING, "Failed to reconstruct node " + id + " from Redis: " + e.getMessage());
      }
    }
  }

  @Override
  public void register(NodeStatus status) {
    Require.nonNull("Node", status);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      if (nodes.containsKey(status.getNodeId())) {
        return;
      }
      if (status.getAvailability() != UP) {
        return;
      }
      RemoteNode remoteNode =
          new RemoteNode(
              tracer,
              clientFactory,
              status.getNodeId(),
              status.getExternalUri(),
              registrationSecret,
              status.getSessionTimeout(),
              status.getSlots().stream()
                  .map(slot -> slot.getStereotype())
                  .collect(Collectors.toSet()));
      nodes.put(status.getNodeId(), remoteNode);
      model.add(status);
      allChecks.put(status.getNodeId(), asRunnableHealthCheck(remoteNode));
    } finally {
      writeLock.unlock();
    }

    updateNodeAvailability(status.getExternalUri(), status.getNodeId(), status.getAvailability());

    LOG.info(
        String.format(
            "Added node %s at %s. Health check every %ss",
            status.getNodeId(), status.getExternalUri(), healthcheckInterval.toMillis() / 1000));

    bus.fire(new NodeAddedEvent(status.getNodeId()));
  }

  @Override
  public void add(Node node) {
    Require.nonNull("Node", node);

    NodeStatus initialNodeStatus;
    Runnable healthCheck;
    try {
      initialNodeStatus = node.getStatus();
      if (initialNodeStatus.getAvailability() != UP) {
        return;
      }
      healthCheck = asRunnableHealthCheck(node);
      Lock writeLock = lock.writeLock();
      writeLock.lock();
      try {
        nodes.put(node.getId(), node);
        model.add(initialNodeStatus);
        allChecks.put(node.getId(), healthCheck);
      } finally {
        writeLock.unlock();
      }
    } catch (Exception e) {
      LOG.log(
          getDebugLogLevel(), String.format("Exception while adding Node %s", node.getUri()), e);
      return;
    }

    updateNodeAvailability(
        initialNodeStatus.getExternalUri(),
        initialNodeStatus.getNodeId(),
        initialNodeStatus.getAvailability());

    LOG.info(
        String.format(
            "Added node %s at %s. Health check every %ss",
            node.getId(), node.getUri(), healthcheckInterval.toMillis() / 1000));

    bus.fire(new NodeAddedEvent(node.getId()));
  }

  @Override
  public void remove(NodeId nodeId) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Node node = nodes.remove(nodeId);
      model.remove(nodeId);
      allChecks.remove(nodeId);

      if (node instanceof RemoteNode) {
        try {
          ((RemoteNode) node).close();
        } catch (Exception e) {
          LOG.log(Level.WARNING, "Unable to close node properly: " + e.getMessage());
        }
      }
      LOG.info(String.format("Node %s removed and all resources cleaned up", nodeId));
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public boolean drain(NodeId nodeId) {
    Node node = nodes.get(nodeId);
    if (node == null) {
      LOG.info("Asked to drain unregistered node " + nodeId);
      return false;
    }

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      node.drain();
      model.setAvailability(nodeId, DRAINING);
    } finally {
      writeLock.unlock();
    }

    return node.isDraining();
  }

  @Override
  public void updateNodeAvailability(URI nodeUri, NodeId id, Availability availability) {
    Require.nonNull("Node URI", nodeUri);
    Require.nonNull("Node ID", id);
    Require.nonNull("Availability", availability);

    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      LOG.log(
          getDebugLogLevel(),
          String.format("Health check result for %s was %s", nodeUri, availability));
      model.setAvailability(id, availability);
      model.updateHealthCheckCount(id, availability);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void runHealthChecks() {
    if (!healthChecksInProgress.compareAndSet(false, true)) {
      LOG.log(getDebugLogLevel(), "Skipping health checks because previous cycle is still running");
      return;
    }

    Map<NodeId, Runnable> nodeHealthChecks;
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      nodeHealthChecks = Map.copyOf(allChecks);
    } finally {
      readLock.unlock();
    }

    try {
      if (nodeHealthChecks.isEmpty()) {
        return;
      }

      List<Future<?>> futures = new ArrayList<>(nodeHealthChecks.size());
      nodeHealthChecks.forEach(
          (nodeId, check) -> {
            // Distributed leader election: only the replica that wins the lock runs this check.
            long lockTtlMillis = healthcheckInterval.toMillis() + 30_000L;
            boolean won =
                redis.setIfAbsent("grid:healthcheck:lock:" + nodeId, instanceId, lockTtlMillis);
            if (!won) {
              LOG.log(
                  getDebugLogLevel(),
                  "Another replica is handling health check for node {0}, skipping",
                  nodeId);
              return;
            }
            try {
              futures.add(nodeHealthCheckExecutor.submit(() -> runHealthCheck(nodeId, check)));
            } catch (RejectedExecutionException e) {
              LOG.log(
                  getDebugLogLevel(),
                  String.format(
                      "Unable to schedule health check for node %s, running in caller thread",
                      nodeId),
                  e);
              runHealthCheck(nodeId, check);
            }
          });

      for (Future<?> future : futures) {
        try {
          future.get();
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          break;
        } catch (Exception e) {
          LOG.log(getDebugLogLevel(), "Error waiting for health check execution", e);
        }
      }
    } finally {
      healthChecksInProgress.set(false);
    }
  }

  @Override
  public void refresh() {
    List<Runnable> allHealthChecks = new ArrayList<>();
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      allHealthChecks.addAll(allChecks.values());
    } finally {
      readLock.unlock();
    }
    allHealthChecks.parallelStream().forEach(Runnable::run);
  }

  @Override
  public DistributorStatus getStatus() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return new DistributorStatus(model.getSnapshot());
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public Set<NodeStatus> getAvailableNodes() {
    return getUpNodes().stream().filter(NodeStatus::hasCapacity).collect(toUnmodifiableSet());
  }

  @Override
  public Set<NodeStatus> getUpNodes() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return model.getSnapshot().stream()
          .filter(node -> UP.equals(node.getAvailability()))
          .collect(toUnmodifiableSet());
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public Node getNode(NodeId id) {
    return nodes.get(id);
  }

  @Nullable
  @Override
  public Node getNode(URI uri) {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      Optional<NodeStatus> nodeStatus =
          model.getSnapshot().stream()
              .filter(node -> uri.equals(node.getExternalUri()))
              .findFirst();
      return nodeStatus.map(status -> nodes.get(status.getNodeId())).orElse(null);
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public long getUpNodeCount() {
    return redis.getNodesByAvailability(UP).size();
  }

  @Override
  public long getDownNodeCount() {
    return redis.getNodesByAvailability(DOWN).size();
  }

  @Override
  public boolean isReady() {
    try {
      return Set.of(bus).parallelStream()
          .map(HasReadyState::isReady)
          .reduce(true, Boolean::logicalAnd);
    } catch (RuntimeException e) {
      return false;
    }
  }

  private void runHealthCheck(NodeId nodeId, Runnable check) {
    try {
      check.run();
    } catch (Throwable t) {
      LOG.log(getDebugLogLevel(), "Health check execution failed for node " + nodeId, t);
    }
  }

  private Runnable asRunnableHealthCheck(Node node) {
    HealthCheck healthCheck = node.getHealthCheck();
    NodeId id = node.getId();
    return () -> {
      boolean checkFailed = false;
      Exception failedCheckException = null;
      LOG.log(getDebugLogLevel(), "Running healthcheck for Node " + node.getUri());

      HealthCheck.Result result;
      try {
        result = healthCheck.check();
      } catch (Exception e) {
        LOG.log(Level.WARNING, "Unable to process Node healthcheck " + id, e);
        result = new HealthCheck.Result(DOWN, "Unable to run healthcheck. Assuming down");
        checkFailed = true;
        failedCheckException = e;
      }

      updateNodeAvailability(node.getUri(), id, result.getAvailability());
      if (checkFailed) {
        throw new HealthCheckFailedException("Node " + id, failedCheckException);
      }
    };
  }

  @Override
  public boolean reserve(SlotId slotId) {
    Require.nonNull("Slot ID", slotId);

    Lock writeLock = this.lock.writeLock();
    writeLock.lock();
    try {
      NodeId nodeId = slotId.getOwningNodeId();
      Node node = nodes.get(nodeId);
      if (node == null) {
        LOG.log(getDebugLogLevel(), String.format("Unable to find node with id %s", slotId));
        return false;
      }
      try {
        return model.reserve(slotId);
      } catch (Exception e) {
        LOG.log(
            Level.WARNING,
            String.format("Unable to reserve slot %s: %s", slotId, e.getMessage()),
            e);
        return false;
      }
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void setSession(SlotId slotId, @Nullable Session session) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      model.setSession(slotId, session);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public int getActiveSlots() {
    SessionId reserved = RedisBackedGridModel.RESERVED;
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return model.getSnapshot().stream()
          .map(NodeStatus::getSlots)
          .flatMap(Collection::stream)
          .filter(slot -> slot.getSession() != null)
          .filter(slot -> !slot.getSession().getId().equals(reserved))
          .mapToInt(slot -> 1)
          .sum();
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public int getIdleSlots() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return (int)
          (model.getSnapshot().stream().flatMap(status -> status.getSlots().stream()).count()
              - getActiveSlots());
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public void close() {
    LOG.info("Shutting down RedisBackedNodeRegistry");
    shutdownGracefully("Redis Distributor - Node Health Check Worker", nodeHealthCheckExecutor);
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      allChecks.clear();
      nodes
          .values()
          .forEach(
              n -> {
                if (n instanceof RemoteNode) {
                  try {
                    ((RemoteNode) n).close();
                  } catch (Exception e) {
                    LOG.log(Level.WARNING, "Unable to close node properly: " + e.getMessage());
                  }
                }
              });
      nodes.clear();
    } finally {
      writeLock.unlock();
    }
  }
}
