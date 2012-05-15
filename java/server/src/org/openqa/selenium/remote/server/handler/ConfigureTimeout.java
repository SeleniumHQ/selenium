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

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Map;
import java.util.concurrent.TimeUnit;

public class ConfigureTimeout extends WebDriverHandler implements JsonParametersAware {

  private volatile String type;
  private volatile long millis;

  public ConfigureTimeout(Session session) {
    super(session);
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    type = (String) allParameters.get("type");
    millis = ((Number) allParameters.get("ms")).longValue();
  }

  public ResultType call() throws Exception {
    if ("implicit".equals(type)) {
      getDriver().manage().timeouts().implicitlyWait(millis, TimeUnit.MILLISECONDS);
    } else if ("page load".equals(type)) {
      getDriver().manage().timeouts().pageLoadTimeout(millis, TimeUnit.MILLISECONDS);
    } else if ("script".equals(type)) {
      getDriver().manage().timeouts().setScriptTimeout(millis, TimeUnit.MILLISECONDS);
    } else {
      throw new WebDriverException("Unknown wait type: " + type);
    }
    return ResultType.SUCCESS;
  }

  @Override
  public String toString() {
    return String.format("[%s wait: %s]", type, millis);
  }
}
