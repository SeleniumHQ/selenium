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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;

import static java.util.Collections.unmodifiableMap;
import static java.util.Collections.unmodifiableSet;

public class NodeStatus {

  private final NodeId nodeId;

  private final URI externalUri;
  private final int maxSessionCount;
  private final Set<Slot> slots;
  private final Availability availability;
  private final Duration heartbeatPeriod;
  private final String version;
  private final Map<String, String> osInfo;

  public NodeStatus(
    NodeId nodeId,
    URI externalUri,
    int maxSessionCount,
    Set<Slot> slots,
    Availability availability,
    Duration heartbeatPeriod,
    String version,
    Map<String, String> osInfo) {
    this.nodeId = Require.nonNull("Node id", nodeId);
    this.externalUri = Require.nonNull("URI", externalUri);
    this.maxSessionCount = Require.positive("Max session count",
      maxSessionCount,
      "Make sure that a driver is available on $PATH");
    this.slots = unmodifiableSet(new HashSet<>(Require.nonNull("Slots", slots)));
    this.availability = Require.nonNull("Availability", availability);
    this.heartbeatPeriod = heartbeatPeriod;
    this.version = Require.nonNull("Grid Node version", version);
    this.osInfo = Require.nonNull("Node host OS info", osInfo);
  }

  public static NodeStatus fromJson(JsonInput input) {
    NodeId nodeId = null;
    URI externalUri = null;
    int maxSessions = 0;
    Set<Slot> slots = null;
    Availability availability = null;
    Duration heartbeatPeriod = null;
    String version = null;
    Map<String, String> osInfo = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "availability":
          availability = input.read(Availability.class);
          break;

        case "heartbeatPeriod":
          heartbeatPeriod = Duration.ofMillis(input.read(Long.class));
          break;

        case "nodeId":
          nodeId = input.read(NodeId.class);
          break;

        case "maxSessions":
          maxSessions = input.read(Integer.class);
          break;

        case "slots":
          slots = input.read(new TypeToken<Set<Slot>>() {
          }.getType());
          break;

        case "externalUri":
          externalUri = input.read(URI.class);
          break;

        case "version":
          version = input.read(String.class);
          break;

        case "osInfo":
          osInfo = input.read(Map.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new NodeStatus(
      nodeId,
      externalUri,
      maxSessions,
      slots,
      availability,
      heartbeatPeriod,
      version,
      osInfo);
  }

  public boolean hasCapability(Capabilities caps) {
    return slots.stream().anyMatch(slot -> slot.isSupporting(caps));
  }

  public boolean hasCapacity() {
    return slots.stream().anyMatch(slot -> slot.getSession() == null);
  }

  public boolean hasCapacity(Capabilities caps) {
    return slots.stream()
      .anyMatch(slot -> slot.getSession() == null && slot.isSupporting(caps));
  }

  public int getMaxSessionCount() {
    return maxSessionCount;
  }

  public NodeId getNodeId() {
    return nodeId;
  }

  public URI getExternalUri() {
    return externalUri;
  }

  public Set<Slot> getSlots() {
    return slots;
  }

  public Availability getAvailability() {
    return availability;
  }

  public Duration getHeartbeatPeriod() {
    return heartbeatPeriod;
  }

  public String getVersion() {
    return version;
  }

  public Map<String, String> getOsInfo() {
    return osInfo;
  }

  public float getLoad() {
    float inUse = slots.parallelStream()
      .filter(slot -> slot.getSession() != null)
      .count();

    return (inUse / (float) maxSessionCount) * 100f;
  }

  public long getLastSessionCreated() {
    return slots.parallelStream()
      .map(Slot::getLastStarted)
      .mapToLong(Instant::toEpochMilli)
      .max()
      .orElse(0);
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
      Objects.equals(this.slots, that.slots) &&
      Objects.equals(this.availability, that.availability) &&
      Objects.equals(this.version, that.version);
  }

  @Override
  public int hashCode() {
    return Objects.hash(nodeId, externalUri, maxSessionCount, slots, version);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("nodeId", nodeId);
    toReturn.put("externalUri", externalUri);
    toReturn.put("maxSessions", maxSessionCount);
    toReturn.put("slots", slots);
    toReturn.put("availability", availability);
    toReturn.put("heartbeatPeriod", heartbeatPeriod.toMillis());
    toReturn.put("version", version);
    toReturn.put("osInfo", osInfo);

    return unmodifiableMap(toReturn);
  }
}
