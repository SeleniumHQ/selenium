package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class SetElementSelected extends WebDriverHandler {

  private String elementId;

  public SetElementSelected(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String elementId) {
    this.elementId = elementId;
  }


  public ResultType call() throws Exception {
    try {
      getKnownElements().get(elementId).setSelected();
    } catch (Exception e) {
      throw e;
    }

    return ResultType.SUCCESS;
  }
}
