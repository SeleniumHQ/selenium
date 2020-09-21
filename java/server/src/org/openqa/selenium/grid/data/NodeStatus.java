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
import com.google.common.collect.ImmutableSet;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

public class NodeStatus {

  private final NodeId nodeId;
  private final URI externalUri;
  private final int maxSessionCount;
  private final Set<Slot> slots;
  private final Secret registrationSecret;
  private final Availability availability;

  public NodeStatus(
      NodeId nodeId,
      URI externalUri,
      int maxSessionCount,
      Set<Slot> slots,
      Availability availability,
      Secret registrationSecret) {
    this.nodeId = Require.nonNull("Node id", nodeId);
    this.externalUri = Require.nonNull("URI", externalUri);
    this.maxSessionCount = Require.positive("Max session count", maxSessionCount);
    this.slots = ImmutableSet.copyOf(Require.nonNull("Slots", slots));
    this.availability = Require.nonNull("Availability", availability);
    this.registrationSecret = registrationSecret;

    Map<Capabilities, Integer> stereotypes = new HashMap<>();
    ImmutableSet.Builder<Session> sessions = ImmutableSet.builder();

    for (Slot slot : slots) {
      int count = stereotypes.getOrDefault(slot.getStereotype(), 0);
      count++;
      stereotypes.put(slot.getStereotype(), count);

      slot.getSession().ifPresent(sessions::add);
    }
  }

  public boolean hasCapacity() {
    return slots.stream().anyMatch(slot -> slot.getSession().isPresent());
  }

  public boolean hasCapacity(Capabilities caps) {
    long count = slots.stream()
      .filter(slot -> !slot.getSession().isPresent())
      .filter(slot -> slot.isSupporting(caps))
      .count();

    return count > 0;
  }

  public NodeId getId() {
    return nodeId;
  }

  public URI getUri() {
    return externalUri;
  }

  public int getMaxSessionCount() {
    return maxSessionCount;
  }

  public Set<Slot> getSlots() {
    return slots;
  }

  public Availability getAvailability() {
    return availability;
  }

  public float getLoad() {
    float inUse = slots.parallelStream()
      .filter(slot -> !slot.getSession().isPresent())
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


  public String getRegistrationSecret() {
    return registrationSecret == null ? null : registrationSecret.encode();
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
           Objects.equals(this.registrationSecret, that.registrationSecret);
  }

  @Override
  public int hashCode() {
    return Objects.hash(nodeId, externalUri, maxSessionCount, slots);
  }

  private Map<String, Object> toJson() {
    return new ImmutableMap.Builder<String, Object>()
        .put("id", nodeId)
        .put("uri", externalUri)
        .put("maxSessions", maxSessionCount)
        .put("slots", slots)
        .put("availability", availability)
        .put("registrationSecret", Optional.ofNullable(registrationSecret))
        .build();
  }

  public static NodeStatus fromJson(JsonInput input) {
    NodeId nodeId = null;
    URI uri = null;
    int maxSessions = 0;
    Secret registrationSecret = null;
    Set<Slot> slots = null;
    Availability availability = null;

    input.beginObject();
    while (input.hasNext()) {

      switch (input.nextName()) {
        case "availability":
          availability = input.read(Availability.class);
          break;

        case "id":
          nodeId = input.read(NodeId.class);
          break;

        case "maxSessions":
          maxSessions = input.read(Integer.class);
          break;

        case "registrationSecret":
          registrationSecret = input.read(Secret.class);
          break;

        case "slots":
          slots = input.read(new TypeToken<Set<Slot>>(){}.getType());
          break;

        case "uri":
          uri = input.read(URI.class);
          break;

        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new NodeStatus(
      nodeId,
      uri,
      maxSessions,
      slots,
      availability,
      registrationSecret);
  }
}
