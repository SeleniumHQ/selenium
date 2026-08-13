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

package org.openqa.selenium.grid.data;

import static java.util.Collections.unmodifiableSet;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.openqa.selenium.internal.Require;

public class DistributorStatus {

  private final Set<NodeStatus> allNodes;

  // Constructor parameter names are used as JSON field names.
  public DistributorStatus(Collection<NodeStatus> nodes) {
    this.allNodes = unmodifiableSet(new HashSet<>(Require.nonNull("nodes", nodes)));
  }

  public boolean hasCapacity() {
    return getNodes().stream()
        .anyMatch(node -> node.getAvailability().equals(Availability.UP) && node.hasCapacity());
  }

  public Set<NodeStatus> getNodes() {
    return allNodes;
  }

  private Map<String, Object> toJson() {
    return Collections.singletonMap("nodes", getNodes());
  }
}
