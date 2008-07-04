package org.openqa.selenium.remote.server.handler;

import org.json.JSONArray;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.List;

public class SetVisible extends WebDriverHandler implements JsonParametersAware {

  private boolean visible;

  public SetVisible(DriverSessions sessions) {
    super(sessions);
  }

  public void setJsonParameters(List<Object> allParameters) throws Exception {
    visible = (Boolean) allParameters.get(0);
  }

  public ResultType handle() throws Exception {
    getDriver().setVisible(visible);
    return ResultType.SUCCESS;
  }
}
