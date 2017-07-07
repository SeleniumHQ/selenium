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


package org.openqa.grid.web.servlet.handler;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.JsonToBeanConverter;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public class WebDriverRequest extends SeleniumBasedRequest {

  private static final String CAPABILITIES = "capabilities";
  private static final String DESIRED_CAPABILITIES = "desiredCapabilities";

  public WebDriverRequest(HttpServletRequest httpServletRequest, Registry registry) {
    super(httpServletRequest, registry);
  }

  @Override
  public RequestType extractRequestType() {
    if ("/session".equals(getPathInfo())) {
      return RequestType.START_SESSION;
    } else if (getMethod().equalsIgnoreCase("DELETE")) {
      ExternalSessionKey externalKey = ExternalSessionKey.fromWebDriverRequest(getPathInfo());
      if (externalKey != null && getPathInfo().endsWith("/session/" + externalKey.getKey())) {
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
    try {
      JsonObject map = new JsonParser().parse(json).getAsJsonObject();
      // Current W3C has required / desired capabilities wrapped in a 'capabilities' object.
      // This will need to be updated if/when https://github.com/w3c/webdriver/pull/327 gets merged
      if (map.has(CAPABILITIES)) {
        JsonObject outerCapabilities = map.getAsJsonObject(CAPABILITIES);
        if (outerCapabilities.has(DESIRED_CAPABILITIES)) {
          JsonObject desiredCapabilities = outerCapabilities.getAsJsonObject(DESIRED_CAPABILITIES);
          return new JsonToBeanConverter().convert(Map.class, desiredCapabilities);
        }
      }
      JsonObject dc = map.get(DESIRED_CAPABILITIES).getAsJsonObject();
      return new JsonToBeanConverter().convert(Map.class, dc);

    } catch (Exception e) {
      throw new GridException("Cannot extract a capabilities from the request: " + json, e);
    }
  }

  @Override
  public String getBody() {
    String json =  super.getBody();
    try {
      Map<String, Object> capsMap = getDesiredCapabilities();
      if (capsMap == null) {
        return json;
      }
      JsonObject map = new JsonParser().parse(json).getAsJsonObject();
      JsonElement dc = new BeanToJsonConverter().convertObject(capsMap);
      if (map.has(CAPABILITIES)) {
          map.getAsJsonObject(CAPABILITIES)
              .add(DESIRED_CAPABILITIES, new BeanToJsonConverter().convertObject(dc));
      } else {
        map.add(DESIRED_CAPABILITIES, dc);
      }
      return new Gson().toJson(map);
    } catch (Exception e) {
      return json;
    }
  }

}
