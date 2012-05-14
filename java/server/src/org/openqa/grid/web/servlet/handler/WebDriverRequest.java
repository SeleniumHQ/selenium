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


package org.openqa.grid.web.servlet.handler;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.exception.NewSessionException;

public class WebDriverRequest extends SeleniumBasedRequest {

  public WebDriverRequest(HttpServletRequest httpServletRequest, Registry registry) {
    super(httpServletRequest, registry);
  }

  @Override
  public RequestType extractRequestType() {
    if ("/session".equals(getPathInfo())) {
      return RequestType.START_SESSION;
    } else if (getMethod().equalsIgnoreCase("DELETE")) {
      ExternalSessionKey externalKey = ExternalSessionKey.fromWebDriverRequest(getPathInfo());
      if (getPathInfo().endsWith("/session/" + externalKey.getKey())) {
        return RequestType.STOP_SESSION;
      }
    }
    return RequestType.REGULAR;
  }

  @Override
  public ExternalSessionKey extractSession() {
    if (getRequestType() == RequestType.START_SESSION) {
      throw new IllegalAccessError("Cannot call that method of a new session request.");
    }
    String path = getPathInfo();
    return ExternalSessionKey.fromWebDriverRequest(path);
  }

  @Override
  public Map<String, Object> extractDesiredCapability() {
    String json = getBody();
    Map<String, Object> desiredCapability = new HashMap<String, Object>();
    try {
      JSONObject map = new JSONObject(json);
      JSONObject dc = map.getJSONObject("desiredCapabilities");
      for (Iterator iterator = dc.keys(); iterator.hasNext();) {
        String key = (String) iterator.next();
        Object value = dc.get(key);
        if (value == JSONObject.NULL) {
          value = null;
        }
        desiredCapability.put(key, value);
      }
    } catch (JSONException e) {
      throw new GridException("Cannot extract a capabilities from the request " + json);
    }
    return desiredCapability;
  }

  @Override
  public String getNewSessionRequestedCapability(TestSession session) {
    try {
    JSONObject c = new JSONObject();
    c.put("desiredCapabilities", session.getRequestedCapabilities());
    String content = c.toString();
    return content;
    } catch (JSONException  e) {
      throw new NewSessionException("Error with the request " + e.getMessage(),e);
    }
  }
}
