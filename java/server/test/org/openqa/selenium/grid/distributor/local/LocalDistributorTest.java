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

import com.google.common.annotations.VisibleForTesting;

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
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;
import java.util.stream.Stream;

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

    //Check the size
    DistributorStatus statusBefore = distributor.getStatus();
    final Set<DistributorStatus.NodeSummary> nodesBefore = statusBefore.getNodes();
    assertThat(nodesBefore.size()).isEqualTo(1);

    //Recheck the status--should be zero
    distributor.remove(local.getId());
    DistributorStatus statusAfter = distributor.getStatus();
    final Set<DistributorStatus.NodeSummary> nodesAfter = statusAfter.getNodes();
    assertThat(nodesAfter.size()).isEqualTo(0);
  }

  @Test
  public void testAddSameNodeTwice() {
    Distributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus));
    distributor.add(local);
    distributor.add(local);
    DistributorStatus status = distributor.getStatus();

    //Should only be one node after dupe check
    final Set<DistributorStatus.NodeSummary> nodes = status.getNodes();
    assertThat(nodes.size()).isEqualTo(1);
  }

  @Test
  public void testGetPrioritizedHostBuckets() {
    //build a bunch of hosts, using real values
    Set<Host> hosts = new HashSet<>();

    //Create 1 node that has edge, chrome, and firefox
    hosts.add(createHost("edge", "firefox", "chrome"));

    //Create 5 nodes that only have Chrome and Firefox
    IntStream.range(0, 4).forEach(ignore ->
      hosts.add(createHost("chrome", "firefox"))
    );

    //We're not doing anything with this distributor, it's just here so we can call the method we're testing
    LocalDistributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus));

    //When you prioritize for Edge, you should only have 1 possibility
    Stream<Host> edgeHosts = hosts.stream().filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "edge")));
    final Stream<Host> edgeStream = distributor.getPrioritizedHostStream(edgeHosts, new ImmutableCapabilities("browserName", "edge"))
        .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "edge")));
    assertThat(edgeStream.count()).isEqualTo(1);

    //When you prioritize for Chrome or Firefox, the Edge node will be removed, leaving 4
    Stream<Host> chromeHosts = hosts.stream().filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "chrome")));
    final Stream<Host> chromeStream = distributor.getPrioritizedHostStream(chromeHosts, new ImmutableCapabilities("browserName", "chrome"))
        .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "chrome")));
    assertThat(chromeStream.count()).isEqualTo(4);

    Stream<Host> firefoxHosts = hosts.stream().filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "firefox")));
    final Stream<Host> firefoxStream = distributor.getPrioritizedHostStream(firefoxHosts, new ImmutableCapabilities("browserName", "firefox"))
        .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "firefox")));
    assertThat(firefoxStream.count()).isEqualTo(4);
  }

  @Test
  public void testAllBucketsSameSize() {
    Map<String, Set<Host>> hostBuckets = buildBuckets(5, 5, 5, 5, 5, 5, 5, 5, 5, 5);

    LocalDistributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus));
    assertThat(distributor.allBucketsSameSize(hostBuckets)).isTrue();
  }

  @Test
  public void testAllBucketsNotSameSize() {
    Map<String, Set<Host>> hostBuckets = buildBuckets(3, 5, 8 );

    LocalDistributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus));
    assertThat(distributor.allBucketsSameSize(hostBuckets)).isFalse();
  }

  @Test
  public void testOneBucketStillConsideredSameSize() {
    Map<String, Set<Host>> hostBuckets = buildBuckets(3 );

    LocalDistributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus));
    assertThat(distributor.allBucketsSameSize(hostBuckets)).isTrue();
  }

  @Test
  public void testAllBucketsNotSameSizeProveNotUsingAverage() {
    //Make sure the numbers don't just average out to the same size
    Map<String, Set<Host>> hostBuckets = buildBuckets(4, 5, 6 );

    LocalDistributor distributor = new LocalDistributor(tracer, bus, clientFactory, new LocalSessionMap(tracer, bus));
    assertThat(distributor.allBucketsSameSize(hostBuckets)).isFalse();
  }

  //Build a few Host Buckets of different sizes
  private Map<String, Set<Host>> buildBuckets(int...sizes) {
    Map<String, Set<Host>> hostBuckets = new HashMap<>();
    //The fact that it's re-using the same node doesn't matter--we're calculating "sameness"
    // based purely on the number of hosts in the Set

    IntStream.of(sizes).forEach(count -> {
      Set<Host> hostSet = new HashSet<>();
      for (int i=0; i<count; i++) {
        hostSet.add(createHost(UUID.randomUUID().toString()));
      }
      hostBuckets.put(UUID.randomUUID().toString(), hostSet);
    });
    return hostBuckets;
  }

  //Create a single host with the given browserName
  private Host createHost(String...browsers) {
    URI uri = createUri();
    LocalNode.Builder nodeBuilder = LocalNode.builder(tracer, bus, clientFactory, uri);
    nodeBuilder.maximumConcurrentSessions(browsers.length);

    Arrays.stream(browsers).forEach(browser -> {
      Capabilities caps = new ImmutableCapabilities("browserName", browser);
        nodeBuilder.add(caps, new TestSessionFactory((id, c) -> new Handler(c)));
    });

    Node myNode = nodeBuilder.build();
    return new Host(bus, myNode);
  }

  private URI createUri() {
    try {
      return new URI("http://localhost:" + PortProber.findFreePort());
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
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

  private class HandledSession extends Session implements HttpHandler {

    HandledSession(URI uri, Capabilities caps) {
      super(new SessionId(UUID.randomUUID()), uri, caps);
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      // no-op
      return new HttpResponse();
    }
  }

}
