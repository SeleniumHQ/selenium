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
