package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetCurrentUrl extends WebDriverHandler {

  private Response response;

  public GetCurrentUrl(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType handle() throws Exception {
    response = newResponse();
    response.setValue(getDriver().getCurrentUrl());
    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
