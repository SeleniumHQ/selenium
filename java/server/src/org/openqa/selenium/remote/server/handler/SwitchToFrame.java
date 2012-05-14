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

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.internal.ArgumentConverter;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Map;

public class SwitchToFrame extends WebDriverHandler implements JsonParametersAware {

  private volatile Object id;

  public SwitchToFrame(Session session) {
    super(session);
  }

  public void setId(Object id) {
    this.id = id;
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    setId(new ArgumentConverter(getKnownElements()).apply(allParameters.get("id")));
  }

  public ResultType call() throws Exception {
    if (id == null) {
      getDriver().switchTo().defaultContent();
    } else if (id instanceof Number) {
      getDriver().switchTo().frame(((Number) id).intValue());
    } else if (id instanceof WebElement) {
      getDriver().switchTo().frame((WebElement) id);
    } else if (id instanceof String) {
      getDriver().switchTo().frame((String) id);
    } else {
      throw new IllegalArgumentException("Unsupported frame locator: " + id.getClass().getName());
    }

    return ResultType.SUCCESS;
  }

  @Override
  public String toString() {
    return String.format("[switch to frame: %s]", id);
  }
}
