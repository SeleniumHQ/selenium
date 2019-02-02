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

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.json.JsonException;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

public class NodeStatus {

  private final UUID nodeId;
  private final URI externalUri;
  private final int maxSessionCount;
  private final Map<Capabilities, Integer> available;
  private final Map<Capabilities, Integer> used;

  public NodeStatus(
      UUID nodeId,
      URI externalUri,
      int maxSessionCount,
      Map<Capabilities, Integer> available,
      Map<Capabilities, Integer> used) {
    this.nodeId = Objects.requireNonNull(nodeId);
    this.externalUri = Objects.requireNonNull(externalUri);
    Preconditions.checkArgument(maxSessionCount > 0, "Max session count must be greater than 0.");
    this.maxSessionCount = maxSessionCount;

    this.available = ImmutableMap.copyOf(Objects.requireNonNull(available));
    this.used = ImmutableMap.copyOf(Objects.requireNonNull(used));
  }

  public boolean hasCapacity() {
    return !available.isEmpty();
  }

  public boolean hasCapacity(Capabilities caps) {
    return available.getOrDefault(caps, 0) > 0;
  }

  public UUID getNodeId() {
    return nodeId;
  }

  public URI getUri() {
    return externalUri;
  }

  public int getMaxSessionCount() {
    return maxSessionCount;
  }

  public Map<Capabilities, Integer> getAvailable() {
    return available;
  }

  public Map<Capabilities, Integer> getUsed() {
    return used;
  }


  @Override
  public boolean equals(Object o) {
    if (!(o instanceof NodeStatus)) {
      return false;
    }

    NodeStatus that = (NodeStatus) o;
    return Objects.equals(this.nodeId, that.nodeId) &&
           Objects.equals(this.externalUri, that.externalUri) &&
           this.maxSessionCount == that.maxSessionCount &&
           Objects.equals(this.available, that.available) &&
           Objects.equals(this.used, that.used);
  }

  @Override
  public int hashCode() {
    return Objects.hash(nodeId, externalUri, maxSessionCount, available, used);
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "id", nodeId,
        "uri", externalUri,
        "maxSessions", maxSessionCount,
        "capacity", ImmutableMap.of(
            "available", asCapacity(available),
            "used", asCapacity(used)));
  }

  private List<Map<String, Object>> asCapacity(Map<Capabilities, Integer> toConvert) {
    ImmutableList.Builder<Map<String, Object>> toReturn = ImmutableList.builder();
    toConvert.forEach((caps, count) -> {
      toReturn.add(ImmutableMap.of(
          "capabilities", caps,
          "count", count));
    });
    return toReturn.build();
  }

  public static NodeStatus fromJson(Map<String, Object> raw) {
    try {
      return new NodeStatus(
          UUID.fromString((String) raw.get("id")),
          new URI((String) raw.get("uri")),
          ((Number) raw.get("maxSessions")).intValue(),
          readCapacityNamed(raw, "available"),
          readCapacityNamed(raw, "used"));
    } catch (URISyntaxException e) {
      throw new JsonException(e);
    }
  }

  private static Map<Capabilities, Integer> readCapacityNamed(
      Map<String, Object> raw,
      String name) {
    Map<?, ?> rawCapacity = (Map<?, ?>) raw.get("capacity");
    List<?> kind = (List<?>) rawCapacity.get(name);

    ImmutableMap.Builder<Capabilities, Integer> capacity = ImmutableMap.builder();
    kind.forEach(obj -> {
      Map<?, ?> cap = (Map<?, ?>) obj;
      //noinspection unchecked
      capacity.put(
          new ImmutableCapabilities((Map<String, Object>) cap.get("capabilities")),
          ((Number) cap.get("count")).intValue());
    });

    return capacity.build();
  }
}
