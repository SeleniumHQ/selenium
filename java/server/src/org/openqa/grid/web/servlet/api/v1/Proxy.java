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

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.web.servlet.api.v1.utils.ProxyIdUtil;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Proxy extends RestApiEndpoint {

  public Map getResponse(String query) {
    Map<String, Object> proxyInfo = new HashMap();

    if (query == null || query.equals("/")) {
      //do nothing, bc user didn't deem it important enough to give any info :-P
    } else {
      final String proxyToFind = ProxyIdUtil.decodeId(query.replaceAll("^/", ""));
      final RemoteProxy proxy = this.getRegistry().getAllProxies().getProxyById(proxyToFind);
      proxyInfo.put("config", proxy.getConfig().toJson());
      proxyInfo.put("totalUsed", proxy.getTotalUsed());
      proxyInfo.put("percentUsed", proxy.getResourceUsageInPercent());
      proxyInfo.put("capabilityHelper", proxy.getCapabilityHelper().getClass().getCanonicalName());
      proxyInfo.put("htmlRenderer", proxy.getHtmlRender().getClass().getCanonicalName());
      proxyInfo.put("lastSessionStart", proxy.getLastSessionStart());
      proxyInfo.put("isBusy", proxy.isBusy());
      proxyInfo.put("registrationRequest", proxy.getOriginalRegistrationRequest().toJson());
      proxyInfo.put("status", proxy.getStatus());
      List<TestSession> sessions = Arrays.asList();
      for (TestSlot slot : proxy.getTestSlots()) {
        if ((slot == null) || (slot.getSession() == null)) {
          continue;
        }
        if (slot.getSession().isForwardingRequest()) {
          sessions.add(slot.getSession());
        }
      }
      proxyInfo.put("sessions", sessions);
    }
    return proxyInfo;
  }
}
