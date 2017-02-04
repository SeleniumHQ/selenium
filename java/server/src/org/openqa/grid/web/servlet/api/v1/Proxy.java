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

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.web.servlet.api.v1.utils.ProxyUtil;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

public class Proxy extends RestApiEndpoint {

  @Override
  public Map<String, Object> getResponse(String query) {
    Map<String, Object> proxyInfo = new HashMap<>();
    if (isInvalidQuery(query)) {
      return proxyInfo;
    }

    final String proxyToFind = query.replaceAll("^/", "");
    final RemoteProxy proxy = this.getRegistry().getAllProxies().getProxyById(proxyToFind);
    if (proxy == null) {
      return proxyInfo;
    }
    proxyInfo.put("config", proxy.getConfig().toJson());
    proxyInfo.put("slotUsage", ProxyUtil.getSlotUsage(proxy));
    proxyInfo.put("percentUsed", proxy.getResourceUsageInPercent());
    proxyInfo.put("htmlRenderer", proxy.getHtmlRender().getClass().getCanonicalName());
    proxyInfo.put("lastSessionStart", proxy.getLastSessionStart());
    proxyInfo.put("isBusy", proxy.isBusy());
    JsonObject status = proxy.getStatus();
    addInfoFromStatusIfPresent(proxyInfo, "build", status);
    addInfoFromStatusIfPresent(proxyInfo, "os", status);
    addInfoFromStatusIfPresent(proxyInfo, "java", status);
    List<JsonObject> sessions = new LinkedList<>();
    for (TestSlot slot : proxy.getTestSlots()) {
      if ((slot == null) || (slot.getSession() == null)) {
        continue;
      }
      JsonObject session = new JsonObject();
      String key = CapabilityType.BROWSER_NAME;
      String browser = (String)slot.getSession().getRequestedCapabilities().get(key);
      if (browser != null) {
        session.addProperty(key, browser);
      }
      session.addProperty("sessionId", slot.getSession().getExternalKey().getKey());
      sessions.add(session);
    }
    proxyInfo.put("sessions", sessions);
    proxyInfo.put("slotUsage", ProxyUtil.getDetailedSlotUsage(proxy));
    return proxyInfo;
  }

  private void addInfoFromStatusIfPresent(Map<String, Object> map, String key, JsonObject status) {
    if (!status.has("value")) {
      return;
    }
    JsonObject value = status.get("value").getAsJsonObject();
    if (! value.has(key)) {
      return;
    }
    map.put(key, value.get(key).getAsJsonObject());
  }
}
