package org.openqa.selenium.remote.server.handler;

import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.List;
import java.util.Map;

public class NewSession implements Handler, JsonParametersAware {

  private DriverSessions allSessions;
  private Capabilities desiredCapabilities;
  private SessionId sessionId;

  public NewSession(DriverSessions allSession) {
    this.allSessions = allSession;
  }

  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(List<Object> allParameters) throws Exception {
    desiredCapabilities = new DesiredCapabilities((Map<String, Object>) allParameters.get(0));
  }

  public ResultType handle() throws Exception {
    sessionId = allSessions.newSession(desiredCapabilities);
    return ResultType.SUCCESS;
  }

  public String getSessionId() {
    return sessionId.toString();
  }

  public String getContext() {
    return "context";
  }
}
