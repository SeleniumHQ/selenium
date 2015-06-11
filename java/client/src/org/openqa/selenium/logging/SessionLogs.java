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

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import org.openqa.selenium.Beta;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Contains the logs for a session divided by supported log types.
 */
@Beta
public class SessionLogs {
  private final Map<String, LogEntries> logTypeToEntriesMap;

  public SessionLogs() {
    this.logTypeToEntriesMap = new HashMap<>();
  }

  public LogEntries getLogs(String logType) {
    if (logType == null || !logTypeToEntriesMap.containsKey(logType)) {
      return new LogEntries(Collections.<LogEntry>emptyList());
    }
    return logTypeToEntriesMap.get(logType);
  }

  public void addLog(String logType, LogEntries logEntries) {
    logTypeToEntriesMap.put(logType, logEntries);
  }

  public Set<String> getLogTypes() {
    return logTypeToEntriesMap.keySet();
  }

  public Map<String, LogEntries> getAll() {
    return Collections.unmodifiableMap(logTypeToEntriesMap);
  }

  public static SessionLogs fromJSON(JsonObject rawSessionLogs) {
    SessionLogs sessionLogs = new SessionLogs();
    for (Map.Entry<String, JsonElement> entry : rawSessionLogs.entrySet()) {
      String logType = entry.getKey();
      JsonArray rawLogEntries = entry.getValue().getAsJsonArray();
      List<LogEntry> logEntries = new ArrayList<>();
      for (int index = 0; index < rawLogEntries.size(); index++) {
        JsonObject rawEntry = rawLogEntries.get(index).getAsJsonObject();
        logEntries.add(new LogEntry(LogLevelMapping.toLevel(
            rawEntry.get("level").getAsString()),
            rawEntry.get("timestamp").getAsLong(),
            rawEntry.get("message").getAsString()));
      }
      sessionLogs.addLog(logType, new LogEntries(logEntries));
    }
    return sessionLogs;
  }
}
