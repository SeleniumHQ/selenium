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

import com.google.common.annotations.VisibleForTesting;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;

import java.util.Comparator;
import java.util.Set;

import static com.google.common.collect.ImmutableSet.toImmutableSet;

public class DefaultSlotSelector implements SlotSelector {

  public static SlotSelector create(Config config) {
    return new DefaultSlotSelector();
  }

  @Override
  public Set<SlotId> selectSlot(Capabilities capabilities, Set<NodeStatus> nodes) {
    // First, filter the Nodes that support the required capabilities. Then, the filtered Nodes
    // get ordered in ascendant order by the number of browsers they support.
    // With this, Nodes with diverse configurations (supporting many browsers, e.g. Chrome,
    // Firefox, Safari) are placed at the bottom so they have more availability when a session
    // requests a browser supported only by a few Nodes (e.g. Safari only supported on macOS
    // Nodes).
    // After that, Nodes are ordered by their load, last session creation, and their id.
    return nodes.stream()
      .filter(node -> node.hasCapacity(capabilities))
      .sorted(
        Comparator.comparingLong(this::getNumberOfSupportedBrowsers)
        // Now sort by node which has the lowest load (natural ordering)
          .thenComparingDouble(NodeStatus::getLoad)
          // Then last session created (oldest first), so natural ordering again
          .thenComparingLong(NodeStatus::getLastSessionCreated)
          // And use the node id as a tie-breaker.
          .thenComparing(NodeStatus::getNodeId))
      .flatMap(node -> node.getSlots().stream()
        .filter(slot -> slot.getSession() == null)
        .filter(slot -> slot.isSupporting(capabilities))
        .map(Slot::getId))
      .collect(toImmutableSet());
  }

  @VisibleForTesting
  long getNumberOfSupportedBrowsers(NodeStatus nodeStatus) {
    return nodeStatus.getSlots()
      .stream()
      .map(slot -> slot.getStereotype().getBrowserName().toLowerCase())
      .distinct()
      .count();
  }
}
