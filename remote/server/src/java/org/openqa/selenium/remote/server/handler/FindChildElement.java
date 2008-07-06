// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;
import java.util.Map;

public class FindChildElement extends WebDriverHandler implements JsonParametersAware {
  private String id;
  private By by;
  private String elementId;

  public FindChildElement(DriverSessions sessions) {
    super(sessions);
  }

  @SuppressWarnings("unchecked")
  public void setJsonParameters(List<Object> allParameters) throws Exception {
    Map params = (Map) allParameters.get(0);
    String method = (String) params.get("using");
    String selector = (String) params.get("value");

    by = new BySelector().pickFrom(method, selector);
  }

  public void setId(String id) {
    this.id = id;
  }

  public ResultType call() throws Exception {
    WebElement element = getKnownElements().get(id).findElement(by);
    elementId = getKnownElements().add(element);

    return ResultType.SUCCESS;
  }

  public String getElement() {
    return elementId;
  }
}
