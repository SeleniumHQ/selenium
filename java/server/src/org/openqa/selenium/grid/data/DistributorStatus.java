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

import static com.google.common.collect.ImmutableList.toImmutableList;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.json.JsonInput;

import java.lang.reflect.Type;
import java.net.URI;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public class DistributorStatus {

  private static final Type SUMMARIES_TYPES = new TypeToken<Set<NodeSummary>>() {
  }.getType();

  private final Set<NodeSummary> allNodes;

  public DistributorStatus(Collection<NodeSummary> allNodes) {
    this.allNodes = ImmutableSet.copyOf(allNodes);
  }

  public boolean hasCapacity() {
    return getNodes().stream()
        .map(summary -> summary.isUp() && summary.hasCapacity())
        .reduce(Boolean::logicalOr)
        .orElse(false);
  }

  public Set<NodeSummary> getNodes() {
    return allNodes;
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "nodes", getNodes());
  }

  private static DistributorStatus fromJson(JsonInput input) {
    Set<NodeSummary> nodes = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "nodes":
          nodes = input.read(SUMMARIES_TYPES);
          break;

        default:
          input.skipValue();
      }
    }
    input.endObject();

    return new DistributorStatus(nodes);
  }

  public static class NodeSummary {

    private final UUID nodeId;
    private final URI uri;
    private final boolean up;
    private final int maxSessionCount;
    private final Map<Capabilities, Integer> stereotypes;
    private final Map<Capabilities, Integer> used;

    public NodeSummary(
        UUID nodeId,
        URI uri,
        boolean up,
        int maxSessionCount,
        Map<Capabilities, Integer> stereotypes,
        Map<Capabilities, Integer> usedStereotypes) {
      this.nodeId = Objects.requireNonNull(nodeId);
      this.uri = Objects.requireNonNull(uri);
      this.up = up;
      this.maxSessionCount = maxSessionCount;
      this.stereotypes = ImmutableMap.copyOf(Objects.requireNonNull(stereotypes));
      this.used = ImmutableMap.copyOf(Objects.requireNonNull(usedStereotypes));
    }

    public UUID getNodeId() {
      return nodeId;
    }

    public URI getUri() {
      return uri;
    }

    public boolean isUp() {
      return up;
    }

    public int getMaxSessionCount() {
      return maxSessionCount;
    }

    public Map<Capabilities, Integer> getStereotypes() {
      return stereotypes;
    }

    public Map<Capabilities, Integer> getUsedStereotypes() {
      return used;
    }

    public boolean hasCapacity() {
      HashMap<Capabilities, Integer> all = new HashMap<>(stereotypes);
      used.forEach((caps, count) -> all.computeIfPresent(caps, (ignored, curr) -> curr - count));

      return all.values()
          .stream()
          .map(count -> count > 0)
          .reduce(Boolean::logicalOr)
          .orElse(false);
    }

    private Map<String, Object> toJson() {
      ImmutableMap.Builder<String, Object> builder = ImmutableMap.builder();
      builder.put("nodeId", getNodeId());
      builder.put("uri", getUri());
      builder.put("up", isUp());
      builder.put("maxSessionCount", getMaxSessionCount());
      builder.put("stereotypes", getStereotypes().entrySet().stream()
          .map(entry -> ImmutableMap.of(
              "capabilities", entry.getKey(),
              "count", entry.getValue()))
          .collect(toImmutableList()));
      builder.put("usedStereotypes", getUsedStereotypes().entrySet().stream()
          .map(entry -> ImmutableMap.of(
              "capabilities", entry.getKey(),
              "count", entry.getValue()))
          .collect(toImmutableList()));

      return builder.build();
    }

    private static NodeSummary fromJson(JsonInput input) {
      UUID nodeId = null;
      URI uri = null;
      boolean up = false;
      int maxSessionCount = 0;
      Map<Capabilities, Integer> stereotypes = new HashMap<>();
      Map<Capabilities, Integer> used = new HashMap<>();

      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "maxSessionCount":
            maxSessionCount = input.nextNumber().intValue();
            break;

          case "nodeId":
            nodeId = input.read(UUID.class);
            break;

          case "stereotypes":
            stereotypes = readCapabilityCounts(input);
            break;

          case "up":
            up = input.nextBoolean();
            break;

          case "uri":
            uri = input.read(URI.class);
            break;

          case "usedStereotypes":
            used = readCapabilityCounts(input);
            break;

          default:
            input.skipValue();
            break;
        }
      }

      input.endObject();

      return new NodeSummary(nodeId, uri, up, maxSessionCount, stereotypes, used);
    }

    private static Map<Capabilities, Integer> readCapabilityCounts(JsonInput input) {
      Map<Capabilities, Integer> toReturn = new HashMap<>();

      input.beginArray();
      while (input.hasNext()) {
        Capabilities caps = null;
        int count = 0;
        input.beginObject();
        while (input.hasNext()) {
          switch (input.nextName()) {
            case "capabilities":
              caps = input.read(Capabilities.class);
              break;

            case "count":
              count = input.nextNumber().intValue();
              break;

            default:
              input.skipValue();
              break;
          }
        }
        input.endObject();

        toReturn.put(caps, count);
      }
      input.endArray();

      return toReturn;
    }
  }
}
