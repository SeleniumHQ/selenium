package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.KnownElements;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.lang.reflect.Proxy;

public class ExecuteScript extends WebDriverHandler implements JsonParametersAware {
  private Response response;
  private String script;
  private List<Object> args = new ArrayList<Object>();

  public ExecuteScript(DriverSessions sessions) {
    super(sessions);
  }

  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(List<Object> allParameters) throws Exception {
    script = (String) allParameters.get(0);

    if (allParameters.size() == 1)
      return;

    List<Map<String, Object>> params = (List<Map<String, Object>>) allParameters.get(1);

    for (Map<String, Object> param : params) {
      String type = (String) param.get("type");
      if ("ELEMENT".equals(type)) {
        KnownElements.ProxiedElement element = (KnownElements.ProxiedElement) getKnownElements().get((String) param.get("value"));
        args.add(element.getWrappedElement());
      } else {
        args.add(param.get("value"));
      }
    }
  }

  public ResultType call() throws Exception {
    response = newResponse();

    Object value;
    if (args.size() > 0) {
      value = ((JavascriptExecutor) getDriver()).executeScript(script, args.toArray());
    } else {
      value = ((JavascriptExecutor) getDriver()).executeScript(script);
    }
    Map<String, Object> result = new HashMap<String, Object>();

    if (value == null) {
      result.put("type", "NULL");
    } else if (value instanceof WebElement) {
      String elementId = getKnownElements().add((WebElement) value);
      result.put("type", "ELEMENT");
      result.put("value", String.format("element/%s", elementId));
    } else {
      result.put("type", "VALUE");
      result.put("value", value);
    }

    response.setValue(result);
    
    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }
}
