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

package org.openqa.selenium.grid.distributor.model;

import static org.openqa.selenium.grid.distributor.model.Host.Status.UP;

import com.google.common.annotations.VisibleForTesting;

import org.openqa.selenium.Capabilities;

import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class NodeSelector {

  private static final Logger LOG = Logger.getLogger("Selenium Node Selector");

  public NodeSelector() {
  }

  public Optional<Host> selectNode(Capabilities capabilities, Set<Host> hosts) {
    Optional<Host> selected;
    Stream<Host> firstRound = hosts.stream()
        .filter(host -> host.getHostStatus() == UP)
        // Find a host that supports this kind of thing
        .filter(host -> host.hasCapacity(capabilities));

    //of the hosts that survived the first round, separate into buckets and prioritize by browser "rarity"
    Stream<Host> prioritizedHosts = getPrioritizedHostStream(firstRound, capabilities);

    //Take the further-filtered Stream and prioritize by load, then by session age
    selected = prioritizedHosts
        .min(
            // Now sort by node which has the lowest load (natural ordering)
            Comparator.comparingDouble(Host::getLoad)
                // Then last session created (oldest first), so natural ordering again
                .thenComparingLong(Host::getLastSessionCreated)
                // And use the host id as a tie-breaker.
                .thenComparing(Host::getId));
          // And reserve some space for this session
//          .map(host -> host.reserve(firstRequest));
    return selected;
  }

  /**
   * Takes a Stream of Hosts, along with the Capabilities of the current request, and prioritizes the
   * request by removing Hosts that offer Capabilities that are more rare. e.g. if there are only a
   * couple Edge nodes, but a lot of Chrome nodes, the Edge nodes should be removed from
   * consideration when Chrome is requested. This does not currently take the amount of load on the
   * server into consideration--it only checks for availability, not how much availability
   * @param hostStream Stream of hosts attached to the Distributor (assume it's filtered for only those that offer these Capabilities)
   * @param capabilities Passing in the whole Capabilities object will allow us to prioritize more than just browser
   * @return Stream of distinct Hosts with the more rare Capabilities removed
   */
  @VisibleForTesting
  Stream<Host> getPrioritizedHostStream(Stream<Host> hostStream, Capabilities capabilities) {
    //TODO for the moment, we're not going to operate on the Stream that was passed in--we need to
    // alter and futz with the contents, so the stream isn't the right place to operate. This
    // will likely be optimized back into the algo, but not yet
    Set<Host> filteredHostSet = hostStream.collect(Collectors.toSet());

    //A "bucket" is a list of hosts that can use a particular browser. The "edge" bucket is the
    // complete list of Hosts that support "edge". By separating Hosts into buckets, we will
    // know which browsers have fewer nodes available for the browsers we're not interested in, and
    // can prioritize based on the browsers that have more availability
    Map<String, Set<Host>> hostBuckets = sortHostsToBucketsByBrowser(filteredHostSet);

    //First, check to see if all buckets are the same size. If they are, just send back the full list of hosts
    // (i.e. the hosts are all "balanced" with regard to browser priority)
    if (allBucketsSameSize(hostBuckets)) {
      return hostBuckets.values().stream().distinct().flatMap(Set::stream);
    }

    //Then, starting with the smallest bucket that isn't the current browser being prioritized,
    // remove all hosts in that bucket from consideration, then rebuild the buckets. Then do the
    // "same size" check again, and keep doing this until either a) there is only one bucket, or b)
    // all buckets are the same size

    //Note: there should never be a case where a bucket will have *more* nodes available for the
    // given browser than the one being requested. The first filter in this check looks for
    // "equal", not "equal-or-greater" as a result of this assumption

    //There might be unforeseen cases that challenge this assumption. TODO Create unit tests to prove it

    //TODO a List of Map.Entry is silly. whatever this structure needs to be needs to be returned by
    // the sortHostsToBucketsByBrowser method in a way that we don't have to sort it separately like this
    final List<Map.Entry<String, Set<Host>>> sorted = hostBuckets.entrySet().stream().sorted(
        Comparator.comparingInt(v -> v.getValue().size())
    ).collect(Collectors.toList());

    // Until the buckets are the same size, keep removing hosts that have more "rare" browser capabilities
    Map<String, Set<Host>> newHostBuckets;
    for (Map.Entry<String, Set<Host>> entry: sorted) {
      //Don't examine the bucket containing the browser in question--we're prioritizing the other browsers
      //TODO This shouldn't be necessary, because if the list is sorted by size, this won't be possible until
      // they're all the same size. Create a unit test to prove it
      if (entry.getKey().equals(capabilities.getBrowserName())) {
        continue;
      }

      //Remove all hosts from this bucket from the full set of eligible hosts
      final Set<Host> filteredHosts = filteredHostSet.stream().filter(host -> !entry.getValue().contains(host)).collect(Collectors.toSet());

      //Rebuild the buckets by browser
      newHostBuckets = sortHostsToBucketsByBrowser(filteredHosts);

      //Check the bucket sizes--if they're the same, then we're done
      if (allBucketsSameSize(newHostBuckets)) {
        LOG.fine("Hosts have been balanced according to browser priority");
        return newHostBuckets.values().stream().distinct().flatMap(Set::stream);
      }
    }

    return hostBuckets.values().stream().distinct().flatMap(Set::stream);
  }

  Map<String, Set<Host>> sortHostsToBucketsByBrowser(Set<Host> hostSet) {
    //Make a hash of browserType -> list of hosts that support it
    Map<String, Set<Host>> hostBuckets = new HashMap<>();
    hostSet.forEach(host -> host.asSummary().getStereotypes().forEach((k, v) -> {
      if (!hostBuckets.containsKey(k.getBrowserName())) {
        Set<Host> newSet = new HashSet<>();
        newSet.add(host);
        hostBuckets.put(k.getBrowserName(), newSet);
      }
      hostBuckets.get(k.getBrowserName()).add(host);
    }));
    return hostBuckets;
  }

  @VisibleForTesting
  boolean allBucketsSameSize(Map<String, Set<Host>> hostBuckets) {
    Set<Integer> intSet = new HashSet<>();
    hostBuckets.values().forEach(bucket ->  intSet.add(bucket.size()));
    return intSet.size() == 1;
  }
}
