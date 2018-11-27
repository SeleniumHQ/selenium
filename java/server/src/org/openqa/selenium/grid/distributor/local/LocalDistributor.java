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

import static com.google.common.collect.ImmutableList.toImmutableList;

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.DistributorStatus;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.NodeStatus;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.remote.tracing.Span;

import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

public class LocalDistributor extends Distributor {

  public static final Json JSON = new Json();
  private final Set<Host> hosts = new HashSet<>();
  private final DistributedTracer tracer;

  public LocalDistributor(DistributedTracer tracer, HttpClient.Factory httpClientFactory) {
    super(tracer, httpClientFactory);
    this.tracer = Objects.requireNonNull(tracer);
  }

  @Override
  public Session newSession(NewSessionPayload payload) throws SessionNotCreatedException {
    Iterator<Capabilities> allCaps = payload.stream().iterator();
    if (!allCaps.hasNext()) {
      throw new SessionNotCreatedException("No capabilities found");
    }

    Capabilities caps = allCaps.next();
    Optional<Supplier<Session>> selected;
    synchronized (hosts) {
      selected = this.hosts.stream()
          // Find a host that supports this kind of thing
          .filter(host -> host.hasCapacity(caps))
          .min(
              // Now sort by node which has the lowest load (natural ordering)
              Comparator.comparingDouble(Host::getLoad)
                  // Then last session created (oldest first), so natural ordering again
                  .thenComparingLong(Host::getLastSessionCreated)
                  // And use the host id as a tie-breaker.
                  .thenComparing(Host::getId))
          // And reserve some space
          .map(host -> host.reserve(caps));
    }

    return selected
        .orElseThrow(
            () -> new SessionNotCreatedException("Unable to find provider for session: " + allCaps))
        .get();
  }

  @Override
  public LocalDistributor add(Node node) {
    StringBuilder sb = new StringBuilder();

    try (Span span = tracer.createSpan("distributor.add", tracer.getActiveSpan());
         JsonOutput out = JSON.newOutput(sb)) {
      out.setPrettyPrint(false).write(node);
      span.addTag("node", sb.toString());
      hosts.add(new Host(node));
    }

    return this;
  }

  @Override
  public void remove(UUID nodeId) {
    try (Span span = tracer.createSpan("distributor.remove", tracer.getActiveSpan())) {
      span.addTag("node.id", nodeId);
      hosts.removeIf(host -> nodeId.equals(host.getId()));
    }
  }

  @Override
  public DistributorStatus getStatus() {
    ImmutableList<NodeStatus> nodesStatuses = this.hosts.stream()
        .map(Host::getStatus)
        .collect(toImmutableList());

    return new DistributorStatus(nodesStatuses);
  }

}
