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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.RestishHandler;

import java.util.Map;

public class AddConfig implements RestishHandler<Void>, JsonParametersAware {
  private final DriverSessions allSessions;
  private volatile Capabilities desiredCapabilities;
  private volatile String className;

  public AddConfig(DriverSessions allSessions) {
    this.allSessions = allSessions;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    Map<String, Object> capabilitiesMap = (Map<String, Object>) allParameters.get("capabilities");
    desiredCapabilities = new DesiredCapabilities(capabilitiesMap);
    className = (String) allParameters.get("class");
  }

  @Override
  public Void handle() throws Exception {
    // We'll let errors bubble up
    Class<? extends WebDriver> clazz = Class.forName(className).asSubclass(WebDriver.class);

    allSessions.registerDriver(desiredCapabilities, clazz);

    return null;
  }
}
