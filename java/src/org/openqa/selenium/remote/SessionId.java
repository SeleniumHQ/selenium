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

package org.openqa.selenium.remote;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonException;

@NullMarked
public class SessionId implements Serializable {

  private final String opaqueKey;
  private @Nullable String closeReason;

  public SessionId(UUID uuid) {
    this(Require.nonNull("Session ID key", uuid).toString());
  }

  public SessionId(String opaqueKey) {
    this.opaqueKey = Require.nonNull("Session ID key", opaqueKey);
    this.closeReason = null; // Session is alive initially
  }

  /**
   * Sets the reason why this session was closed. Once set, indicates the session is no longer
   * active.
   *
   * @param reason The reason for session closure
   */
  public void setCloseReason(String reason) {
    this.closeReason = reason;
  }

  /**
   * Gets the reason why this session was closed, if any.
   *
   * @return The close reason, or null if the session is still active
   */
  public @Nullable String getCloseReason() {
    return closeReason;
  }

  /**
   * Checks if this session has been closed.
   *
   * @return true if the session has a close reason set, false otherwise
   */
  public boolean isClosed() {
    return closeReason != null;
  }

  @Override
  public String toString() {
    return opaqueKey;
  }

  @Override
  public int hashCode() {
    return opaqueKey.hashCode();
  }

  @Override
  public boolean equals(@Nullable Object obj) {
    return obj instanceof SessionId && opaqueKey.equals(((SessionId) obj).opaqueKey);
  }

  private Object toJson() {
    // For backward compatibility, serialize as string when there's no closeReason
    // This ensures SessionId works properly in URLs and simple contexts
    if (closeReason == null) {
      return opaqueKey;
    }

    // When there is a closeReason, serialize as Map to preserve the metadata
    Map<String, Object> json = new HashMap<>();
    json.put("value", opaqueKey);
    json.put("closeReason", closeReason);
    return json;
  }

  private static SessionId fromJson(Object raw) {
    if (raw instanceof String) {
      return new SessionId(String.valueOf(raw));
    }

    if (raw instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) raw;
      if (map.get("value") instanceof String) {
        SessionId sessionId = new SessionId(String.valueOf(map.get("value")));
        // Restore closeReason if present
        if (map.get("closeReason") instanceof String) {
          sessionId.setCloseReason(String.valueOf(map.get("closeReason")));
        }
        return sessionId;
      }
    }

    throw new JsonException("Unable to coerce session id from " + raw);
  }
}
