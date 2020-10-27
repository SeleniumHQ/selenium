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

package org.openqa.selenium.grid.graphql;

import com.google.common.base.Suppliers;
import com.google.common.collect.ImmutableList;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.data.DistributorStatus;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.internal.Require;

import java.net.URI;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;

public class Grid {

  private final URI uri;
  private final Supplier<DistributorStatus> distributorStatus;

  public Grid(Distributor distributor, URI uri) {
    Require.nonNull("Distributor", distributor);
    this.uri = Require.nonNull("Grid's public URI", uri);
    this.distributorStatus = Suppliers.memoize(distributor::getStatus);
  }

  public URI getUri() {
    return uri;
  }

  public List<Node> getNodes() {
    ImmutableList.Builder<Node> toReturn = ImmutableList.builder();

    for (NodeStatus status : distributorStatus.get().getNodes()) {
      Map<Capabilities, Integer> capabilities = new HashMap<>();
      Set<org.openqa.selenium.grid.data.Session> sessions = new HashSet<>();

      for (Slot slot : status.getSlots()) {
        slot.getSession().ifPresent(sessions::add);
        int count = capabilities.getOrDefault(slot.getStereotype(), 0);
        count++;
        capabilities.put(slot.getStereotype(), count);
      }

      toReturn.add(new Node(
        status.getId(),
        status.getUri(),
        status.getAvailability(),
        status.getMaxSessionCount(),
        capabilities,
        sessions));
    }

    return toReturn.build();
  }

  public int getSessionCount() {
    return distributorStatus.get().getNodes().stream()
      .map(NodeStatus::getSlots)
      .flatMap(Collection::stream)
      .filter(slot -> slot.getSession().isPresent())
      .mapToInt(slot -> 1)
      .sum();
  }

  public int getTotalSlots() {
    return distributorStatus.get().getNodes().stream()
      .mapToInt(status -> {
        int slotCount = status.getSlots().size();
        return Math.min(status.getMaxSessionCount(), slotCount);
      })
      .sum();
  }

  public int getUsedSlots() {
    return getSessionCount();
  }
}
