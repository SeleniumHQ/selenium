package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class ClearElement extends WebDriverHandler {

  private String elementId;

  public ClearElement(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String elementId) {
    this.elementId = elementId;
  }


  public ResultType call() throws Exception {
    getKnownElements().get(elementId).clear();

    return ResultType.SUCCESS;
  }
}
