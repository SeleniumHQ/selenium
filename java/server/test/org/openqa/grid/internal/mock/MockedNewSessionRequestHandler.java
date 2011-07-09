package org.openqa.grid.internal.mock;

import java.util.Map;

import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.handler.RequestType;

public class MockedNewSessionRequestHandler extends MockedRequestHandler {

  public MockedNewSessionRequestHandler(Registry registry, Map<String, Object> desiredCapabilities) {
    super(registry);
    setRequestType(RequestType.START_SESSION);
    setDesiredCapabilities(desiredCapabilities);
  }

}
