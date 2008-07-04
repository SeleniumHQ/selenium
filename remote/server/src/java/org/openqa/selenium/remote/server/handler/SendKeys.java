package org.openqa.selenium.remote.server.handler;

import org.json.JSONArray;
import org.json.JSONObject;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SendKeys extends WebDriverHandler implements JsonParametersAware {

  private String elementId;
  private List<CharSequence> keys = new ArrayList<CharSequence>();

  public SendKeys(DriverSessions sessions) {
    super(sessions);
  }

  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(List<Object> allParameters) throws Exception {
    Map namedParameters = (Map) allParameters.get(0);

    elementId = (String) namedParameters.get("id");

    List<String> rawKeys = (List) namedParameters.get("value");
    for (String key : rawKeys) {
      keys.add(key);
    }
  }

  public ResultType handle() throws Exception {
    String[] keysToSend = keys.toArray(new String[0]);
    getKnownElements().get(elementId).sendKeys(keysToSend);

    return ResultType.SUCCESS;
  }
}
