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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
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
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.data.Availability.UP;

public class DefaultSlotSelectorTest {

  private final Random random = new Random();
  private final DefaultSlotSelector selector = new DefaultSlotSelector();
  private Tracer tracer;
  private EventBus bus;
  private URI uri;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    uri = new URI("http://localhost:1234");
  }

  @Test
  public void numberOfSupportedBrowsersByNodeIsCorrect() {
    NodeStatus nodeStatus = createNode("edge", "firefox", "chrome");
    long supportedBrowsersByNode = selector.getNumberOfSupportedBrowsers(nodeStatus);
    assertThat(supportedBrowsersByNode).isEqualTo(3);
    nodeStatus = createNode("edge", "chrome");
    supportedBrowsersByNode = selector.getNumberOfSupportedBrowsers(nodeStatus);
    assertThat(supportedBrowsersByNode).isEqualTo(2);
    nodeStatus = createNode("chrome");
    supportedBrowsersByNode = selector.getNumberOfSupportedBrowsers(nodeStatus);
    assertThat(supportedBrowsersByNode).isEqualTo(1);
  }

  @Test
  public void nodesAreOrderedNodesByNumberOfSupportedBrowsers() {
    Set<NodeStatus> nodes = new HashSet<>();

    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus threeBrowsers = createNode("edge", "firefox", "chrome");
    NodeStatus twoBrowsers = createNode("firefox", "chrome");
    NodeStatus oneBrowser = createNode("chrome");
    nodes.add(threeBrowsers);
    nodes.add(twoBrowsers);
    nodes.add(oneBrowser);

    Set<SlotId> slots = selector.selectSlot(caps, nodes);

    ImmutableSet<NodeId> nodeIds = slots.stream()
      .map(SlotId::getOwningNodeId)
      .distinct()
      .collect(toImmutableSet());

    assertThat(nodeIds)
      .containsSequence(oneBrowser.getNodeId(), twoBrowsers.getNodeId(), threeBrowsers.getNodeId());
  }

  @Test
  public void theMostLightlyLoadedNodeIsSelectedFirst() {
    // Create enough hosts so that we avoid the scheduler returning hosts in:
    // * insertion order
    // * reverse insertion order
    // * sorted with most heavily used first

    Capabilities caps = new ImmutableCapabilities("cheese", "beyaz peynir");

    NodeStatus lightest = createNode(Collections.singletonList(caps), 10, 0);
    NodeStatus medium = createNode(Collections.singletonList(caps), 10, 4);
    NodeStatus heavy = createNode(Collections.singletonList(caps), 10, 6);
    NodeStatus massive = createNode(Collections.singletonList(caps), 10, 8);

    Set<SlotId> ids = selector.selectSlot(caps, ImmutableSet.of(heavy, medium, lightest, massive));
    SlotId expected = ids.iterator().next();

    assertThat(lightest.getSlots().stream()).anyMatch(slot -> expected.equals(slot.getId()));
  }

  @Test
  public void nodesAreOrderedByNumberOfSupportedBrowsersAndLoad() {
    Capabilities chrome = new ImmutableCapabilities("browserName", "chrome");
    Capabilities firefox = new ImmutableCapabilities("browserName", "firefox");
    Capabilities safari = new ImmutableCapabilities("browserName", "safari");

    NodeStatus lightLoadAndThreeBrowsers =
      createNode(ImmutableList.of(chrome, firefox, safari), 12, 2);
    NodeStatus mediumLoadAndTwoBrowsers =
      createNode(ImmutableList.of(chrome, firefox), 12, 5);
    NodeStatus mediumLoadAndOtherTwoBrowsers =
      createNode(ImmutableList.of(safari, chrome), 12, 6);
    NodeStatus highLoadAndOneBrowser =
      createNode(ImmutableList.of(chrome), 12, 8);

    Set<SlotId> ids = selector.selectSlot(
      chrome,
      ImmutableSet.of(
        lightLoadAndThreeBrowsers,
        mediumLoadAndTwoBrowsers,
        mediumLoadAndOtherTwoBrowsers,
        highLoadAndOneBrowser));

    // The slot should belong to the Node with high load because it only supports Chrome, leaving
    // the other Nodes with more availability for other browsers
    SlotId expected = ids.iterator().next();
    assertThat(highLoadAndOneBrowser.getSlots().stream())
      .anyMatch(slot -> expected.equals(slot.getId()));

    // Nodes are ordered by the diversity of supported browsers, then by load
    ImmutableSet<NodeId> nodeIds = ids.stream()
      .map(SlotId::getOwningNodeId)
      .distinct()
      .collect(toImmutableSet());
    assertThat(nodeIds)
      .containsSequence(
        highLoadAndOneBrowser.getNodeId(),
        mediumLoadAndTwoBrowsers.getNodeId(),
        mediumLoadAndOtherTwoBrowsers.getNodeId(),
        lightLoadAndThreeBrowsers.getNodeId());
  }

  private NodeStatus createNode(List<Capabilities> stereotypes, int count, int currentLoad) {
    NodeId nodeId = new NodeId(UUID.randomUUID());

    URI uri = createUri();

    Set<Slot> slots = new HashSet<>();
    stereotypes.forEach(
      stereotype -> {
        for (int i = 0; i < currentLoad; i++) {
          Instant now = Instant.now();
          slots.add(
            new Slot(
              new SlotId(nodeId, UUID.randomUUID()),
              stereotype,
              now,
              new Session(new SessionId(UUID.randomUUID()), uri, stereotype, stereotype, now)));
        }

        for (int i = 0; i < count - currentLoad; i++) {
          slots.add(
            new Slot(
              new SlotId(nodeId, UUID.randomUUID()),
              stereotype,
              Instant.EPOCH,
              null));
        }
      }
    );

    return new NodeStatus(
      nodeId,
      uri,
      count,
      ImmutableSet.copyOf(slots),
      UP,
      Duration.ofSeconds(10),
      "4.0.0",
      ImmutableMap.of(
        "name", "Max OS X",
        "arch", "x86_64",
        "version", "10.15.7"));
  }

  private NodeStatus createNode(String... browsers) {
    URI uri = createUri();
    LocalNode.Builder nodeBuilder = LocalNode.builder(
      tracer,
      bus,
      uri,
      uri,
      new Secret("cornish yarg"));
    nodeBuilder.maximumConcurrentSessions(browsers.length);

    Arrays.stream(browsers).forEach(browser -> {
      Capabilities caps = new ImmutableCapabilities("browserName", browser);
      nodeBuilder.add(caps, new TestSessionFactory((id, c) -> new Handler(c)));
    });

    Node myNode = nodeBuilder.build();
    return myNode.getStatus();
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
