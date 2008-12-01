package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetAllWindowHandles extends WebDriverHandler {
  private Response response;

  public GetAllWindowHandles(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType call() throws Exception {
    response = newResponse();

    response.setValue(getDriver().getWindowHandles());

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
