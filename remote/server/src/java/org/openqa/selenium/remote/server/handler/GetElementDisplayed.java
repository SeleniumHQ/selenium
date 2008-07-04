// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetElementDisplayed extends WebDriverHandler {

  private String id;
  private Response response;

  public GetElementDisplayed(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String id) {
    this.id = id;
  }

  public ResultType handle() throws Exception {
    response = newResponse();
    RenderedWebElement element = (RenderedWebElement) getKnownElements().get(id);
    response.setValue(element.isDisplayed());

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
