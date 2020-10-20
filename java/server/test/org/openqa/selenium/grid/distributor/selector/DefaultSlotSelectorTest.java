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

package org.openqa.selenium.grid.distributor.selector;

import com.google.common.collect.ImmutableSet;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.data.Availability.UP;

public class DefaultSlotSelectorTest {

  private Tracer tracer;
  private EventBus bus;
  private URI uri;
  private Random random = new Random();

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    uri = new URI("http://localhost:1234");
  }

  @Test
  public void testGetPrioritizedNodeBuckets() {
    //build a bunch of nodes, using real values
    Set<NodeStatus> nodes = new HashSet<>();

    //Create 1 node that has edge, chrome, and firefox
    nodes.add(createNode("edge", "firefox", "chrome"));

    //Create 5 nodes that only have Chrome and Firefox
    IntStream.range(0, 4).forEach(ignore -> nodes.add(createNode("chrome", "firefox")));

    DefaultSlotSelector selector = new DefaultSlotSelector();

    //When you prioritize for Edge, you should only have 1 possibility
    Stream<NodeStatus> edgeNodes = nodes.stream()
      .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "edge")));
    Stream<NodeStatus> edgeStream = selector.getPrioritizedNodeStream(edgeNodes, new ImmutableCapabilities("browserName", "edge"))
        .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "edge")));
    assertThat(edgeStream.count()).isEqualTo(1);

    //When you prioritize for Chrome or Firefox, the Edge node will be removed, leaving 4
    Stream<NodeStatus> chromeNodes = nodes.stream()
      .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "chrome")));
    Stream<NodeStatus> chromeStream = selector.getPrioritizedNodeStream(chromeNodes, new ImmutableCapabilities("browserName", "chrome"))
        .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "chrome")));
    assertThat(chromeStream.count()).isEqualTo(4);

    Stream<NodeStatus> firefoxNodes = nodes.stream()
      .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "firefox")));
    Stream<NodeStatus> firefoxStream = selector.getPrioritizedNodeStream(firefoxNodes, new ImmutableCapabilities("browserName", "firefox"))
        .filter(host -> host.hasCapacity(new ImmutableCapabilities("browserName", "firefox")));
    assertThat(firefoxStream.count()).isEqualTo(4);
  }

  @Test
  public void testAllBucketsSameSize() {
    Map<String, Set<NodeStatus>> buckets = buildBuckets(5, 5, 5, 5, 5, 5, 5, 5, 5, 5);

    DefaultSlotSelector selector = new DefaultSlotSelector();
    assertThat(selector.allBucketsSameSize(buckets)).isTrue();
  }

  @Test
  public void testAllBucketsNotSameSize() {
    Map<String, Set<NodeStatus>> buckets = buildBuckets(3, 5, 8 );

    DefaultSlotSelector selector = new DefaultSlotSelector();
    assertThat(selector.allBucketsSameSize(buckets)).isFalse();
  }

  @Test
  public void testOneBucketStillConsideredSameSize() {
    Map<String, Set<NodeStatus>> buckets = buildBuckets(3 );

    DefaultSlotSelector selector = new DefaultSlotSelector();
    assertThat(selector.allBucketsSameSize(buckets)).isTrue();
  }

  @Test
  public void testAllBucketsNotSameSizeProveNotUsingAverage() {
    //Make sure the numbers don't just average out to the same size
    Map<String, Set<NodeStatus>> buckets = buildBuckets(4, 5, 6 );

    DefaultSlotSelector selector = new DefaultSlotSelector();
    assertThat(selector.allBucketsSameSize(buckets)).isFalse();
  }

  @Test
  public void theMostLightlyLoadedNodeIsSelectedFirst() {
    // Create enough hosts so that we avoid the scheduler returning hosts in:
    // * insertion order
    // * reverse insertion order
    // * sorted with most heavily used first

    Capabilities caps = new ImmutableCapabilities("cheese", "beyaz peynir");

    NodeStatus lightest = createNode(caps, 10, 0);
    NodeStatus medium = createNode(caps, 10, 4);
    NodeStatus heavy = createNode(caps, 10, 6);
    NodeStatus massive = createNode(caps, 10, 8);

    SlotSelector selector = new DefaultSlotSelector();
    Set<SlotId> ids = selector.selectSlot(caps, ImmutableSet.of(heavy, medium, lightest, massive));
    SlotId expected = ids.iterator().next();

    assertThat(lightest.getSlots().stream()).anyMatch(slot -> expected.equals(slot.getId()));
  }

  private NodeStatus createNode(Capabilities stereotype, int count, int currentLoad) {
    NodeId nodeId = new NodeId(UUID.randomUUID());

    URI uri = createUri();

    Set<Slot> slots = new HashSet<>();
    for (int i = 0; i < currentLoad; i++) {
      Instant now = Instant.now();
      slots.add(
        new Slot(
          new SlotId(nodeId, UUID.randomUUID()),
          stereotype,
          now,
          Optional.of(new Session(new SessionId(UUID.randomUUID()), uri, stereotype, stereotype, now))));
    }
    for (int i = 0; i < count - currentLoad; i++) {
      slots.add(
        new Slot(
          new SlotId(nodeId, UUID.randomUUID()),
          stereotype,
          Instant.EPOCH,
          Optional.empty()));
    }

    return new NodeStatus(
      nodeId,
      uri,
      count,
      ImmutableSet.copyOf(slots),
      UP);
  }

  //Create a single node with the given browserName
  private NodeStatus createNode(String...browsers) {
    URI uri = createUri();
    LocalNode.Builder nodeBuilder = LocalNode.builder(tracer, bus, uri, uri, new Secret("cornish yarg"));
    nodeBuilder.maximumConcurrentSessions(browsers.length);

    Arrays.stream(browsers).forEach(browser -> {
      Capabilities caps = new ImmutableCapabilities("browserName", browser);
      nodeBuilder.add(caps, new TestSessionFactory((id, c) -> new Handler(c)));
    });

    Node myNode = nodeBuilder.build();
    return myNode.getStatus();
  }

  //Build a few node Buckets of different sizes
  private Map<String, Set<NodeStatus>> buildBuckets(int...sizes) {
    Map<String, Set<NodeStatus>> buckets = new HashMap<>();
    //The fact that it's re-using the same node doesn't matter--we're calculating "sameness"
    // based purely on the number of nodes in the Set

    IntStream.of(sizes).forEach(count -> {
      Set<NodeStatus> nodes = new HashSet<>();
      for (int i=0; i<count; i++) {
        nodes.add(createNode(UUID.randomUUID().toString()));
      }
      buckets.put(UUID.randomUUID().toString(), nodes);
    });
    return buckets;
  }

  private URI createUri() {
    try {
      return new URI("http://localhost:" + random.nextInt());
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }

  private class Handler extends Session implements HttpHandler {
    private Handler(Capabilities capabilities) {
      super(new SessionId(UUID.randomUUID()), uri, new ImmutableCapabilities(), capabilities, Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }
}
