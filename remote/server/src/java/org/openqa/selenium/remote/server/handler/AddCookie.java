// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.internal.ReturnedCookie;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class AddCookie extends CookieHandler {

  public AddCookie(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType call() throws Exception {
    ReturnedCookie cookie = createCookie();

    getDriver().manage().addCookie(cookie);

    return ResultType.SUCCESS;
  }
}
