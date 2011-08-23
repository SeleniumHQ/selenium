package org.openqa.grid.internal.mock;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.handler.RequestType;

import java.util.Map;

public class MockedNewSessionRequestHandler extends MockedRequestHandler {

  public MockedNewSessionRequestHandler(Registry registry, Map<String, Object> desiredCapabilities) {
    super(registry);
    setRequestType(RequestType.START_SESSION);
    setDesiredCapabilities(desiredCapabilities);
  }

}
