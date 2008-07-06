// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GoForward extends WebDriverHandler {

  public GoForward(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType call() throws Exception {
    getDriver().navigate().forward();

    return ResultType.SUCCESS;
  }
}
