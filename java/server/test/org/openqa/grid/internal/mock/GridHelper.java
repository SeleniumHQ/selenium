/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.grid.internal.mock;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.jmock.Mockery;
import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;

/**
 * create mocked object for testing grid internal.
 * Objects will have all the normal object characteristics,
 * and will reserve/release the resources on the hub, but will
 *  not forward the requests to the nodes.
 */
public class GridHelper {

  public static MockedRequestHandler createNewSessionHandler(Registry registry,
      Map<String, Object> desiredCapability) {
    SeleniumBasedRequest request =
        createNewSessionRequest(registry, SeleniumProtocol.WebDriver, desiredCapability);
    MockedRequestHandler handler = new MockedRequestHandler(request, null, registry);
    return handler;
  }


  public static MockedRequestHandler createStopSessionHandler(Registry registry, TestSession session) {
    SeleniumBasedRequest request =
        createMockedRequest(registry, SeleniumProtocol.WebDriver, RequestType.STOP_SESSION, null);
    MockedRequestHandler handler = new MockedRequestHandler(request, null, registry);
    handler.setSession(session);
    return handler;
  }

  public static SeleniumBasedRequest createMockedRequest(Registry registry,
      SeleniumProtocol protocol, RequestType type, Map<String, Object> desiredCapability) {
    Mockery context = new Mockery();
    HttpServletRequest request = context.mock(HttpServletRequest.class);
    return new SeleniumBasedRequest(request, registry, type, desiredCapability) {

      @Override
      public String getNewSessionRequestedCapability(TestSession session) {
        return null;
      }

      @Override
      public ExternalSessionKey extractSession() {
        // TODO Auto-generated method stub
        return null;
      }

      @Override
      public RequestType extractRequestType() {
        // TODO Auto-generated method stub
        return null;
      }

      @Override
      public Map<String, Object> extractDesiredCapability() {
        return getDesiredCapabilities();
      }
    };
  }

  public static SeleniumBasedRequest createNewSessionRequest(Registry registry,
      SeleniumProtocol protocol, Map<String, Object> desiredCapability) {
    return createMockedRequest(registry, protocol, RequestType.START_SESSION, desiredCapability);
  }
}
