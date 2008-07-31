// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetCssProperty extends WebDriverHandler {
  private String propertyName;
  private String id;
  private Response response;

  public GetCssProperty(DriverSessions sessions) {
    super(sessions);
  }

  public void setPropertyName(String propertyName) {
    this.propertyName = propertyName;
  }

  public void setId(String id) {
    this.id = id;
  }

  public ResultType call() throws Exception {
    response = newResponse();

    RenderedWebElement element = (RenderedWebElement) getKnownElements().get(id);
    response.setValue(element.getValueOfCssProperty(propertyName));

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
