// Copyright 2008 Google Inc.  All Rights Reserved.

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.Speed;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.List;

public class SetMouseSpeed extends WebDriverHandler implements JsonParametersAware {
  private Speed speed;

  public SetMouseSpeed(DriverSessions sessions) {
    super(sessions);
  }

  public void setJsonParameters(List<Object> allParameters) throws Exception {
    speed = Speed.valueOf((String) allParameters.get(0));
  }

  public ResultType call() throws Exception {
    getDriver().manage().setSpeed(speed);

    return ResultType.SUCCESS;
  }
}
