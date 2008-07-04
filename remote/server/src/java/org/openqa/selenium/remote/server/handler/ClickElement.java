package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class ClickElement extends WebDriverHandler {

  private String elementId;

  public ClickElement(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String elementId) {
    this.elementId = elementId;
  }


  public ResultType handle() throws Exception {
    getKnownElements().get(elementId).click();

    return ResultType.SUCCESS;
  }
}
