// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class FindChildElements extends WebDriverHandler {

  private String name;
  private Response response;
  private String id;

  public FindChildElements(DriverSessions sessions) {
    super(sessions);
  }

  public void setName(String name) {
    this.name = name;
  }

  public void setId(String id) {
    this.id = id;
  }

  public ResultType handle() throws Exception {
    response = newResponse();

    Set<String> urls = new LinkedHashSet<String>();
    WebElement parent = getKnownElements().get(id);
    List<WebElement> elements = parent.getChildrenOfType(name);

    for (WebElement element : elements) {
      String elementId = getKnownElements().add(element);

      // URL will be relative to the current one.
      urls.add(String.format("../../element/%s", elementId));
    }

    response.setValue(urls);
    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
