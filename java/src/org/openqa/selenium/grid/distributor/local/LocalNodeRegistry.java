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

import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.internal.Debug.getDebugLogLevel;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
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
import org.openqa.selenium.grid.distributor.GridModel;
import org.openqa.selenium.grid.distributor.NodeRegistry;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

/** Default implementation of {@link NodeRegistry} that keeps nodes in memory. */
public class LocalNodeRegistry implements NodeRegistry {

  private static final Logger LOG = Logger.getLogger(LocalNodeRegistry.class.getName());
  private static final SessionId RESERVED = new SessionId("reserved");

  private final Tracer tracer;
  private final EventBus bus;
  private final HttpClient.Factory clientFactory;
  private final Secret registrationSecret;
  private final Duration healthcheckInterval;
  private final GridModel model;
  private final Map<NodeId, Node> nodes;
  private final Map<NodeId, Runnable> allChecks = new ConcurrentHashMap<>();
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final ScheduledExecutorService nodeHealthCheckService;
  private final ExecutorService nodeHealthCheckExecutor;
  private final Duration purgeNodesInterval;
  private final ScheduledExecutorService purgeDeadNodesService;
  private final int newSessionThreadPoolSize;

  public LocalNodeRegistry(
      Tracer tracer,
      EventBus bus,
      int newSessionThreadPoolSize,
      HttpClient.Factory clientFactory,
      Secret registrationSecret,
      Duration healthcheckInterval,
      ScheduledExecutorService nodeHealthCheckService,
      Duration purgeNodesInterval,
      ScheduledExecutorService purgeDeadNodesService) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.clientFactory = Require.nonNull("HTTP client factory", clientFactory);
    this.registrationSecret = Require.nonNull("Registration secret", registrationSecret);
    this.healthcheckInterval = Require.nonNull("Health check interval", healthcheckInterval);
    this.nodeHealthCheckService =
        Require.nonNull("Node health check service", nodeHealthCheckService);
    this.purgeNodesInterval = Require.nonNull("Purge nodes interval", purgeNodesInterval);
    this.purgeDeadNodesService = Require.nonNull("Purge dead nodes service", purgeDeadNodesService);
    this.newSessionThreadPoolSize = newSessionThreadPoolSize;

    this.model = new LocalGridModel(bus);
    this.nodes = new ConcurrentHashMap<>();

    // Register listeners for node events
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

    // Schedule regular health checks
    this.nodeHealthCheckService.scheduleAtFixedRate(
        GuardedRunnable.guard(this::runHealthChecks),
        healthcheckInterval.toMillis(),
        healthcheckInterval.toMillis(),
        TimeUnit.MILLISECONDS);

    this.nodeHealthCheckExecutor =
        Executors.newFixedThreadPool(
            this.newSessionThreadPoolSize,
            r -> {
              Thread t = new Thread(r);
              t.setName("node-health-check-" + t.getId());
              t.setDaemon(true);
              return t;
            });

    // Schedule node purging if interval is non-zero
    if (!this.purgeNodesInterval.isZero()) {
      this.purgeDeadNodesService.scheduleAtFixedRate(
          GuardedRunnable.guard(model::purgeDeadNodes),
          this.purgeNodesInterval.getSeconds(),
          this.purgeNodesInterval.getSeconds(),
          TimeUnit.SECONDS);
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
        // A Node might be draining or down (in the case of Relay nodes)
        // but the heartbeat is still running.
        // We do not need to add this Node for now.
        return;
      }

      // A new node! Add this as a remote node, since we've not called add
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

      add(remoteNode);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public void add(Node node) {
    Require.nonNull("Node", node);

    // An exception occurs if Node heartbeat has started but the server is not ready.
    // Unhandled exception blocks the event-bus thread from processing any event henceforth.
    NodeStatus initialNodeStatus;
    Runnable healthCheck;
    try {
      initialNodeStatus = node.getStatus();
      if (initialNodeStatus.getAvailability() != UP) {
        // A Node might be draining or down (in the case of Relay nodes)
        // but the heartbeat is still running.
        // We do not need to add this Node for now.
        return;
      }
      // Extract the health check
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
    ImmutableMap<NodeId, Runnable> nodeHealthChecks;
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      nodeHealthChecks = ImmutableMap.copyOf(allChecks);
    } finally {
      readLock.unlock();
    }

    if (nodeHealthChecks.isEmpty()) {
      return;
    }

    List<Runnable> checks = new ArrayList<>(nodeHealthChecks.values());
    int total = checks.size();

    // Large deployments: process in parallel batches with controlled concurrency
    int batchSize = Math.max(10, total / 10);

    List<List<Runnable>> batches = partition(checks, batchSize);
    processBatchesInParallel(batches);
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
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return model.getSnapshot().stream()
          .filter(
              node ->
                  !DOWN.equals(node.getAvailability()) && !DRAINING.equals(node.getAvailability()))
          .collect(ImmutableSet.toImmutableSet());
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public Node getNode(NodeId id) {
    return nodes.get(id);
  }

  @Override
  public long getUpNodeCount() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return model.getSnapshot().stream()
          .filter(node -> UP.equals(node.getAvailability()))
          .collect(Collectors.toSet())
          .size();
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public long getDownNodeCount() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return model.getSnapshot().stream()
          .filter(node -> DOWN.equals(node.getAvailability()))
          .collect(Collectors.toSet())
          .size();
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public boolean isReady() {
    try {
      return ImmutableSet.of(bus).parallelStream()
          .map(HasReadyState::isReady)
          .reduce(true, Boolean::logicalAnd);
    } catch (RuntimeException e) {
      return false;
    }
  }

  private void processBatchesInParallel(List<List<Runnable>> batches) {
    if (batches.isEmpty()) {
      return;
    }

    // Process all batches with controlled parallelism
    batches.forEach(
        batch ->
            nodeHealthCheckExecutor.submit(
                () ->
                    batch.parallelStream()
                        .forEach(
                            r -> {
                              try {
                                r.run();
                              } catch (Throwable t) {
                                LOG.log(
                                    getDebugLogLevel(),
                                    "Health check execution failed in batch",
                                    t);
                              }
                            })));
  }

  private static List<List<Runnable>> partition(List<Runnable> list, int size) {
    List<List<Runnable>> batches = new ArrayList<>();
    if (list.isEmpty() || size <= 0) {
      return batches;
    }
    for (int i = 0; i < list.size(); i += size) {
      int end = Math.min(i + size, list.size());
      batches.add(new ArrayList<>(list.subList(i, end)));
    }
    return batches;
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

  /**
   * Get the GridModel used by this registry. This is primarily for use by the LocalDistributor.
   *
   * @return The GridModel instance
   */
  public GridModel getModel() {
    return model;
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

      // Try to reserve the slot in the model
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
  public void setSession(SlotId slotId, Session session) {
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
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return model.getSnapshot().stream()
          .map(NodeStatus::getSlots)
          .flatMap(Collection::stream)
          .filter(slot -> slot.getSession() != null)
          .filter(slot -> !slot.getSession().getId().equals(RESERVED))
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

  /**
   * Get a node by its URI.
   *
   * @param uri The URI of the node to find
   * @return The node if found, null otherwise
   */
  public Node getNode(URI uri) {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      Optional<NodeStatus> nodeStatus =
          model.getSnapshot().stream()
              .filter(node -> node.getExternalUri().equals(uri))
              .findFirst();

      return nodeStatus.map(status -> nodes.get(status.getNodeId())).orElse(null);
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public void close() {
    LOG.info("Shutting down LocalNodeRegistry");
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
