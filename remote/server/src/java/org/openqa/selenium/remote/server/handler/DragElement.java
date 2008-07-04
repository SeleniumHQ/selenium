// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.List;

public class DragElement extends WebDriverHandler implements JsonParametersAware {

  private String id;
  private int x;
  private int y;

  public DragElement(DriverSessions sessions) {
    super(sessions);
  }

  public void setId(String id) {
    this.id = id;
  }

  public void setJsonParameters(List<Object> allParameters) throws Exception {
    x = (Integer) allParameters.get(1);
    y = (Integer) allParameters.get(2);
  }

  public ResultType handle() throws Exception {
    RenderedWebElement element = (RenderedWebElement) getKnownElements().get(id);
    element.dragAndDropBy(x, y);
    return ResultType.SUCCESS;
  }
}
