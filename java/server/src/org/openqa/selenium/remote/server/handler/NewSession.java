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

package org.openqa.selenium.remote.server.handler;

import com.google.common.collect.Maps;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.rest.RestishHandler;

import java.util.Map;

public class NewSession implements RestishHandler<Response>, JsonParametersAware {
  private volatile DriverSessions allSessions;
  private volatile Capabilities desiredCapabilities;
  private volatile SessionId sessionId;

  public NewSession(DriverSessions allSession) {
    this.allSessions = allSession;
  }

  public Capabilities getCapabilities() {
    return desiredCapabilities;
  }

  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(Map<String, Object> allParameters)
      throws Exception {
    desiredCapabilities = new DesiredCapabilities(
        (Map<String, Object>) allParameters.get("desiredCapabilities"));
  }

  @Override
  public Response handle() throws Exception {
    // Handle the case where the client does not send any desired capabilities.
    sessionId = allSessions.newSession(desiredCapabilities != null
                                       ? desiredCapabilities : new DesiredCapabilities());

    Map<String, Object> capabilities =
        Maps.newHashMap(allSessions.get(sessionId).getCapabilities().asMap());

    // Only servers implementing the server-side webdriver-backed selenium need
    // to return this particular value
    capabilities.put("webdriver.remote.sessionid", sessionId.toString());

    if (desiredCapabilities != null) {
      LoggingManager.perSessionLogHandler().configureLogging(
          (LoggingPreferences) desiredCapabilities.getCapability(CapabilityType.LOGGING_PREFS));
    }
    LoggingManager.perSessionLogHandler().attachToCurrentThread(sessionId);

    Response response = new Response();
    response.setSessionId(sessionId.toString());
    response.setValue(capabilities);
    // when it used to be a primitive 'int' this was implied
    // now explicitly setting it to preserve backwards compatibility
    response.setStatus(ErrorCodes.SUCCESS);
    return response;
  }

  public String getSessionId() {
    return sessionId.toString();
  }

  @Override
  public String toString() {
    return String.format("[new session: %s]", desiredCapabilities);
  }
}
