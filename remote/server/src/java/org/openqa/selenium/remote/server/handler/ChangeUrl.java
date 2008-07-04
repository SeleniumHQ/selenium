package org.openqa.selenium.remote.server.handler;

import org.json.JSONArray;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.List;

public class ChangeUrl extends WebDriverHandler implements JsonParametersAware {

  private String url;

  public ChangeUrl(DriverSessions sessions) {
    super(sessions);
  }

  public void setJsonParameters(List<Object> allParameters) throws Exception {
    url = (String) allParameters.get(0);
  }

  public ResultType handle() throws Exception {
    getDriver().get(url);

    return ResultType.SUCCESS;
  }
}
