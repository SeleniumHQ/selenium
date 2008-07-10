package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;
import org.openqa.selenium.remote.Response;

import java.util.List;
import java.util.Collections;

public class FindElement extends WebDriverHandler implements JsonParametersAware {
  private By by;
  private Response response;

  public FindElement(DriverSessions sessions) {
    super(sessions);
  }

  public void setJsonParameters(List<Object> allParameters) throws Exception {
    String method = (String) allParameters.get(0);
    String selector = (String) allParameters.get(1);

    by = new BySelector().pickFrom(method, selector);
  }

  public ResultType call() throws Exception {
    response = newResponse();

    WebElement element = getDriver().findElement(by);
    String elementId = getKnownElements().add(element);
    response.setValue(Collections.singletonList(String.format("element/%s", elementId)));

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
