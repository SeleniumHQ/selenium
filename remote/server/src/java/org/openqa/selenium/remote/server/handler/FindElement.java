package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.List;

public class FindElement extends WebDriverHandler implements JsonParametersAware {

  private By by;
  private String elementId;

  public FindElement(DriverSessions sessions) {
    super(sessions);
  }

  public void setJsonParameters(List<Object> allParameters) throws Exception {
    String method = (String) allParameters.get(0);
    String selector = (String) allParameters.get(1);

    by = new BySelector().pickFrom(method, selector);
  }

  public ResultType call() throws Exception {
    WebElement element = getDriver().findElement(by);
    elementId = getKnownElements().add(element);

    return ResultType.SUCCESS;
  }

  public String getElement() {
    return elementId;
  }
}
