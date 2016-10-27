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

import org.openqa.grid.internal.ProxySet;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.TestSlot;
import org.openqa.grid.web.servlet.api.v1.utils.ProxyIdUtil;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class SessionInfo extends RestApiEndpoint {

  @Override
  public Object getResponse(String query) {
    Map sessionInfo = new HashMap();

    if (query == null || query.equals("/")) {
      //do nothing, bc user didn't deem it important enough to give any info :-P
    } else {
      final String sessionId = query.replaceAll("^/", "");
      TestSession foundSession = null;

      ProxySet proxies = this.getRegistry().getAllProxies();
      Iterator<RemoteProxy> iterator = proxies.iterator();
      while (iterator.hasNext()) {
        RemoteProxy currentProxy = iterator.next();

        for (TestSlot slot : currentProxy.getTestSlots()) {
          if (slot.getSession() != null) {
            if (slot.getSession().getExternalKey().getKey().equals(sessionId)) {
              foundSession = slot.getSession();
              break;
            }
          }
        }
      }

      if (foundSession != null) {
        sessionInfo.put("orphaned", foundSession.isOrphaned());
        sessionInfo.put("internal_key", foundSession.getInternalKey());
        sessionInfo.put("requested_capabilities", foundSession.getRequestedCapabilities());
        sessionInfo.put("forwarding_request", foundSession.isForwardingRequest());
        sessionInfo.put("protocol", foundSession.getSlot().getProtocol());
        sessionInfo.put("request_path", foundSession.getSlot().getPath());

        sessionInfo.put("proxy", ProxyIdUtil.encodeId(foundSession.getSlot().getProxy().getId()));
      }
    }

    return sessionInfo;
  }
}
