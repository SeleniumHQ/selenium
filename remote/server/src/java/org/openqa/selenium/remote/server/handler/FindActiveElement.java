package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Collections;

public class FindActiveElement extends WebDriverHandler {
    private Response response;

    public FindActiveElement(DriverSessions sessions) {
      super(sessions);
    }

    public ResultType call() throws Exception {
      response = newResponse();

      WebElement element = getDriver().switchTo().activeElement();
      String elementId = getKnownElements().add(element);
      response.setValue(Collections.singletonList(String.format("element/%s", elementId)));

      return ResultType.SUCCESS;
    }

    public Response getResponse() {
      return response;
    }
}
