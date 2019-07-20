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

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static org.openqa.selenium.grid.data.NodeStatusEvent.NODE_STATUS;
import static org.openqa.selenium.grid.distributor.local.Host.Status.UP;
import static org.openqa.selenium.remote.http.Contents.reader;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.Span;

import java.io.IOException;
import java.io.Reader;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Supplier;
import java.util.logging.Logger;
import java.util.stream.Collectors;

public class LocalDistributor extends Distributor {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger("Selenium Distributor");
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final Set<Host> hosts = new HashSet<>();
  private final DistributedTracer tracer;
  private final EventBus bus;
  private final HttpClient.Factory clientFactory;
  private final SessionMap sessions;
  private final Regularly hostChecker = new Regularly("distributor host checker");
  private final Map<UUID, Collection<Runnable>> allChecks = new ConcurrentHashMap<>();

  public LocalDistributor(
      DistributedTracer tracer,
      EventBus bus,
      HttpClient.Factory clientFactory,
      SessionMap sessions) {
    super(tracer, clientFactory);
    this.tracer = Objects.requireNonNull(tracer);
    this.bus = Objects.requireNonNull(bus);
    this.clientFactory = Objects.requireNonNull(clientFactory);
    this.sessions = Objects.requireNonNull(sessions);

    bus.addListener(NODE_STATUS, event -> refresh(event.getData(NodeStatus.class)));
  }

  @Override
  public CreateSessionResponse newSession(HttpRequest request)
      throws SessionNotCreatedException {
    try (Reader reader = reader(request);
    NewSessionPayload payload = NewSessionPayload.create(reader)) {
      Objects.requireNonNull(payload, "Requests to process must be set.");

      Iterator<Capabilities> iterator = payload.stream().iterator();

      if (!iterator.hasNext()) {
        throw new SessionNotCreatedException("No capabilities found");
      }

      Optional<Supplier<CreateSessionResponse>> selected;
      CreateSessionRequest firstRequest = new CreateSessionRequest(
          payload.getDownstreamDialects(),
          iterator.next(),
          ImmutableMap.of());

      Lock writeLock = this.lock.writeLock();
      writeLock.lock();
      try {
        selected = this.hosts.stream()
            .filter(host -> host.getHostStatus() == UP)
            // Find a host that supports this kind of thing
            .filter(host -> host.hasCapacity(firstRequest.getCapabilities()))
            .min(
                // Now sort by node which has the lowest load (natural ordering)
                Comparator.comparingDouble(Host::getLoad)
                    // Then last session created (oldest first), so natural ordering again
                    .thenComparingLong(Host::getLastSessionCreated)
                    // And use the host id as a tie-breaker.
                    .thenComparing(Host::getId))
            // And reserve some space
            .map(host -> host.reserve(firstRequest));
      } finally {
        writeLock.unlock();
      }

      CreateSessionResponse sessionResponse = selected
          .orElseThrow(
              () -> new SessionNotCreatedException(
                  "Unable to find provider for session: " + payload.stream()
                      .map(Capabilities::toString)
                      .collect(Collectors.joining(", "))))
          .get();

      sessions.add(sessionResponse.getSession());

      return sessionResponse;
    } catch (IOException e) {
      throw new SessionNotCreatedException(e.getMessage(), e);
    }
  }

  private void refresh(NodeStatus status) {
    Objects.requireNonNull(status);

    // Iterate over the available nodes to find a match.
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Optional<Host> existing = hosts.stream()
          .filter(host -> host.getId().equals(status.getNodeId()))
          .findFirst();


      if (existing.isPresent()) {
        // Modify the state
        existing.get().update(status);
      } else {
        // No match made. Add a new host.
        Node node = new RemoteNode(
            tracer,
            clientFactory,
            status.getNodeId(),
            status.getUri(),
            status.getStereotypes().keySet());
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
    try (Span span = tracer.createSpan("distributor.add", tracer.getActiveSpan());
         JsonOutput out = JSON.newOutput(sb)) {
      out.setPrettyPrint(false).write(node);
      span.addTag("node", sb.toString());

      Host host = new Host(bus, node);
      host.update(status);
      hosts.add(host);
      LOG.info(String.format("Added node %s.", node.getId()));
      host.runHealthCheck();

      Runnable runnable = host::runHealthCheck;
      Collection<Runnable> nodeRunnables = allChecks.getOrDefault(node.getId(), new ArrayList<>());
      nodeRunnables.add(runnable);
      allChecks.put(node.getId(), nodeRunnables);
      hostChecker.submit(runnable, Duration.ofMinutes(5), Duration.ofSeconds(30));
    } finally {
      writeLock.unlock();
    }

    return this;
  }

  @Override
  public void remove(UUID nodeId) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try (Span span = tracer.createSpan("distributor.remove", tracer.getActiveSpan())) {
      span.addTag("node.id", nodeId);
      hosts.removeIf(host -> nodeId.equals(host.getId()));
      allChecks.getOrDefault(nodeId, new ArrayList<>()).forEach(hostChecker::remove);
    } finally {
      writeLock.unlock();
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

  @VisibleForTesting
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
}
