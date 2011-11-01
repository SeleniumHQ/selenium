/*
Copyright 2011 WebDriver committers
Copyright 2011 Software Freedom Conservancy

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

import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.openqa.grid.web.servlet.handler.WebDriverRequestHandler;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class MockedRequestHandler extends WebDriverRequestHandler {

  public MockedRequestHandler(Registry registry) {
    super(null, null, registry);
  }

  public MockedRequestHandler(HttpServletRequest request, HttpServletResponse response,
      Registry registry) {
    super(request, response, registry);
  }

  @Override
  public ExternalSessionKey forwardNewSessionRequest(TestSession session) {
    // System.out.println("forwarding to " + session.getInternalKey());
    return ExternalSessionKey.fromString("");
  }

  @Override
  protected void forwardRequest(TestSession session, RequestHandler handler)
      throws java.io.IOException {
    // System.out.println("forwarding request to "+session);
  }

  @Override
  public void setSession(TestSession session) {
    super.setSession(session);
  }

  public TestSession getTestSession() {
    return super.getSession();
  }

  @Override
  public void setDesiredCapabilities(Map<String, Object> desiredCapabilities) {
    super.setDesiredCapabilities(desiredCapabilities);
  }

  @Override
  public void setRequestType(RequestType requestType) {
    super.setRequestType(requestType);
  }
}
