// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.Cookie;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Set;

public class GetAllCookies extends WebDriverHandler {

  private Response response;

  public GetAllCookies(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType handle() throws Exception {
    response = newResponse();
    Set<Cookie> cookies = getDriver().manage().getCookies();
    response.setValue(cookies);
    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
