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

import static java.nio.charset.StandardCharsets.UTF_8;

import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.remote.server.NewSessionPayload;

import java.io.Reader;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

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

    try (Reader in = new StringReader(json);
         NewSessionPayload payload = new NewSessionPayload(json.getBytes(UTF_8).length, in)) {
      Capabilities caps = payload.stream()
          .findFirst()
          .orElseThrow(() -> new GridException("No capabilities found in request: " + json));
      Map<String, Object> toReturn = new HashMap<>();
      toReturn.putAll(caps.asMap());
      return toReturn;
    } catch (GridException e) {
      throw e;
    } catch (Exception e) {
      throw new GridException("Cannot extract a capabilities from the request: " + json, e);
    }
  }
}
