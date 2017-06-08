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

package org.openqa.grid.web.servlet.api.v1.utils;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.TestSlot;
import org.openqa.selenium.remote.CapabilityType;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProxyUtil {

  private static final String TOTAL = "total";
  private static final String BUSY = "busy";

  private ProxyUtil() {
    //defeat instantiation.
  }

  /**
   * @param proxy - A {@link RemoteProxy} instance whose details are being sought.
   * @return - A {@link JsonObject} that contains the details of the remote proxy.
   */
  public static JsonObject getNodeInfo(RemoteProxy proxy) {
    JsonObject computer = new JsonObject();
    computer.addProperty("host", proxy.getRemoteHost().getHost());
    computer.addProperty("port", proxy.getRemoteHost().getPort());
    computer.addProperty("id", proxy.getId());
    return computer;
  }

  /**
   * @param proxy - A {@link RemoteProxy} instance whose details are being sought.
   * @return - A {@link JsonObject} that contains the {@link TestSlot} details of the remote proxy.
   */
  public static JsonObject getDetailedSlotUsage(RemoteProxy proxy) {
    JsonObject slots = getSlotUsage(proxy);
    JsonArray browsers = new JsonArray();
    for (Map.Entry<String, JsonObject> each : getBreakup(proxy.getTestSlots()).entrySet()) {
      JsonObject browser = new JsonObject();
      browser.addProperty("browser", each.getKey());
      browser.add("usage", each.getValue());
      browsers.add(browser);
    }
    slots.add("breakup", browsers);
    return slots;
  }

  /**
   * @param proxy - A {@link RemoteProxy} instance whose details are being sought.
   * @return - A {@link JsonObject} that contains the {@link TestSlot} summary of the remote proxy.
   */
  public static JsonObject getSlotUsage(RemoteProxy proxy) {
    JsonObject slots = new JsonObject();
    slots.addProperty(TOTAL, proxy.getTestSlots().size());
    slots.addProperty(BUSY, proxy.getTotalUsed());
    return slots;
  }

  /**
   * @param caps - A {@link Map} of capabilities.
   * @return - The browser name or <code>null</code>
   */
  public static Object getBrowser(Map<String, Object> caps) {
    return caps.get(CapabilityType.BROWSER_NAME);
  }

  private static Map<String, JsonObject> getBreakup(List<TestSlot> slots) {
    Map<String, JsonObject> data = new HashMap<>();
    for (TestSlot slot : slots) {
      String browser = (String) getBrowser(slot.getCapabilities());
      if (browser == null || browser.trim().isEmpty()) {
        continue;
      }
      JsonObject usage = constructBrowserUsageStats(slot.getSession(), data.get(browser));
      data.put(browser, usage);
    }
    return data;
  }

  private static JsonObject constructBrowserUsageStats(TestSession session, JsonObject usage) {
    boolean isBusy = session != null;
    if (usage == null) { // This indicates the intent to construct a new object
      JsonObject newUsage = new JsonObject();
      newUsage.addProperty(TOTAL, 1);
      int busy = isBusy ? 1 : 0;
      newUsage.addProperty(BUSY, busy);
      return newUsage;
    }
    //If we are here, it means we need to update the existing usage data.
    int total = usage.get(TOTAL).getAsInt() + 1;
    usage.addProperty(TOTAL, total);
    if (isBusy) {
      int busy = usage.get(BUSY).getAsInt() + 1;
      usage.addProperty(BUSY, busy);
    }
    return usage;
  }

}
