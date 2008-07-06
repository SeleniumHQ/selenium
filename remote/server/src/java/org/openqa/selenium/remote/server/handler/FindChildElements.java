// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class FindChildElements extends WebDriverHandler implements JsonParametersAware {
  private String id;
  private By by;
  private Response response;

  public FindChildElements(DriverSessions sessions) {
    super(sessions);
  }

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
    response = newResponse();

    Set<String> urls = new LinkedHashSet<String>();
    List<WebElement> elements = getKnownElements().get(id).findElements(by);
    for (WebElement element : elements) {
      String elementId = getKnownElements().add(element);

      // URL will be relative to the current one.
      urls.add(String.format("element/%s", elementId));
    }

    response.setValue(urls);
    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
