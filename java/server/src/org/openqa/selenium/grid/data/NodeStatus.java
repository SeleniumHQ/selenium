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

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.remote.SessionId;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public class NodeStatus {

  private final UUID nodeId;
  private final URI externalUri;
  private final int maxSessionCount;
  private final Map<Capabilities, Integer> stereotypes;
  private final Set<Active> snapshot;

  public NodeStatus(
      UUID nodeId,
      URI externalUri,
      int maxSessionCount,
      Map<Capabilities, Integer> stereotypes,
      Collection<Active> snapshot) {
    this.nodeId = Objects.requireNonNull(nodeId);
    this.externalUri = Objects.requireNonNull(externalUri);
    Preconditions.checkArgument(maxSessionCount > 0, "Max session count must be greater than 0.");
    this.maxSessionCount = maxSessionCount;

    this.stereotypes = ImmutableMap.copyOf(Objects.requireNonNull(stereotypes));
    this.snapshot = ImmutableSet.copyOf(Objects.requireNonNull(snapshot));
  }

  public boolean hasCapacity() {
    return !stereotypes.isEmpty();
  }

  public boolean hasCapacity(Capabilities caps) {
    return stereotypes.getOrDefault(caps, 0) > 0;
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

  public Map<Capabilities, Integer> getStereotypes() {
    return stereotypes;
  }

  public Set<Active> getCurrentSessions() {
    return snapshot;
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
           Objects.equals(this.stereotypes, that.stereotypes) &&
           Objects.equals(this.snapshot, that.snapshot);
  }

  @Override
  public int hashCode() {
    return Objects.hash(nodeId, externalUri, maxSessionCount, stereotypes, snapshot);
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "id", nodeId,
        "uri", externalUri,
        "maxSessions", maxSessionCount,
        "stereotypes", asCapacity(stereotypes),
        "sessions", snapshot);
  }

  private List<Map<String, Object>> asCapacity(Map<Capabilities, Integer> toConvert) {
    ImmutableList.Builder<Map<String, Object>> toReturn = ImmutableList.builder();
    toConvert.forEach((caps, count) -> toReturn.add(ImmutableMap.of(
        "capabilities", caps,
        "count", count)));
    return toReturn.build();
  }

  public static NodeStatus fromJson(Map<String, Object> raw) {
    List<Active> sessions = ((Collection<?>) raw.get("sessions")).stream()
        .map(item -> {
          @SuppressWarnings("unchecked")
          Map<String, Object> converted = (Map<String, Object>) item;
          return converted;
        })
        .map(Active::fromJson)
        .collect(toImmutableList());

    try {
      return new NodeStatus(
          UUID.fromString((String) raw.get("id")),
          new URI((String) raw.get("uri")),
          ((Number) raw.get("maxSessions")).intValue(),
          readCapacityNamed(raw, "stereotypes"),
          sessions);
    } catch (URISyntaxException e) {
      throw new JsonException(e);
    }
  }

  private static Map<Capabilities, Integer> readCapacityNamed(
      Map<String, Object> raw,
      String name) {
    ImmutableMap.Builder<Capabilities, Integer> capacity = ImmutableMap.builder();
    ((Collection<?>) raw.get(name)).forEach(obj -> {
      Map<?, ?> cap = (Map<?, ?>) obj;
      capacity.put(
          new ImmutableCapabilities((Map<?, ?>) cap.get("capabilities")),
          ((Number) cap.get("count")).intValue());
    });

    return capacity.build();
  }

  public static class Active {

    private final Capabilities stereotype;
    private final SessionId id;
    private final Capabilities currentCapabilities;

    public Active(Capabilities stereotype, SessionId id, Capabilities currentCapabilities) {
      this.stereotype = ImmutableCapabilities.copyOf(Objects.requireNonNull(stereotype));
      this.id = Objects.requireNonNull(id);
      this.currentCapabilities =
          ImmutableCapabilities.copyOf(Objects.requireNonNull(currentCapabilities));
    }

    public Capabilities getStereotype() {
      return stereotype;
    }

    public SessionId getSessionId() {
      return id;
    }

    public Capabilities getCurrentCapabilities() {
      return currentCapabilities;
    }

    @Override
    public boolean equals(Object o) {
      if (!(o instanceof Active)) {
        return false;
      }
      Active that = (Active) o;
      return Objects.equals(this.getStereotype(), that.getStereotype()) &&
             Objects.equals(this.id, that.id) &&
             Objects.equals(this.getCurrentCapabilities(), that.getCurrentCapabilities());
    }

    @Override
    public int hashCode() {
      return Objects.hash(getStereotype(), id, getCurrentCapabilities());
    }

    private Map<String, Object> toJson() {
      return ImmutableMap.of(
          "sessionId", getSessionId(),
          "stereotype", getStereotype(),
          "currentCapabilities", getCurrentCapabilities());
    }

    private static Active fromJson(Map<String, Object> raw) {
      SessionId id = new SessionId((String) raw.get("sessionId"));
      Capabilities stereotype = new ImmutableCapabilities((Map<?, ?>) raw.get("stereotype"));
      Capabilities current = new ImmutableCapabilities((Map<?, ?>) raw.get("currentCapabilities"));

      return new Active(stereotype, id, current);
    }
  }
}
