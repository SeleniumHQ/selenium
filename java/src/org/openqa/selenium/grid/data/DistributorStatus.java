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

import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

import java.lang.reflect.Type;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static java.util.Collections.unmodifiableSet;

public class DistributorStatus {

  private static final Type NODE_STATUSES_TYPE = new TypeToken<Set<NodeStatus>>() {}.getType();

  private final Set<NodeStatus> allNodes;

  public DistributorStatus(Collection<NodeStatus> allNodes) {
    this.allNodes = unmodifiableSet(new HashSet<>(Require.nonNull("nodes", allNodes)));
  }

  public boolean hasCapacity() {
    return getNodes().stream()
        .map(node -> node.getAvailability().equals(Availability.UP) && node.hasCapacity())
        .reduce(Boolean::logicalOr)
        .orElse(false);
  }

  public Set<NodeStatus> getNodes() {
    return allNodes;
  }

  private Map<String, Object> toJson() {
    return Collections.singletonMap("nodes", getNodes());
  }

  private static DistributorStatus fromJson(JsonInput input) {
    Set<NodeStatus> nodes = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "nodes":
          nodes = input.read(NODE_STATUSES_TYPE);
          break;

        default:
          input.skipValue();
      }
    }
    input.endObject();

    return new DistributorStatus(nodes);
  }
}
