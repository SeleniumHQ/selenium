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

import static java.util.Collections.unmodifiableMap;

import java.io.Serializable;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.UUID;
import org.openqa.selenium.internal.Require;

public class SlotId implements Serializable {

  private final NodeId nodeId;
  private final UUID uuid;

  // Constructor parameter names are used as JSON field names.
  public SlotId(NodeId hostId, UUID id) {
    this.nodeId = Require.nonNull("Host id", hostId);
    this.uuid = Require.nonNull("Actual id", id);
  }

  public NodeId getOwningNodeId() {
    return nodeId;
  }

  public UUID getSlotId() {
    return uuid;
  }

  @Override
  public String toString() {
    return "SlotId{nodeId=" + nodeId + ", id=" + uuid + '}';
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof SlotId)) {
      return false;
    }
    SlotId that = (SlotId) o;
    return Objects.equals(this.nodeId, that.nodeId) && Objects.equals(this.uuid, that.uuid);
  }

  @Override
  public int hashCode() {
    return Objects.hash(nodeId, uuid);
  }

  private Object toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("hostId", nodeId);
    toReturn.put("id", uuid);
    return unmodifiableMap(toReturn);
  }
}
