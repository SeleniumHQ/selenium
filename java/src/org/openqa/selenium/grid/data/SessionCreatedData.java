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

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.SessionId;

/**
 * Data structure that carries session creation information for SessionCreatedEvent. This provides
 * rich context about newly created sessions for sidecar services to consume.
 */
public class SessionCreatedData {

  private final SessionId sessionId;
  private final NodeId nodeId;
  private final URI nodeUri;
  private final URI sessionUri;
  private final Capabilities capabilities;
  private final Capabilities stereotype;
  private final Instant startTime;

  public SessionCreatedData(
      SessionId sessionId,
      NodeId nodeId,
      URI nodeUri,
      URI sessionUri,
      Capabilities capabilities,
      Capabilities stereotype,
      Instant startTime) {
    this.sessionId = Require.nonNull("Session ID", sessionId);
    this.nodeId = Require.nonNull("Node ID", nodeId);
    this.nodeUri = Require.nonNull("Node URI", nodeUri);
    this.sessionUri = Require.nonNull("Session URI", sessionUri);
    this.capabilities = ImmutableCapabilities.copyOf(Require.nonNull("Capabilities", capabilities));
    this.stereotype = ImmutableCapabilities.copyOf(Require.nonNull("Stereotype", stereotype));
    this.startTime = Require.nonNull("Start time", startTime);
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public NodeId getNodeId() {
    return nodeId;
  }

  public URI getNodeUri() {
    return nodeUri;
  }

  public URI getSessionUri() {
    return sessionUri;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public Capabilities getStereotype() {
    return stereotype;
  }

  public Instant getStartTime() {
    return startTime;
  }

  @Override
  public String toString() {
    return String.format(
        "SessionCreatedData{sessionId=%s, nodeId=%s, startTime=%s}", sessionId, nodeId, startTime);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.put("sessionId", sessionId);
    toReturn.put("nodeId", nodeId);
    toReturn.put("nodeUri", nodeUri);
    toReturn.put("sessionUri", sessionUri);
    toReturn.put("capabilities", capabilities);
    toReturn.put("stereotype", stereotype);
    toReturn.put("startTime", startTime);
    return toReturn;
  }

  private static SessionCreatedData fromJson(JsonInput input) {
    SessionId sessionId = null;
    NodeId nodeId = null;
    URI nodeUri = null;
    URI sessionUri = null;
    Capabilities capabilities = null;
    Capabilities stereotype = null;
    Instant startTime = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "sessionId":
          sessionId = input.read(SessionId.class);
          break;
        case "nodeId":
          nodeId = input.read(NodeId.class);
          break;
        case "nodeUri":
          nodeUri = input.read(URI.class);
          break;
        case "sessionUri":
          sessionUri = input.read(URI.class);
          break;
        case "capabilities":
          capabilities = input.read(Capabilities.class);
          break;
        case "stereotype":
          stereotype = input.read(Capabilities.class);
          break;
        case "startTime":
          startTime = input.read(Instant.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    return new SessionCreatedData(
        sessionId, nodeId, nodeUri, sessionUri, capabilities, stereotype, startTime);
  }
}
