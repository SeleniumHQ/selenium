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

import java.io.Serializable;
import java.util.Comparator;
import java.util.Objects;
import java.util.UUID;
import org.openqa.selenium.internal.Require;

public class NodeId implements Comparable<NodeId>, Serializable {

  private final UUID uuid;

  public NodeId(UUID uuid) {
    this.uuid = Require.nonNull("Actual id", uuid);
  }

  public UUID toUuid() {
    return uuid;
  }

  @Override
  public int compareTo(NodeId that) {
    return Comparator.comparing(NodeId::toUuid).compare(this, that);
  }

  @Override
  public String toString() {
    return uuid.toString();
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof NodeId)) {
      return false;
    }

    NodeId that = (NodeId) o;
    return Objects.equals(this.uuid, that.uuid);
  }

  @Override
  public int hashCode() {
    return Objects.hash(uuid);
  }

  private Object toJson() {
    return uuid;
  }

  private static NodeId fromJson(UUID id) {
    return new NodeId(id);
  }
}
