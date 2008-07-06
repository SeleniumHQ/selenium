// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetMouseSpeed extends WebDriverHandler {

  private Response response;

  public GetMouseSpeed(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType call() throws Exception {
    response = newResponse();
    response.setValue(getDriver().manage().getSpeed());

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
