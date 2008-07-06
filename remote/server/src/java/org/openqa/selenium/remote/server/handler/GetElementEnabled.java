// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetElementEnabled extends WebDriverHandler {

  private String elementId;
  private Response response;

  public GetElementEnabled(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String elementId) {
    this.elementId = elementId;
  }

  public ResultType call() throws Exception {
    response = newResponse();
    response.setValue(getKnownElements().get(elementId).isEnabled());

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
