// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class DeleteSession extends WebDriverHandler {

  private final DriverSessions sessions;

  public DeleteSession(DriverSessions sessions) {
    super(sessions);
    this.sessions = sessions;
  }

  public ResultType handle() throws Exception {
    getDriver().quit();
    sessions.deleteSession(getRealSessionId());

    return ResultType.SUCCESS;
  }
}
