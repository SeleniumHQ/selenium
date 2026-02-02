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
import java.util.Collections;
import java.util.Map;
import java.util.TreeMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.SessionId;

/**
 * Data structure for user-defined session events. This allows clients to fire custom events through
 * the Grid that sidecar services can consume.
 *
 * <p>Example use cases:
 *
 * <ul>
 *   <li>Notify on test failure to collect logs
 *   <li>Trigger screenshot capture at specific points
 *   <li>Mark test phases for video annotation
 *   <li>Request custom resource collection
 *   <li>Send test metadata for reporting
 * </ul>
 *
 * <h2>Event Types</h2>
 *
 * <p>Common event types include:
 *
 * <ul>
 *   <li>{@code test:started} - Test has begun execution
 *   <li>{@code test:passed} - Test completed successfully
 *   <li>{@code test:failed} - Test failed with error
 *   <li>{@code test:skipped} - Test was skipped
 *   <li>{@code log:collect} - Request log collection
 *   <li>{@code screenshot:capture} - Request screenshot capture
 *   <li>{@code marker:add} - Add a marker/annotation point
 * </ul>
 *
 * <h2>Wire Format (JSON)</h2>
 *
 * <pre>{@code
 * {
 *   "sessionId": "abc123",
 *   "eventType": "test:failed",
 *   "nodeId": "node-uuid",
 *   "nodeUri": "http://node:5555",
 *   "timestamp": "2024-01-15T10:30:00Z",
 *   "payload": {
 *     "testName": "LoginTest",
 *     "error": "Element not found",
 *     "screenshot": true
 *   }
 * }
 * }</pre>
 */
public class SessionEventData {

  private final SessionId sessionId;
  private final String eventType;
  private final NodeId nodeId;
  private final URI nodeUri;
  private final Instant timestamp;
  private final Map<String, Object> payload;

  public SessionEventData(
      SessionId sessionId,
      String eventType,
      NodeId nodeId,
      URI nodeUri,
      Instant timestamp,
      Map<String, Object> payload) {
    this.sessionId = Require.nonNull("Session ID", sessionId);
    this.eventType = Require.nonNull("Event type", eventType);
    if (!eventType.matches("^[a-zA-Z][a-zA-Z0-9:._-]*$")) {
      throw new IllegalArgumentException(
          "Event type must start with a letter and contain only alphanumeric characters, "
              + "colons, dots, underscores, or hyphens. Got: "
              + eventType);
    }
    this.nodeId = nodeId;
    this.nodeUri = nodeUri;
    this.timestamp = Require.nonNull("Timestamp", timestamp);
    this.payload = payload != null ? Map.copyOf(payload) : Collections.emptyMap();
  }

  /**
   * Creates a SessionEventData with just session ID and event type (for client-side creation).
   *
   * @param sessionId the session ID
   * @param eventType the type of event (e.g., "test:failed", "log:collect")
   * @param payload optional payload data
   */
  public static SessionEventData create(
      SessionId sessionId, String eventType, Map<String, Object> payload) {
    return new SessionEventData(sessionId, eventType, null, null, Instant.now(), payload);
  }

  /**
   * Creates a copy of this event with node context added (used when processing on the node).
   *
   * @param nodeId the node ID
   * @param nodeUri the node URI
   * @return a new SessionEventData with node context
   */
  public SessionEventData withNodeContext(NodeId nodeId, URI nodeUri) {
    return new SessionEventData(
        this.sessionId, this.eventType, nodeId, nodeUri, this.timestamp, this.payload);
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public String getEventType() {
    return eventType;
  }

  public NodeId getNodeId() {
    return nodeId;
  }

  public URI getNodeUri() {
    return nodeUri;
  }

  public Instant getTimestamp() {
    return timestamp;
  }

  public Map<String, Object> getPayload() {
    return payload;
  }

  /**
   * Gets a value from the payload.
   *
   * @param key the key to look up
   * @return the value, or null if not present
   */
  public Object get(String key) {
    return payload.get(key);
  }

  /**
   * Gets a string value from the payload.
   *
   * @param key the key to look up
   * @return the string value, or null if not present or not a string
   */
  public String getString(String key) {
    Object value = payload.get(key);
    return value instanceof String ? (String) value : null;
  }

  /**
   * Gets a boolean value from the payload.
   *
   * @param key the key to look up
   * @param defaultValue the default value if not present
   * @return the boolean value
   */
  public boolean getBoolean(String key, boolean defaultValue) {
    Object value = payload.get(key);
    if (value instanceof Boolean) {
      return (Boolean) value;
    }
    if (value instanceof String) {
      return Boolean.parseBoolean((String) value);
    }
    return defaultValue;
  }

  @Override
  public String toString() {
    return String.format(
        "SessionEventData{sessionId=%s, eventType=%s, nodeId=%s, timestamp=%s}",
        sessionId, eventType, nodeId, timestamp);
  }

  private Map<String, Object> toJson() {
    Map<String, Object> result = new TreeMap<>();
    result.put("sessionId", sessionId);
    result.put("eventType", eventType);
    if (nodeId != null) {
      result.put("nodeId", nodeId);
    }
    if (nodeUri != null) {
      result.put("nodeUri", nodeUri);
    }
    result.put("timestamp", timestamp);
    if (!payload.isEmpty()) {
      result.put("payload", payload);
    }
    return result;
  }

  @SuppressWarnings("unchecked")
  private static SessionEventData fromJson(JsonInput input) {
    SessionId sessionId = null;
    String eventType = null;
    NodeId nodeId = null;
    URI nodeUri = null;
    Instant timestamp = null;
    Map<String, Object> payload = null;

    input.beginObject();
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "sessionId":
          sessionId = input.read(SessionId.class);
          break;
        case "eventType":
          eventType = input.read(String.class);
          break;
        case "nodeId":
          nodeId = input.read(NodeId.class);
          break;
        case "nodeUri":
          nodeUri = input.read(URI.class);
          break;
        case "timestamp":
          timestamp = input.read(Instant.class);
          break;
        case "payload":
          payload = input.read(Map.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }
    input.endObject();

    // Default timestamp to now if not provided
    if (timestamp == null) {
      timestamp = Instant.now();
    }

    return new SessionEventData(sessionId, eventType, nodeId, nodeUri, timestamp, payload);
  }
}
