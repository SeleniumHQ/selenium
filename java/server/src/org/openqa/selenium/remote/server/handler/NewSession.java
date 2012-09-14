/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote.server.handler;

import com.google.common.collect.Maps;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.RestishHandler;
import org.openqa.selenium.remote.server.rest.ResultType;
import org.openqa.selenium.server.log.LoggingManager;

import java.util.Map;

public class NewSession implements RestishHandler, JsonParametersAware {
  private volatile DriverSessions allSessions;
  private volatile Capabilities desiredCapabilities;
  private volatile SessionId sessionId;
  private final Response response;

  public NewSession(DriverSessions allSession) {
    this.allSessions = allSession;
    this.response = new Response();
  }

  public Capabilities getCapabilities() {
    return desiredCapabilities;
  }
  
  public Response getResponse() {
    return response;
  }

  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(Map<String, Object> allParameters)
      throws Exception {
    desiredCapabilities = new DesiredCapabilities(
        (Map<String, Object>) allParameters.get("desiredCapabilities"));
  }

  public ResultType handle() throws Exception {
    // Handle the case where the client does not send any desired capabilities.
    sessionId = allSessions.newSession(desiredCapabilities != null
        ? desiredCapabilities : new DesiredCapabilities());
    response.setSessionId(sessionId.toString());
    response.setValue(allSessions.get(sessionId).getCapabilities().asMap());

    if (desiredCapabilities != null) {
      LoggingManager.perSessionLogHandler().configureLogging(
          (LoggingPreferences)desiredCapabilities.getCapability(CapabilityType.LOGGING_PREFS));
    }
    LoggingManager.perSessionLogHandler().attachToCurrentThread(sessionId);
    return ResultType.SUCCESS;
  }

  public String getSessionId() {
    return sessionId.toString();
  }

  @Override
  public String toString() {
    Map<String, String> capabilities = Maps.newHashMap();

    if (desiredCapabilities != null) {
      for (Map.Entry<String, ?> entry : desiredCapabilities.asMap().entrySet()) {
        String value = String.valueOf(entry.getValue());
        if (value.length() > 32) {
          value = value.substring(0, 29) + "...";
        }
        capabilities.put(entry.getKey(), value);
      }

    }
    return String.format("[new session: %s]", capabilities);
  }
}
