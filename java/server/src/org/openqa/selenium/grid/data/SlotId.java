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

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;
import java.util.UUID;

public class SlotId {

  private final NodeId nodeId;
  private final UUID uuid;

  public SlotId(NodeId host, UUID uuid) {
    this.nodeId = Require.nonNull("Host id", host);
    this.uuid = Require.nonNull("Actual id", uuid);
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
    return Objects.equals(this.nodeId, that.nodeId) &&
      Objects.equals(this.uuid, that.uuid);
  }

  @Override
  public int hashCode() {
    return Objects.hash(nodeId, uuid);
  }

  private Object toJson() {
    return ImmutableMap.of("hostId", nodeId, "id", uuid);
  }

  private static SlotId fromJson(JsonInput input) {
    NodeId nodeId = null;
    UUID id = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "hostId":
          nodeId = input.read(NodeId.class);
          break;

        case "id":
          id = input.read(UUID.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new SlotId(nodeId, id);
  }
}
