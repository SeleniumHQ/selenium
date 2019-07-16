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

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;
import java.util.UUID;

public class LocalDistributorTest {
  private DistributedTracer tracer;
  private EventBus bus;
  private HttpClient.Factory clientFactory;
  private URI uri;
  private Node local;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DistributedTracer.builder().build();
    bus = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();

    class Handler extends Session implements HttpHandler {
      private Handler(Capabilities capabilities) {
        super(new SessionId(UUID.randomUUID()), uri, capabilities);
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        return new HttpResponse();
      }
    }

    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");
    uri = new URI("http://localhost:1234");
    local = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .maximumConcurrentSessions(2)
        .build();
  }

  @Test
  public void testAddNodeToDistributor() {
    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus));
    distributor.add(local);
    DistributorStatus status = distributor.getStatus();

    //Check the size
    final Set<DistributorStatus.NodeSummary> nodes = status.getNodes();
    assertThat(nodes.size()).isEqualTo(1);

    //Check a couple attributes
    final DistributorStatus.NodeSummary distributorNode = nodes.iterator().next();
    assertThat(distributorNode.getNodeId()).isEqualByComparingTo(local.getId());
    assertThat(distributorNode.getUri()).isEqualTo(uri);
  }

  @Test
  public void testRemoveNodeFromDistributor() {
    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus));
    distributor.add(local);
    DistributorStatus status = distributor.getStatus();

    //Check the size
    final Set<DistributorStatus.NodeSummary> nodes = status.getNodes();
    assertThat(nodes.size()).isEqualTo(1);
  }

}
