// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class DeleteCookie extends CookieHandler {

  public DeleteCookie(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType handle() throws Exception {
    getDriver().manage().deleteAllCookies();

    return ResultType.SUCCESS;
  }
}
