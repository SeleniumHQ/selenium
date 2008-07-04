// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class SwitchToFrame extends WebDriverHandler {

  private String id;

  public SwitchToFrame(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String id) {
    this.id = id;
  }

  public ResultType handle() throws Exception {
    if (id == null) {
      getDriver().switchTo().defaultContent();
    } else {
      getDriver().switchTo().frame(id);
    }

    return ResultType.SUCCESS;
  }
}
