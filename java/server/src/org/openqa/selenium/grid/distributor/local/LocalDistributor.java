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

import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.Beta;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeAddedEvent;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeRejectedEvent;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.model.Host;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static org.openqa.selenium.grid.data.Availability.DRAINING;
import static org.openqa.selenium.grid.data.NodeDrainComplete.NODE_DRAIN_COMPLETE;
import static org.openqa.selenium.grid.data.NodeStatusEvent.NODE_STATUS;

public class LocalDistributor extends Distributor {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger("Selenium Distributor (Local)");
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final Set<Host> hosts = new HashSet<>();
  private final Tracer tracer;
  private final EventBus bus;
  private final HttpClient.Factory clientFactory;
  private final SessionMap sessions;
  private final Regularly hostChecker = new Regularly("distributor host checker");
  private final Map<NodeId, Collection<Runnable>> allChecks = new ConcurrentHashMap<>();
  private final String registrationSecret;

  public LocalDistributor(
      Tracer tracer,
      EventBus bus,
      HttpClient.Factory clientFactory,
      SessionMap sessions,
      String registrationSecret) {
    super(tracer, clientFactory, new DefaultSlotSelector(), sessions);
    this.tracer = Require.nonNull("Tracer", tracer);
    this.bus = Require.nonNull("Event bus", bus);
    this.clientFactory = Require.nonNull("HTTP client factory", clientFactory);
    this.sessions = Require.nonNull("Session map", sessions);
    this.registrationSecret = registrationSecret;

    bus.addListener(NODE_STATUS, event -> refresh(event.getData(NodeStatus.class)));
    bus.addListener(NODE_DRAIN_COMPLETE, event -> remove(event.getData(NodeId.class)));
  }

  public static Distributor create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();
    HttpClient.Factory clientFactory = new NetworkOptions(config).getHttpClientFactory(tracer);
    SessionMap sessions = new SessionMapOptions(config).getSessionMap();
    BaseServerOptions serverOptions = new BaseServerOptions(config);

    return new LocalDistributor(tracer, bus, clientFactory, sessions, serverOptions.getRegistrationSecret());
  }

  @Override
  public boolean isReady() {
    try {
      return ImmutableSet.of(bus, sessions).parallelStream()
        .map(HasReadyState::isReady)
        .reduce(true, Boolean::logicalAnd);
    } catch (RuntimeException e) {
      return false;
    }
  }

  private void refresh(NodeStatus status) {
    Require.nonNull("Node status", status);

    LOG.fine("Refreshing: " + status.getUri());

    // check registrationSecret and stop processing if it doesn't match
    if (!Objects.equals(status.getRegistrationSecret(), registrationSecret)) {
      LOG.severe(String.format("Node at %s failed to send correct registration secret. Node NOT registered.", status.getUri()));
      bus.fire(new NodeRejectedEvent(status.getUri()));
      return;
    }

    // Iterate over the available nodes to find a match.
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Optional<Host> existingByNodeId = hosts.stream()
          .filter(host -> host.getId().equals(status.getNodeId()))
          .findFirst();

      if (existingByNodeId.isPresent()) {
        // Modify the state
        LOG.fine("Modifying existing state");
        existingByNodeId.get().update(status);
      } else {
        Optional<Host> existingByUri = hosts.stream()
          .filter(host -> host.asSummary().getUri().equals(status.getUri()))
          .findFirst();
        // There is a URI match, probably means a node was restarted. We need to remove
        // the previous one so we add the new request.
        existingByUri.ifPresent(host -> {
          LOG.fine("Removing old node, a new one is registering with the same URI");
          remove(host.getId());
        });

        // Add a new host.
        LOG.info("Creating a new remote node for " + status.getUri());
        Node node = new RemoteNode(
            tracer,
            clientFactory,
            status.getNodeId(),
            status.getUri(),
            status.getSlots().stream().map(Slot::getStereotype).collect(Collectors.toSet()));
        add(node, status);
      }
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public LocalDistributor add(Node node) {
    return add(node, node.getStatus());
  }

  private LocalDistributor add(Node node, NodeStatus status) {
    StringBuilder sb = new StringBuilder();

    Lock writeLock = this.lock.writeLock();
    writeLock.lock();
    try (JsonOutput out = JSON.newOutput(sb)) {
      out.setPrettyPrint(false).write(node);

      Host host = new Host(bus, node, registrationSecret);
      host.update(status);

      LOG.fine("Adding host: " + host.asSummary());
      hosts.add(host);

      LOG.info(String.format("Added node %s.", node.getId()));
      host.runHealthCheck();

      Runnable runnable = host::runHealthCheck;
      Collection<Runnable> nodeRunnables = allChecks.getOrDefault(node.getId(), new ArrayList<>());
      nodeRunnables.add(runnable);
      allChecks.put(node.getId(), nodeRunnables);
      hostChecker.submit(runnable, Duration.ofMinutes(5), Duration.ofSeconds(30));
    } catch (Throwable t) {
      LOG.log(Level.WARNING, "Unable to process host", t);
    } finally {
      writeLock.unlock();
      bus.fire(new NodeAddedEvent(node.getId()));
    }

    return this;
  }

  @Override
  public boolean drain(NodeId nodeId) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Optional<Host> host = hosts.stream().filter(node -> nodeId.equals(node.getId())).findFirst();
      if (host.isPresent()) {
        Availability status = host.get().drainHost();
        return DRAINING == status;
      } else {
        LOG.log(Level.WARNING, "Unable to drain the host. Host not found. Node id: {0}", nodeId);
        return false;
      }
    } finally {
      writeLock.unlock();
    }
  }

  public void remove(NodeId nodeId) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      hosts.removeIf(host -> nodeId.equals(host.getId()));
      allChecks.getOrDefault(nodeId, new ArrayList<>()).forEach(hostChecker::remove);
    } finally {
      writeLock.unlock();
      bus.fire(new NodeRemovedEvent(nodeId));
    }
  }

  @Override
  public DistributorStatus getStatus() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      ImmutableSet<DistributorStatus.NodeSummary> summaries = this.hosts.stream()
          .map(Host::asSummary)
          .collect(toImmutableSet());

      return new DistributorStatus(summaries);
    } finally {
      readLock.unlock();
    }
  }

  @Override
  public String getRegistrationSecret() {
    return registrationSecret;
  }

  @Beta
  public void refresh() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      hosts.forEach(Host::runHealthCheck);
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  protected Set<Host> getModel() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      return ImmutableSet.copyOf(hosts);
    } finally {
      readLock.unlock();
    }
  }

  @Override
  protected Supplier<CreateSessionResponse> reserve(SlotId slotId, CreateSessionRequest request) {
    Require.nonNull("Slot ID", slotId);
    Require.nonNull("New Session request", request);

    Lock writeLock = this.lock.writeLock();
    writeLock.lock();
    try {
      return hosts.stream()
        .filter(host -> slotId.getOwningNodeId().equals(host.getId()))
        .findFirst()
        .orElseThrow(() -> new SessionNotCreatedException("Unable to find host with ID " + slotId.getOwningNodeId()))
        .reserve(request);
    } finally {
      writeLock.unlock();
    }
  }
}
