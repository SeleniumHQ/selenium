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

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.web.servlet.api.v1.utils.ProxyUtil;

import java.net.URL;

public class HubInfo extends RestApiEndpoint {

  @Override
  public Object getResponse(String query) {
    JsonObject hubData = new JsonObject();
    hubData.add("configuration", getRegistry().getConfiguration().toJson());
    hubData.add("nodes", proxies());
    hubData.addProperty("registrationUrl", registrationUrl());
    hubData.addProperty("consoleUrl", consoleUrl());
    hubData.addProperty("newSessionRequestCount", getRegistry().getNewSessionRequestCount());
    hubData.addProperty("usedProxyCount", getRegistry().getUsedProxies().size());
    hubData.addProperty("totalProxyCount", getRegistry().getAllProxies().size());
    hubData.addProperty("activeSessionCount", getRegistry().getActiveSessions().size());
    return hubData;
  }

  private String registrationUrl() {
    return urlToString(getRegistry().getHub().getRegistrationURL());
  }

  private String consoleUrl() {
    return urlToString(getRegistry().getHub().getConsoleURL());
  }

  private String urlToString(URL url) {
    return String
        .format("%s://%s:%d/%s", url.getProtocol(), url.getHost(), url.getPort(), url.getPath());
  }

  private JsonArray proxies() {
    JsonArray proxies = new JsonArray();
    for (RemoteProxy proxy : getRegistry().getAllProxies()) {
      proxies.add(ProxyUtil.getNodeInfo(proxy));
    }
    return proxies;
  }

}
