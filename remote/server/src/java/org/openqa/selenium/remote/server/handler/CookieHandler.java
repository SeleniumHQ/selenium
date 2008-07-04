// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.json.JSONArray;
import org.openqa.selenium.internal.ReturnedCookie;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;

import java.util.Map;
import java.util.List;

public abstract class CookieHandler extends WebDriverHandler implements JsonParametersAware {

  private Map<String, Object> rawCookie;

  public CookieHandler(DriverSessions sessions) {
    super(sessions);
  }

  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(List<Object> allParameters) throws Exception {
    if (allParameters == null) {
      return;
    }

    rawCookie = (Map<String, Object>) allParameters.get(0);
  }

  protected ReturnedCookie createCookie() {
    if (rawCookie == null) {
      return null;
    }

    String name = (String) rawCookie.get("name");
    String value = (String) rawCookie.get("value");
    String path = (String) rawCookie.get("path");
    String domain = (String) rawCookie.get("domain");
    Boolean secure = (Boolean) rawCookie.get("secure");

    return new ReturnedCookie(name, value, domain, path, null, secure);
  }

}
