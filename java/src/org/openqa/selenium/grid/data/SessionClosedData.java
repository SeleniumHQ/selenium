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
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.SessionId;

/**
 * Data structure that carries session closure information for SessionClosedEvent. This provides
 * rich context about closed sessions for sidecar services to consume, enabling functionality such
 * as stopping video recording, collecting logs, or other session lifecycle management.
 */
public class SessionClosedData {

  private final SessionId sessionId;
  private final SessionClosedReason reason;
  private final NodeId nodeId;
  private final URI nodeUri;
  private final Capabilities capabilities;
  private final Instant startTime;
  private final Instant endTime;

  /** Backward compatible constructor for existing code. */
  public SessionClosedData(SessionId sessionId, SessionClosedReason reason) {
    this(sessionId, reason, null, null, null, null, Instant.now());
  }

  /** Full constructor with all session context for sidecar services. */
  public SessionClosedData(
      SessionId sessionId,
      SessionClosedReason reason,
      NodeId nodeId,
      URI nodeUri,
      Capabilities capabilities,
      Instant startTime,
      Instant endTime) {
    this.sessionId = Require.nonNull("Session ID", sessionId);
    this.reason = Require.nonNull("Reason", reason);
    this.nodeId = nodeId;
    this.nodeUri = nodeUri;
    this.capabilities = capabilities;
    this.startTime = startTime;
    this.endTime = Require.nonNull("End time", endTime);
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public SessionClosedReason getReason() {
    return reason;
  }

  public NodeId getNodeId() {
    return nodeId;
  }

  public URI getNodeUri() {
    return nodeUri;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public Instant getStartTime() {
    return startTime;
  }

  public Instant getEndTime() {
    return endTime;
  }

  /**
   * Returns the duration of the session, or null if start time is not available.
   *
   * @return the session duration, or null if start time was not recorded
   */
  public Duration getSessionDuration() {
    if (startTime == null || endTime == null) {
      return null;
    }
    return Duration.between(startTime, endTime);
  }

  @Override
  public String toString() {
    return String.format(
        "SessionClosedData{sessionId=%s, reason=%s, nodeId=%s}", sessionId, reason, nodeId);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> result = new TreeMap<>();
    result.put("sessionId", sessionId);
    result.put("reason", reason);
    if (nodeId != null) {
      result.put("nodeId", nodeId);
    }
    if (nodeUri != null) {
      result.put("nodeUri", nodeUri);
    }
    if (capabilities != null) {
      result.put("capabilities", capabilities);
    }
    if (startTime != null) {
      result.put("startTime", startTime);
    }
    result.put("endTime", endTime);
    return result;
  }

  private static SessionClosedData fromJson(JsonInput input) {
    SessionId sessionId = null;
    SessionClosedReason reason = null;
    NodeId nodeId = null;
    URI nodeUri = null;
    Capabilities capabilities = null;
    Instant startTime = null;
    Instant endTime = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "sessionId":
          sessionId = input.read(SessionId.class);
          break;
        case "reason":
          reason = SessionClosedReason.valueOf(input.read(String.class));
          break;
        case "nodeId":
          nodeId = input.read(NodeId.class);
          break;
        case "nodeUri":
          nodeUri = input.read(URI.class);
          break;
        case "capabilities":
          capabilities = input.read(Capabilities.class);
          break;
        case "startTime":
          startTime = input.read(Instant.class);
          break;
        case "endTime":
          endTime = input.read(Instant.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    if (sessionId == null || reason == null) {
      throw new JsonException("sessionId and reason are required fields");
    }

    return new SessionClosedData(
        sessionId, reason, nodeId, nodeUri, capabilities, startTime, endTime);
  }
}
