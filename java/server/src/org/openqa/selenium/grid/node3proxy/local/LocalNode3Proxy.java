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

package org.openqa.selenium.grid.node3proxy.local;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.node.NodeStatus;
import org.openqa.selenium.grid.node3proxy.Node3;
import org.openqa.selenium.grid.node3proxy.Node3Proxy;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.Span;

import java.net.URI;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Supplier;
import java.util.logging.Logger;

public class LocalNode3Proxy extends Node3Proxy {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger("Selenium Node3Proxy");
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final DistributedTracer tracer;
  private HttpClient.Factory httpClientFactory;
  private final Distributor distributor;
  private URI externalUri;

  public LocalNode3Proxy(DistributedTracer tracer, HttpClient.Factory httpClientFactory,
                         Distributor distributor, URI externalUri) {
    super(tracer, httpClientFactory);
    this.tracer = Objects.requireNonNull(tracer);
    this.httpClientFactory = httpClientFactory;
    this.distributor = Objects.requireNonNull(distributor);
    this.externalUri = Objects.requireNonNull(externalUri);
  }

  @Override
  public Session newSession(NewSessionPayload payload) throws SessionNotCreatedException {
    Iterator<Capabilities> allCaps = payload.stream().iterator();
    if (!allCaps.hasNext()) {
      throw new SessionNotCreatedException("No capabilities found");
    }

    Capabilities caps = allCaps.next();
    Optional<Supplier<Session>> selected;
//    Lock writeLock = this.lock.writeLock();
//    writeLock.lock();
//    try {
//      selected = this.hosts.stream()
//          .filter(host -> host.getHostStatus() == UP)
//          // Find a host that supports this kind of thing
//          .filter(host -> host.hasCapacity(caps))
//          .min(
//              // Now sort by node which has the lowest load (natural ordering)
//              Comparator.comparingDouble(Host::getLoad)
//                  // Then last session created (oldest first), so natural ordering again
//                  .thenComparingLong(Host::getLastSessionCreated)
//                  // And use the host id as a tie-breaker.
//                  .thenComparing(Host::getId))
//          // And reserve some space
//          .map(host -> host.reserve(caps));
//    } finally {
//      writeLock.unlock();
//    }
//
//    return selected
//        .orElseThrow(
//            () -> new SessionNotCreatedException("Unable to find provider for session: " + allCaps))
//        .get();
    return null;
  }

  @Override
  public LocalNode3Proxy addNode(List<MutableCapabilities> capabilities, Integer maxSession) {
    StringBuilder sb = new StringBuilder();

    Lock writeLock = this.lock.writeLock();
    writeLock.lock();
    try (Span span = tracer.createSpan("distributor.add", tracer.getActiveSpan());
         JsonOutput out = JSON.newOutput(sb)) {
      out.setPrettyPrint(false).write(capabilities);
      span.addTag("node", sb.toString());

      UUID id = UUID.randomUUID();
      distributor.add(new Node3(tracer, id, externalUri, maxSession, capabilities));

      // TODO: We should check to see what happens for duplicate nodes.
//      Host host = new Host(node);
//      hosts.add(host);
//      LOG.info(String.format("Added node %s.", node.getId()));
//      host.refresh();
//
//      Runnable runnable = host::refresh;
//      Collection<Runnable> nodeRunnables = allChecks.getOrDefault(node.getId(), new ArrayList<>());
//      nodeRunnables.add(runnable);
//      allChecks.put(node.getId(), nodeRunnables);
//      hostChecker.submit(runnable, Duration.ofMinutes(5), Duration.ofSeconds(30));
    } catch (Throwable t) {
      t.printStackTrace();
    } finally {
      writeLock.unlock();
    }

    return this;
  }

  @Override
  public NodeStatus getNodeStatus() {
    Map<Capabilities, Integer> available = new ConcurrentHashMap<>();
    Map<Capabilities, Integer> used = new ConcurrentHashMap<>();
    available.put(new ImmutableCapabilities("browserName", "firefox"), 5);

    return new NodeStatus(
        UUID.randomUUID(),
        externalUri,
        5,
        available,
        used);
  }
}
