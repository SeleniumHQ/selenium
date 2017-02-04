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

package org.openqa.grid.web.servlet.api.v1;

import com.google.gson.JsonObject;

import org.openqa.grid.internal.TestSession;
import org.openqa.grid.web.servlet.api.v1.utils.ProxyUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class Sessions extends RestApiEndpoint {

  @Override
  public Map<String, JsonObject> getResponse(String query) {
    Map<String, JsonObject> sessions = new HashMap<>();
    Set<TestSession> activeSessions = this.getRegistry().getActiveSessions();
    for (TestSession session : activeSessions) {
      JsonObject sessionData = new JsonObject();
      sessionData.add("slotInfo", ProxyUtil.getNodeInfo(session.getSlot().getProxy()));
      String browser = (String) ProxyUtil.getBrowser(session.getRequestedCapabilities());
      if (browser != null && !browser.trim().isEmpty()) {
        sessionData.addProperty("browser", browser);
      }
      sessions.put(session.getExternalKey().getKey(), sessionData);
    }
    return sessions;
  }
}
