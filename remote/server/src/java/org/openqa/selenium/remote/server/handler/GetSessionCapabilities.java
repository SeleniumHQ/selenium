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

import java.util.Map;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetSessionCapabilities extends WebDriverHandler {

  private Response response;

  public GetSessionCapabilities(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType call() {
    Session session = sessions.get(sessionId);

    response = newResponse();
    Map<String, ?> capabilities = session.getCapabilities().asMap();
    describeSession(capabilities);
    response.setValue(capabilities);

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }

  protected void describeSession(Map<String, ?> capabilities) {
    // Does nothing further by default.
  }
}
