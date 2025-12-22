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

import java.util.Map;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.remote.SessionId;

/**
 * Data structure that carries both SessionId and closure reason for SessionClosedEvent. Keeps
 * closure state separate from the core SessionId class to avoid breaking changes.
 */
public class SessionClosedData {
  private final SessionId sessionId;
  private final SessionClosedReason reason;

  public SessionClosedData(SessionId sessionId, SessionClosedReason reason) {
    this.sessionId = Require.nonNull("Session ID", sessionId);
    this.reason = Require.nonNull("Reason", reason);
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public SessionClosedReason getReason() {
    return reason;
  }

  @Override
  public String toString() {
    return String.format("SessionClosedData{sessionId=%s, reason=%s}", sessionId, reason);
  }

  private Object toJson() {
    return Map.of("sessionId", sessionId, "reason", reason);
  }

  private static SessionClosedData fromJson(Object raw) {
    if (raw instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) raw;
      Object sessionIdObj = map.get("sessionId");
      Object reasonObj = map.get("reason");

      if (sessionIdObj instanceof String) {
        SessionId sessionId = new SessionId((String) sessionIdObj);
        SessionClosedReason reason = SessionClosedReason.valueOf((String) reasonObj);
        return new SessionClosedData(sessionId, reason);
      }
    }

    throw new JsonException("Unable to coerce session closed data from " + raw);
  }
}
