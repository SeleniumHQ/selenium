/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Map;

public class NewSession implements Handler, JsonParametersAware {
  private volatile DriverSessions allSessions;
  private volatile Capabilities desiredCapabilities;
  private volatile SessionId sessionId;

  public NewSession(DriverSessions allSession) {
    this.allSessions = allSession;
  }

  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    desiredCapabilities = new DesiredCapabilities(
        (Map<String, Object>) allParameters.get("desiredCapabilities"));
  }

  public ResultType handle() throws Exception {
    sessionId = allSessions.newSession(desiredCapabilities);

    return ResultType.SUCCESS;
  }

  public String getSessionId() {
    return sessionId.toString();
  }

  @Override
  public String toString() {
    Map<String, Object> capabilities = Maps.newHashMap();

    if (desiredCapabilities != null) {
      for (Map.Entry<String, ?> entry : capabilities.entrySet()) {
        String value = String.valueOf(entry.getValue());

        if (value.length() > 32) {
          value = value.substring(0, 29) + "...";
        }

        capabilities.put(entry.getKey(), entry.getValue());
      }

    }
    return String.format("[new session: %s]", capabilities);
  }
}
