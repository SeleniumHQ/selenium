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

import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class LocalDistributor extends Distributor {

  public static final Json JSON = new Json();
  private final Set<Node> nodes = new HashSet<>();
  private final DistributedTracer tracer;

  public LocalDistributor(DistributedTracer tracer, HttpClient.Factory httpClientFactory) {
    super(tracer, httpClientFactory);
    this.tracer = Objects.requireNonNull(tracer);
  }

  @Override
  public Session newSession(NewSessionPayload payload) throws SessionNotCreatedException {
    // TODO: merge in the logic from the scheduler branch so we do something smarter

    Capabilities caps = payload.stream()
        .findFirst()
        .orElseThrow(() -> new SessionNotCreatedException("No capabilities found"));

    return nodes.stream()
        .filter(node -> node.isSupporting(caps))
        .findFirst()
        .map(host -> host.newSession(caps))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .orElseThrow(() -> new SessionNotCreatedException("Unable to create new session: " + caps));
  }

  @Override
  public void add(Node node) {
    StringBuilder sb = new StringBuilder();

    try (Span span = tracer.createSpan("distributor.add", tracer.getActiveSpan());
         JsonOutput out = JSON.newOutput(sb)) {
      out.setPrettyPrint(false).write(node);
      span.addTag("node", sb.toString());
      nodes.add(node);
    }
  }

  @Override
  public void remove(UUID nodeId) {
    try (Span span = tracer.createSpan("distributor.remove", tracer.getActiveSpan())) {
      span.addTag("node.id", nodeId);
      nodes.removeIf(node -> nodeId.equals(node.getId()));
    }
  }

  @Override
  public DistributorStatus getStatus() {
    ImmutableList<NodeStatus> nodesStatuses = this.nodes.stream()
        .map(Node::getStatus)
        .collect(toImmutableList());

    return new DistributorStatus(nodesStatuses);
  }
}
