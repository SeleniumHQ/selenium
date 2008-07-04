// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class CloseWindow extends WebDriverHandler {

  public CloseWindow(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType handle() throws Exception {
    WebDriver driver = getDriver();
    driver.close();

    return ResultType.SUCCESS;
  }
}
