package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class SubmitElement extends WebDriverHandler {

  private String elementId;

  public SubmitElement(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String elementId) {
    this.elementId = elementId;
  }


  public ResultType call() throws Exception {
    getKnownElements().get(elementId).submit();

    return ResultType.SUCCESS;
  }
}
