// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.json.JSONArray;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class FindElements extends WebDriverHandler implements JsonParametersAware {

  private By by;
  private Response response;

  public FindElements(DriverSessions sessions) {
    super(sessions);
  }

  public void setJsonParameters(List<Object> allParameters) throws Exception {
    JsonToBeanConverter converter = new JsonToBeanConverter();
    String method = converter.convert(String.class, allParameters.get(0));
    String selector = converter.convert(String.class, allParameters.get(1));

    by = new BySelector().pickFrom(method, selector);
  }

  public ResultType handle() throws Exception {
    response = newResponse();

    Set<String> urls = new LinkedHashSet<String>();
    List<WebElement> elements = getDriver().findElements(by);
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
