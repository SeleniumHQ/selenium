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

package org.openqa.selenium.logging;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import java.util.HashMap;
import java.util.Map;

public class SessionLogHandler {

  /**
   * Creates a session logs map, with session logs mapped to session IDs, given
   * a raw session log map as a JSON object.
   *
   * @param rawSessionMap The raw session map.
   * @return The session logs mapped to session IDs.
   */
  public static Map<String, SessionLogs> getSessionLogs(JsonObject rawSessionMap) {
    Map<String, SessionLogs> sessionLogsMap = new HashMap<>();
    for (Map.Entry<String, JsonElement> entry : rawSessionMap.entrySet()) {
      String sessionId = entry.getKey();
      SessionLogs sessionLogs = SessionLogs.fromJSON(entry.getValue().getAsJsonObject());
      sessionLogsMap.put(sessionId, sessionLogs);
    }
    return sessionLogsMap;
  }
}
