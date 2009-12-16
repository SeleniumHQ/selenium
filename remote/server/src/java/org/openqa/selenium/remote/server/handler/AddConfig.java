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

import java.util.List;
import java.util.Map;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultType;

import static org.openqa.selenium.remote.server.rest.ResultType.SUCCESS;

public class AddConfig implements Handler, JsonParametersAware {
  private final DriverSessions allSessions;
  private Capabilities desiredCapabilities;
  private String className;

  public AddConfig(DriverSessions allSessions) {
    this.allSessions = allSessions;
  }

  public void setJsonParameters(List<Object> allParameters) throws Exception {
    desiredCapabilities = new DesiredCapabilities((Map<String, Object>) allParameters.get(0));
    className = (String) allParameters.get(1);
  }

  public ResultType handle() throws Exception {
    // We'll let errors bubble up
    Class<? extends WebDriver> clazz = Class.forName(className).asSubclass(WebDriver.class);

    allSessions.registerDriver(desiredCapabilities, clazz);

    return SUCCESS;
  }
}
