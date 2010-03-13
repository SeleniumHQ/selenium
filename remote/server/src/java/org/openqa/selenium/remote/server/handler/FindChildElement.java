/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

public class FindChildElement extends WebElementHandler implements JsonParametersAware {
  private By by;
  private Response response;

  public FindChildElement(DriverSessions sessions) {
    super(sessions);
  }

  @SuppressWarnings("unchecked")
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    String method = (String) allParameters.get("using");
    String selector = (String) allParameters.get("value");

    by = new BySelector().pickFrom(method, selector);
  }

  public ResultType call() throws Exception {
    response = newResponse();

    WebElement element = getElement().findElement(by);
    String elementId = getKnownElements().add(element);

    response.setValue(ImmutableMap.of("ELEMENT", elementId));

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
  
  @Override
  public String toString() {
    return String.format("[find child element: %s, %s", getElementAsString(), by);
  }
}
