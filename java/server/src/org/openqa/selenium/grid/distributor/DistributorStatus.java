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

package org.openqa.selenium.grid.distributor;

import static com.google.common.collect.ImmutableList.toImmutableList;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.grid.node.NodeStatus;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public class DistributorStatus {

  private final List<NodeStatus> allNodes;

  public DistributorStatus(List<NodeStatus> allNodes) {
    this.allNodes = ImmutableList.copyOf(allNodes);
  }

  public List<NodeStatus> getNodes() {
    return allNodes;
  }


  public boolean hasCapacity() {
    return getNodes().stream()
        .map(NodeStatus::hasCapacity)
        .reduce(Boolean::logicalAnd)
        .orElse(false);
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "nodes", getNodes());
  }

  private static DistributorStatus fromJson(Map<String, Object> raw) {
    @SuppressWarnings("unchecked")
    Collection<Map<String, Object>> rawNodes = (Collection<Map<String, Object>>) raw.get("nodes");
    List<NodeStatus> nodes = rawNodes.stream()
        .map(NodeStatus::fromJson)
        .collect(toImmutableList());

    return new DistributorStatus(nodes);
  }
}
