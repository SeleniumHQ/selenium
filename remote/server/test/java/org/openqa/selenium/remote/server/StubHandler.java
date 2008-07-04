package org.openqa.selenium.remote.server;

import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultType;

public class StubHandler implements Handler {

  public ResultType handle() {
    return ResultType.SUCCESS;
  }
}