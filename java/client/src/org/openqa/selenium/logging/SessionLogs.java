/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.logging;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import org.openqa.selenium.Beta;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
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
    this.logTypeToEntriesMap = new HashMap<String, LogEntries>();
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
  
  public static SessionLogs fromJSON(JSONObject rawSessionLogs) throws JSONException {
    SessionLogs sessionLogs = new SessionLogs();
    for (Iterator logTypeItr = rawSessionLogs.keys(); logTypeItr.hasNext();) {
      String logType = (String) logTypeItr.next();
      JSONArray rawLogEntries = rawSessionLogs.getJSONArray(logType);
      List<LogEntry> logEntries = new ArrayList<LogEntry>();
      for (int index = 0; index < rawLogEntries.length(); index++) {
        JSONObject rawEntry = rawLogEntries.getJSONObject(index);
        logEntries.add(new LogEntry(LogLevelMapping.toLevel(rawEntry.getString("level")),
            rawEntry.getLong("timestamp"), rawEntry.getString("message")));
      }        
      sessionLogs.addLog(logType, new LogEntries(logEntries));
    }
    return sessionLogs;
  }
}
