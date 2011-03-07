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

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Map;


public class ImeActivateEngine extends WebDriverHandler implements JsonParametersAware {
  private volatile Response response;
  private String engine = null;

  public ImeActivateEngine(DriverSessions sessions) {
    super(sessions);
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    engine = (String) allParameters.get("engine");
  }

  public ResultType call() throws Exception {
    response = newResponse();

    boolean couldActivate = getDriver().manage().ime().activateEngine(engine);
    response.setValue(couldActivate);

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
