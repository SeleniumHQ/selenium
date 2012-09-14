/*
Copyright 2011 Software Freedom Conservatory.

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

import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.rest.ResultType;
import org.openqa.selenium.server.log.LoggingManager;

import java.util.Map;

/**
 * RestishHandler used to fetch logs from the Remote WebDriver server.
 */
public class GetLogHandler extends ResponseAwareWebDriverHandler implements JsonParametersAware {
  private volatile String type;

  public GetLogHandler(Session session) {
    super(session);
  }

  public ResultType call() throws Exception {
    if (LogType.SERVER.equals(type)) {
      response.setValue(LoggingManager.perSessionLogHandler().getSessionLog(getSessionId()));
    } else {
      response.setValue(getDriver().manage().logs().get(type));
    }
    return ResultType.SUCCESS;
  }

  @Override
  public String toString() {
    return String.format("[fetching logs for: %s]", type);
  }

  public void setJsonParameters(Map<String, Object> allParameters) {
    type = (String) allParameters.get("type");
  }
}
