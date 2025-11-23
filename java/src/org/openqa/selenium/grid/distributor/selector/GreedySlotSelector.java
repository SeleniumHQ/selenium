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
import static org.openqa.selenium.grid.data.Availability.UP;

import java.util.Comparator;
import java.util.Set;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.SemanticVersionComparator;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.data.SlotMatcher;

/**
 * A greedy slot selector that aims to maximize node utilization by minimizing the number of
 * partially filled nodes. The algorithm works as follows: 1. Sort nodes by their utilization load
 * (descending). 2. Among nodes with the same utilization, prefer those with fewer total slots. 3.
 * Then sort by the last session created (oldest first). This approach helps to: - Fill up nodes
 * that are already partially utilized - Minimize the number of nodes that are partially filled -
 * Distribute load evenly across nodes
 */
public class GreedySlotSelector implements SlotSelector {

  public static SlotSelector create(Config config) {
    return new GreedySlotSelector();
  }

  @Override
  public Set<SlotId> selectSlot(
      Capabilities capabilities, Set<NodeStatus> nodes, SlotMatcher slotMatcher) {
    return nodes.stream()
        .filter(node -> node.hasCapacity(capabilities, slotMatcher) && node.getAvailability() == UP)
        .sorted(
            // First and foremost, sort by utilization ratio (descending)
            // This ensures we ALWAYS try to fill nodes that are already partially utilized first
            Comparator.comparingDouble(NodeStatus::getLoad)
                .reversed()
                // Then sort by total number of slots (ascending)
                // Among nodes with same utilization, prefer those with fewer total slots
                .thenComparingLong(node -> node.getSlots().size())
                // Then last session created (oldest first)
                .thenComparingLong(NodeStatus::getLastSessionCreated)
                // Then sort by stereotype browserVersion (descending order)
                .thenComparing(
                    Comparator.comparing(
                        NodeStatus::getBrowserVersion, new SemanticVersionComparator().reversed())))
        .flatMap(
            node ->
                node.getSlots().stream()
                    .filter(slot -> slot.getSession() == null)
                    .filter(slot -> slot.isSupporting(capabilities, slotMatcher))
                    .map(Slot::getId))
        .collect(toImmutableSet());
  }
}
