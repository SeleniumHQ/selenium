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

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.data.Availability.UP;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
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

class GreedySlotSelectorTest {

  private final Random random = new Random();
  private final GreedySlotSelector selector = new GreedySlotSelector();
  private Tracer tracer;
  private EventBus bus;
  private URI uri;

  @BeforeEach
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    uri = new URI("http://localhost:1234");
  }

  @Test
  void nodesAreOrderedByUtilizationRatio() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus highUtilization = createNode(ImmutableList.of(caps), 10, 8); // 80% utilized
    NodeStatus mediumUtilization = createNode(ImmutableList.of(caps), 10, 5); // 50% utilized
    NodeStatus lowUtilization = createNode(ImmutableList.of(caps), 10, 2); // 20% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps,
            ImmutableSet.of(lowUtilization, mediumUtilization, highUtilization),
            new DefaultSlotMatcher());

    ImmutableSet<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toImmutableSet());

    assertThat(nodeIds)
        .containsSequence(
            highUtilization.getNodeId(), mediumUtilization.getNodeId(), lowUtilization.getNodeId());
  }

  @Test
  void nodesWithSameUtilizationAreOrderedByTotalSlots() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus smallNode = createNode(ImmutableList.of(caps), 4, 2); // 50% utilized, 4 slots
    NodeStatus mediumNode = createNode(ImmutableList.of(caps), 8, 4); // 50% utilized, 8 slots
    NodeStatus largeNode = createNode(ImmutableList.of(caps), 12, 6); // 50% utilized, 12 slots

    Set<SlotId> slots =
        selector.selectSlot(
            caps, ImmutableSet.of(largeNode, mediumNode, smallNode), new DefaultSlotMatcher());

    ImmutableSet<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toImmutableSet());

    assertThat(nodeIds)
        .containsSequence(smallNode.getNodeId(), mediumNode.getNodeId(), largeNode.getNodeId());
  }

  @Test
  void nodesWithSameUtilizationAndSlotsAreOrderedByLoad() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus lowLoad = createNode(ImmutableList.of(caps), 10, 2); // 20% load
    NodeStatus mediumLoad = createNode(ImmutableList.of(caps), 10, 5); // 50% load
    NodeStatus highLoad = createNode(ImmutableList.of(caps), 10, 8); // 80% load

    Set<SlotId> slots =
        selector.selectSlot(
            caps, ImmutableSet.of(highLoad, mediumLoad, lowLoad), new DefaultSlotMatcher());

    ImmutableSet<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toImmutableSet());

    assertThat(nodeIds)
        .containsSequence(highLoad.getNodeId(), mediumLoad.getNodeId(), lowLoad.getNodeId());
  }

  @Test
  void nodesThatHaveExceededMaxSessionsAreNotSelected() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus availableNode = createNode(ImmutableList.of(caps), 10, 5); // 50% utilized
    NodeStatus fullNode = createNode(ImmutableList.of(caps), 10, 10); // 100% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps, ImmutableSet.of(fullNode, availableNode), new DefaultSlotMatcher());

    ImmutableSet<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toImmutableSet());

    assertThat(nodeIds).doesNotContain(fullNode.getNodeId());
    assertThat(nodeIds).contains(availableNode.getNodeId());
  }

  @Test
  void utilizationTakesPrecedenceOverBrowserVersion() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus oldVersionHighUtil =
        createNodeWithStereotypes(
            ImmutableList.of(ImmutableMap.of("browserName", "chrome", "browserVersion", "120.1")),
            10,
            8); // 80% utilized
    NodeStatus newVersionLowUtil =
        createNodeWithStereotypes(
            ImmutableList.of(ImmutableMap.of("browserName", "chrome", "browserVersion", "120.0")),
            10,
            2); // 20% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps, ImmutableSet.of(oldVersionHighUtil, newVersionLowUtil), new DefaultSlotMatcher());

    ImmutableSet<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toImmutableSet());

    assertThat(nodeIds)
        .containsSequence(oldVersionHighUtil.getNodeId(), newVersionLowUtil.getNodeId());
  }

  @Test
  void utilizationTakesPrecedenceOverPlatform() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus windowsHighUtil =
        createNodeWithStereotypes(
            ImmutableList.of(ImmutableMap.of("browserName", "chrome", "platformName", "WINDOWS")),
            10,
            8); // 80% utilized
    NodeStatus macLowUtil =
        createNodeWithStereotypes(
            ImmutableList.of(ImmutableMap.of("browserName", "chrome", "platformName", "MAC")),
            10,
            2); // 20% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps, ImmutableSet.of(windowsHighUtil, macLowUtil), new DefaultSlotMatcher());

    ImmutableSet<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toImmutableSet());

    assertThat(nodeIds).containsSequence(windowsHighUtil.getNodeId(), macLowUtil.getNodeId());
  }

  @Test
  void utilizationTakesPrecedenceOverMultipleCapabilities() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus basicHighUtil =
        createNodeWithStereotypes(
            ImmutableList.of(ImmutableMap.of("browserName", "chrome")), 10, 8); // 80% utilized
    NodeStatus advancedLowUtil =
        createNodeWithStereotypes(
            ImmutableList.of(
                ImmutableMap.of(
                    "browserName", "chrome",
                    "platformName", "MAC",
                    "se:recordVideo", true)),
            10,
            2); // 20% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps, ImmutableSet.of(basicHighUtil, advancedLowUtil), new DefaultSlotMatcher());

    ImmutableSet<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toImmutableSet());

    assertThat(nodeIds).containsSequence(basicHighUtil.getNodeId(), advancedLowUtil.getNodeId());
  }

  private NodeStatus createNode(List<Capabilities> stereotypes, int count, int currentLoad) {
    return createNode(stereotypes, count, currentLoad, 0.0);
  }

  private NodeStatus createNode(
      List<Capabilities> stereotypes, int count, int currentLoad, double load) {
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
                    new Session(
                        new SessionId(UUID.randomUUID()), uri, stereotype, stereotype, now)));
          }

          for (int i = 0; i < count - currentLoad; i++) {
            slots.add(
                new Slot(new SlotId(nodeId, UUID.randomUUID()), stereotype, Instant.EPOCH, null));
          }
        });

    return new NodeStatus(
        nodeId,
        uri,
        count,
        ImmutableSet.copyOf(slots),
        UP,
        Duration.ofSeconds(10),
        Duration.ofSeconds(300),
        "4.0.0",
        ImmutableMap.of(
            "name", "Max OS X",
            "arch", "x86_64",
            "version", "10.15.7"));
  }

  private NodeStatus createNodeWithStereotypes(List<ImmutableMap> stereotypes) {
    URI uri = createUri();
    LocalNode.Builder nodeBuilder =
        LocalNode.builder(tracer, bus, uri, uri, new Secret("cornish yarg"));
    nodeBuilder.maximumConcurrentSessions(stereotypes.size());
    stereotypes.forEach(
        stereotype -> {
          Capabilities caps = new ImmutableCapabilities(stereotype);
          nodeBuilder.add(caps, new TestSessionFactory((id, c) -> new Handler(c)));
        });
    Node myNode = nodeBuilder.build();
    return myNode.getStatus();
  }

  private NodeStatus createNodeWithStereotypes(
      List<ImmutableMap> stereotypes, int count, int currentLoad) {
    NodeId nodeId = new NodeId(UUID.randomUUID());
    URI uri = createUri();

    Set<Slot> slots = new HashSet<>();
    stereotypes.forEach(
        stereotype -> {
          Capabilities caps = new ImmutableCapabilities(stereotype);
          for (int i = 0; i < currentLoad; i++) {
            Instant now = Instant.now();
            slots.add(
                new Slot(
                    new SlotId(nodeId, UUID.randomUUID()),
                    caps,
                    now,
                    new Session(new SessionId(UUID.randomUUID()), uri, caps, caps, now)));
          }

          for (int i = 0; i < count - currentLoad; i++) {
            slots.add(new Slot(new SlotId(nodeId, UUID.randomUUID()), caps, Instant.EPOCH, null));
          }
        });

    return new NodeStatus(
        nodeId,
        uri,
        count,
        ImmutableSet.copyOf(slots),
        UP,
        Duration.ofSeconds(10),
        Duration.ofSeconds(300),
        "4.0.0",
        ImmutableMap.of(
            "name", "Max OS X",
            "arch", "x86_64",
            "version", "10.15.7"));
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
      super(
          new SessionId(UUID.randomUUID()),
          uri,
          new ImmutableCapabilities(),
          capabilities,
          Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }
}
