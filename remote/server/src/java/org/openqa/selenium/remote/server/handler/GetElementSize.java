// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetElementSize extends WebDriverHandler {

  private Response response;
  private String id;

  public GetElementSize(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String id) {
    this.id = id;
  }

  public ResultType handle() throws Exception {
    response = newResponse();

    WebElement element = getKnownElements().get(id);
    response.setValue(((RenderedWebElement) element).getSize());

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
