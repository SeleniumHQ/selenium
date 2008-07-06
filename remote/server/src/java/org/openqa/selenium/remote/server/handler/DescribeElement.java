package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class DescribeElement extends WebDriverHandler {

  private String elementId;
  private Response response;

  public DescribeElement(DriverSessions sessions) {
    super(sessions);
  }

  public void setElementId(String elementId) {
    this.elementId = elementId;
  }

  public ResultType call() throws Exception {
    response = newResponse();
    response.setValue(getKnownElements().get(elementId));

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
