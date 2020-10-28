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
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;

import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.google.common.collect.ImmutableSet.toImmutableSet;

public class DefaultSlotSelector implements SlotSelector {

  private static final Logger LOG = Logger.getLogger(DefaultSlotSelector.class.getName());

  @Override
  public Set<SlotId> selectSlot(Capabilities capabilities, Set<NodeStatus> nodes) {
    Stream<NodeStatus> firstRound = nodes.stream()
      // Find a node that supports this kind of thing
      .filter(node -> node.hasCapacity(capabilities));

    // of the nodes that survived the first round, separate into buckets and prioritize by browser "rarity"
    Stream<NodeStatus> prioritizedNodes = getPrioritizedNodeStream(firstRound, capabilities);

    //Take the further-filtered Stream and prioritize by load, then by session age

    return prioritizedNodes
      .sorted(
        // Now sort by node which has the lowest load (natural ordering)
        Comparator.comparingDouble(NodeStatus::getLoad)
          // Then last session created (oldest first), so natural ordering again
          .thenComparingLong(NodeStatus::getLastSessionCreated)
          // And use the node id as a tie-breaker.
          .thenComparing(NodeStatus::getId))
      .flatMap(node -> node.getSlots().stream()
        .filter(slot -> !slot.getSession().isPresent())
        .filter(slot -> slot.isSupporting(capabilities))
        .map(Slot::getId))
      .collect(toImmutableSet());
  }

  /**
   * Takes a Stream of NodeStatus, along with the Capabilities of the current request, and prioritizes the
   * request by removing NodeStatus that offer Capabilities that are more rare. e.g. if there are only a
   * couple Edge nodes, but a lot of Chrome nodes, the Edge nodes should be removed from
   * consideration when Chrome is requested. This does not currently take the amount of load on the
   * server into consideration--it only checks for availability, not how much availability
   *
   * @param nodes        Stream of nodestatus attached to the Distributor (assume it's filtered for only those that offer these Capabilities)
   * @param capabilities Passing in the whole Capabilities object will allow us to prioritize more than just browser
   * @return Stream of distinct NodeStatus with the more rare Capabilities removed
   */
  @VisibleForTesting
  Stream<NodeStatus> getPrioritizedNodeStream(Stream<NodeStatus> nodes, Capabilities capabilities) {
    //TODO for the moment, we're not going to operate on the Stream that was passed in--we need to
    // alter and futz with the contents, so the stream isn't the right place to operate. This
    // will likely be optimized back into the algo, but not yet
    Set<NodeStatus> filteredNodeSet = nodes.collect(Collectors.toSet());

    //A "bucket" is a list of nodes that can use a particular browser. The "edge" bucket is the
    // complete list of nodes that support "edge". By separating nodes into buckets, we will
    // know which browsers have fewer nodes available for the browsers we're not interested in, and
    // can prioritize based on the browsers that have more availability
    Map<String, Set<NodeStatus>> nodeBuckets = sortNodesToBucketsByBrowser(filteredNodeSet);

    //First, check to see if all buckets are the same size. If they are, just send back the full list of nodes
    // (i.e. the nodes are all "balanced" with regard to browser priority)
    if (allBucketsSameSize(nodeBuckets)) {
      return nodeBuckets.values().stream().distinct().flatMap(Set::stream);
    }

    //Then, starting with the smallest bucket that isn't the current browser being prioritized,
    // remove all nodes in that bucket from consideration, then rebuild the buckets. Then do the
    // "same size" check again, and keep doing this until either a) there is only one bucket, or b)
    // all buckets are the same size

    //Note: there should never be a case where a bucket will have *more* nodes available for the
    // given browser than the one being requested. The first filter in this check looks for
    // "equal", not "equal-or-greater" as a result of this assumption

    //There might be unforeseen cases that challenge this assumption. TODO Create unit tests to prove it

    //TODO a List of Map.Entry is silly. whatever this structure needs to be needs to be returned by
    // the sortHostsToBucketsByBrowser method in a way that we don't have to sort it separately like this
    final List<Map.Entry<String, Set<NodeStatus>>> sorted = nodeBuckets.entrySet().stream().sorted(
      Comparator.comparingInt(v -> v.getValue().size())
    ).collect(Collectors.toList());

    // Until the buckets are the same size, keep removing nodes that have more "rare" browser capabilities
    Map<String, Set<NodeStatus>> newNodeBuckets;
    for (Map.Entry<String, Set<NodeStatus>> entry : sorted) {
      //Don't examine the bucket containing the browser in question--we're prioritizing the other browsers
      //TODO This shouldn't be necessary, because if the list is sorted by size, this won't be possible until
      // they're all the same size. Create a unit test to prove it
      if (entry.getKey().equals(capabilities.getBrowserName())) {
        continue;
      }

      //Remove all nodes from this bucket from the full set of eligible nodes
      final Set<NodeStatus> filteredNodes = filteredNodeSet.stream()
        .filter(node -> !entry.getValue().contains(node))
        .collect(Collectors.toSet());

      //Rebuild the buckets by browser
      newNodeBuckets = sortNodesToBucketsByBrowser(filteredNodes);

      //Check the bucket sizes--if they're the same, then we're done
      if (allBucketsSameSize(newNodeBuckets)) {
        LOG.fine("Nodes have been balanced according to browser priority");
        return newNodeBuckets.values().stream().distinct().flatMap(Set::stream);
      }
    }

    return nodeBuckets.values().stream().distinct().flatMap(Set::stream);
  }

  Map<String, Set<NodeStatus>> sortNodesToBucketsByBrowser(Set<NodeStatus> nodes) {
    //Make a hash of browserType -> list of nodes that support it
    Map<String, Set<NodeStatus>> buckets = new HashMap<>();

    for (NodeStatus node : nodes) {
      for (Slot slot : node.getSlots()) {
        String name = Optional.ofNullable(slot.getStereotype().getBrowserName()).orElse("");
        buckets.computeIfAbsent(name, n -> new LinkedHashSet<>()).add(node);
      }
    }

    return buckets;
  }

  @VisibleForTesting
  boolean allBucketsSameSize(Map<String, Set<NodeStatus>> buckets) {
    Set<Integer> intSet = new HashSet<>();
    buckets.values().forEach(bucket -> intSet.add(bucket.size()));
    return intSet.size() == 1;
  }
}
