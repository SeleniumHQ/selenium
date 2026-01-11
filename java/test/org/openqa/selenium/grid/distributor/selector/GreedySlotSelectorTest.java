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

import static java.util.Collections.unmodifiableSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.internal.Sets.sequencedSetOf;
import static org.openqa.selenium.internal.Sets.toSequencedSet;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.remote.SessionId;

class GreedySlotSelectorTest {

  private final Random random = new Random();
  private final GreedySlotSelector selector = new GreedySlotSelector();

  @Test
  void nodesAreOrderedByUtilizationRatio() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus highUtilization = createNode(List.of(caps), 10, 8); // 80% utilized
    NodeStatus mediumUtilization = createNode(List.of(caps), 10, 5); // 50% utilized
    NodeStatus lowUtilization = createNode(List.of(caps), 10, 2); // 20% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps,
            sequencedSetOf(lowUtilization, mediumUtilization, highUtilization),
            new DefaultSlotMatcher());

    Set<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toSequencedSet());

    assertThat(nodeIds)
        .containsSequence(
            highUtilization.getNodeId(), mediumUtilization.getNodeId(), lowUtilization.getNodeId());
  }

  @Test
  void nodesWithSameUtilizationAreOrderedByTotalSlots() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus smallNode = createNode(List.of(caps), 4, 2); // 50% utilized, 4 slots
    NodeStatus mediumNode = createNode(List.of(caps), 8, 4); // 50% utilized, 8 slots
    NodeStatus largeNode = createNode(List.of(caps), 12, 6); // 50% utilized, 12 slots

    Set<SlotId> slots =
        selector.selectSlot(
            caps, sequencedSetOf(largeNode, mediumNode, smallNode), new DefaultSlotMatcher());

    Set<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toSequencedSet());

    assertThat(nodeIds)
        .containsSequence(smallNode.getNodeId(), mediumNode.getNodeId(), largeNode.getNodeId());
  }

  @Test
  void nodesWithSameUtilizationAndSlotsAreOrderedByLoad() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus lowLoad = createNode(List.of(caps), 10, 2); // 20% load
    NodeStatus mediumLoad = createNode(List.of(caps), 10, 5); // 50% load
    NodeStatus highLoad = createNode(List.of(caps), 10, 8); // 80% load

    Set<SlotId> slots =
        selector.selectSlot(
            caps, sequencedSetOf(highLoad, mediumLoad, lowLoad), new DefaultSlotMatcher());

    Set<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toSequencedSet());

    assertThat(nodeIds)
        .containsSequence(highLoad.getNodeId(), mediumLoad.getNodeId(), lowLoad.getNodeId());
  }

  @Test
  void nodesThatHaveExceededMaxSessionsAreNotSelected() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus availableNode = createNode(List.of(caps), 10, 5); // 50% utilized
    NodeStatus fullNode = createNode(List.of(caps), 10, 10); // 100% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps, sequencedSetOf(fullNode, availableNode), new DefaultSlotMatcher());

    Set<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toSequencedSet());

    assertThat(nodeIds).doesNotContain(fullNode.getNodeId());
    assertThat(nodeIds).contains(availableNode.getNodeId());
  }

  @Test
  void utilizationTakesPrecedenceOverBrowserVersion() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus oldVersionHighUtil =
        createNodeWithStereotypes(
            List.of(Map.of("browserName", "chrome", "browserVersion", "120.1")),
            10,
            8); // 80% utilized
    NodeStatus newVersionLowUtil =
        createNodeWithStereotypes(
            List.of(Map.of("browserName", "chrome", "browserVersion", "120.0")),
            10,
            2); // 20% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps, sequencedSetOf(oldVersionHighUtil, newVersionLowUtil), new DefaultSlotMatcher());

    Set<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toSequencedSet());

    assertThat(nodeIds)
        .containsSequence(oldVersionHighUtil.getNodeId(), newVersionLowUtil.getNodeId());
  }

  @Test
  void utilizationTakesPrecedenceOverPlatform() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus windowsHighUtil =
        createNodeWithStereotypes(
            List.of(Map.of("browserName", "chrome", "platformName", "WINDOWS")),
            10,
            8); // 80% utilized
    NodeStatus macLowUtil =
        createNodeWithStereotypes(
            List.of(Map.of("browserName", "chrome", "platformName", "MAC")), 10, 2); // 20% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps, sequencedSetOf(windowsHighUtil, macLowUtil), new DefaultSlotMatcher());

    Set<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toSequencedSet());

    assertThat(nodeIds).containsSequence(windowsHighUtil.getNodeId(), macLowUtil.getNodeId());
  }

  @Test
  void utilizationTakesPrecedenceOverMultipleCapabilities() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");

    NodeStatus basicHighUtil =
        createNodeWithStereotypes(List.of(Map.of("browserName", "chrome")), 10, 8); // 80% utilized
    NodeStatus advancedLowUtil =
        createNodeWithStereotypes(
            List.of(
                Map.of(
                    "browserName", "chrome",
                    "platformName", "MAC",
                    "se:recordVideo", true)),
            10,
            2); // 20% utilized

    Set<SlotId> slots =
        selector.selectSlot(
            caps, sequencedSetOf(basicHighUtil, advancedLowUtil), new DefaultSlotMatcher());

    Set<NodeId> nodeIds =
        slots.stream().map(SlotId::getOwningNodeId).distinct().collect(toSequencedSet());

    assertThat(nodeIds).containsSequence(basicHighUtil.getNodeId(), advancedLowUtil.getNodeId());
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
        unmodifiableSet(slots),
        UP,
        Duration.ofSeconds(10),
        Duration.ofSeconds(300),
        "4.0.0",
        Map.of(
            "name", "Max OS X",
            "arch", "x86_64",
            "version", "10.15.7"));
  }

  private NodeStatus createNodeWithStereotypes(
      List<Map<?, ?>> stereotypes, int count, int currentLoad) {
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
        unmodifiableSet(slots),
        UP,
        Duration.ofSeconds(10),
        Duration.ofSeconds(300),
        "4.0.0",
        Map.of(
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
}
