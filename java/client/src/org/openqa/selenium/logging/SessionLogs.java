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

import org.openqa.selenium.Beta;

import java.util.ArrayList;
import java.util.Collection;
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
      return new LogEntries(Collections.emptyList());
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

  public static SessionLogs fromJSON(Map<String, Object> rawSessionLogs) {
    SessionLogs sessionLogs = new SessionLogs();
    for (Map.Entry<String, Object> entry : rawSessionLogs.entrySet()) {
      String logType = entry.getKey();
      Collection<?> rawLogEntries = (Collection<?>) entry.getValue();
      List<LogEntry> logEntries = new ArrayList<>();
      for (Object o : rawLogEntries) {
        @SuppressWarnings("unchecked") Map<String, Object> rawEntry = (Map<String, Object>) o;
        logEntries.add(new LogEntry(
            LogLevelMapping.toLevel(String.valueOf(rawEntry.get("level"))),
            ((Number) rawEntry.get("timestamp")).longValue(),
            String.valueOf(rawEntry.get("message"))));
      }
      sessionLogs.addLog(logType, new LogEntries(logEntries));
    }
    return sessionLogs;
  }

  @Beta
  public Map<String, LogEntries> toJson() {
    return getAll();
  }
}
