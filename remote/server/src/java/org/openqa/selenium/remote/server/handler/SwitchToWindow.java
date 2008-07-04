// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class SwitchToWindow extends WebDriverHandler {

  private String name;

  public SwitchToWindow(DriverSessions sessions) {
    super(sessions);
  }

  public void setName(String name) {
    this.name = name;
  }

  public ResultType handle() throws Exception {
    getDriver().switchTo().window(name);

    return ResultType.SUCCESS;
  }
}
