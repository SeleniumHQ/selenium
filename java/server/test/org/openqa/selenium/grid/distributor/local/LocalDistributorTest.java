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

import com.google.common.collect.ImmutableMap;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.remote.HttpSessionId;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class LocalDistributorTest {

  private Tracer tracer;
  private EventBus bus;
  private HttpClient.Factory clientFactory;
  private URI uri;
  private Node localNode;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();

    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");
    uri = new URI("http://localhost:1234");
    localNode = LocalNode.builder(tracer, bus, uri, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .maximumConcurrentSessions(2)
        .build();
  }

  @Test
  public void testAddNodeToDistributor() {
    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus), null);
    distributor.add(localNode);
    DistributorStatus status = distributor.getStatus();

    //Check the size
    final Set<DistributorStatus.NodeSummary> nodes = status.getNodes();
    assertThat(nodes.size()).isEqualTo(1);

    //Check a couple attributes
    final DistributorStatus.NodeSummary distributorNode = nodes.iterator().next();
    assertThat(distributorNode.getNodeId()).isEqualByComparingTo(localNode.getId());
    assertThat(distributorNode.getUri()).isEqualTo(uri);
  }

  @Test
  public void testRemoveNodeFromDistributor() {
    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus), null);
    distributor.add(localNode);

    //Check the size
    DistributorStatus statusBefore = distributor.getStatus();
    final Set<DistributorStatus.NodeSummary> nodesBefore = statusBefore.getNodes();
    assertThat(nodesBefore.size()).isEqualTo(1);

    //Recheck the status--should be zero
    distributor.remove(localNode.getId());
    DistributorStatus statusAfter = distributor.getStatus();
    final Set<DistributorStatus.NodeSummary> nodesAfter = statusAfter.getNodes();
    assertThat(nodesAfter.size()).isEqualTo(0);
  }

  @Test
  public void testAddSameNodeTwice() {
    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus), null);
    distributor.add(localNode);
    distributor.add(localNode);
    DistributorStatus status = distributor.getStatus();

    //Should only be one node after dupe check
    final Set<DistributorStatus.NodeSummary> nodes = status.getNodes();
    assertThat(nodes.size()).isEqualTo(1);
  }

  @Test
  public void shouldBeAbleToAddMultipleSessionsConcurrently() throws Exception {
    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      clientFactory,
      new LocalSessionMap(tracer, bus),
      null);

    // Add one node to ensure that everything is created in that.
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");

    class VerifyingHandler extends Session implements HttpHandler {
      private VerifyingHandler(SessionId id, Capabilities capabilities) {
        super(id, uri, capabilities);
      }

      @Override
      public HttpResponse execute(HttpRequest req) {
        Optional<SessionId> id = HttpSessionId.getSessionId(req.getUri()).map(SessionId::new);
        assertThat(id).isEqualTo(Optional.of(getId()));
        return new HttpResponse();
      }
    }

    // Only use one node.
    Node node = LocalNode.builder(tracer, bus, uri, uri, null)
      .add(caps, new TestSessionFactory(VerifyingHandler::new))
      .add(caps, new TestSessionFactory(VerifyingHandler::new))
      .add(caps, new TestSessionFactory(VerifyingHandler::new))
      .build();
    distributor.add(node);

  @Test
  public void testDrainNodeFromDistributor() {
    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus), null);
    distributor.add(localNode);
    assertThat(localNode.isDraining()).isFalse();

    //Check the size - there should be one node
    DistributorStatus statusBefore = distributor.getStatus();
    final Set<DistributorStatus.NodeSummary> nodesBefore = statusBefore.getNodes();
    assertThat(nodesBefore.size()).isEqualTo(1);
    DistributorStatus.NodeSummary nodeBefore = nodesBefore.iterator().next();
    assertThat(nodeBefore.isDraining()).isFalse();

    distributor.drain(localNode.getId());
    assertThat(localNode.isDraining()).isTrue();

    //Recheck the status - there should still be one node, but it's listed as draining
    DistributorStatus statusAfter = distributor.getStatus();
    final Set<DistributorStatus.NodeSummary> nodesAfter = statusAfter.getNodes();
    assertThat(nodesAfter.size()).isEqualTo(1);

    //The node should be draining
    DistributorStatus.NodeSummary nodeAfter = nodesAfter.iterator().next();
    assertThat(nodeAfter.isDraining()).isTrue();
  }

  @Test
  public void testDrainNodeFromNode() {
    assertThat(localNode.isDraining()).isFalse();

    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus), null);
    distributor.add(localNode);

    localNode.drain();
    assertThat(localNode.isDraining()).isTrue();

    DistributorStatus statusAfter = distributor.getStatus();
    final Set<DistributorStatus.NodeSummary> nodesAfter = statusAfter.getNodes();
    assertThat(nodesAfter.size()).isEqualTo(1);

    //The node should be draining
    DistributorStatus.NodeSummary nodeAfter = nodesAfter.iterator().next();
    assertThat(nodeAfter.isDraining()).isTrue();
  }

  //Build a few Host Buckets of different sizes
  private Map<String, Set<Host>> buildBuckets(int...sizes) {
    Map<String, Set<Host>> hostBuckets = new HashMap<>();
    //The fact that it's re-using the same node doesn't matter--we're calculating "sameness"
    // based purely on the number of hosts in the Set
    HttpRequest req = new HttpRequest(HttpMethod.POST, "/session")
      .setContent(Contents.asJson(ImmutableMap.of(
        "capabilities", ImmutableMap.of(
          "alwaysMatch", ImmutableMap.of(
            "browserName", "cheese")))));


    List<Callable<SessionId>> callables = new ArrayList<>();
    for (int i = 0; i < 3; i++) {
      callables.add(() -> {
        CreateSessionResponse res = distributor.newSession(req);
        assertThat(res.getSession().getCapabilities().getBrowserName()).isEqualTo("cheese");
        return res.getSession().getId();
      });
    }

    List<Future<SessionId>> futures = Executors.newFixedThreadPool(3).invokeAll(callables);

    for (Future<SessionId> future : futures) {
      SessionId id = future.get(2, SECONDS);

      // Now send a random command.
      HttpResponse res = node.execute(new HttpRequest(GET, String.format("/session/%s/url", id)));
      assertThat(res.isSuccessful()).isTrue();
    }
  }

  private class Handler extends Session implements HttpHandler {
    private Handler(Capabilities capabilities) {
      super(new SessionId(UUID.randomUUID()), uri, capabilities);
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }
}
