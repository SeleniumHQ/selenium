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

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class SessionLogHandler {
  
  /**
   * Creates a session logs map, with session logs mapped to session IDs, given
   * a raw session log map as a JSON object.
   *  
   * @param rawSessionMap The raw session map.
   * @return The session logs mapped to session IDs.
   * @throws Exception If something goes wrong in server communication or JSON parsing.
   */
  public static Map<String, SessionLogs> getSessionLogs(JSONObject rawSessionMap)
      throws JSONException {
    Map<String, SessionLogs> sessionLogsMap = new HashMap<String, SessionLogs>();
    for (Iterator keyItr = rawSessionMap.keys(); keyItr.hasNext();) {
      String sessionId = (String) keyItr.next();
      SessionLogs sessionLogs = SessionLogs.fromJSON(rawSessionMap.getJSONObject(sessionId));
      sessionLogsMap.put(sessionId, sessionLogs);
    }
    return sessionLogsMap;    
  }
}
