// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.grid.e2e.node;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.exception.NewSessionException;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.SeleniumServer;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public class DefaultProxyInjectsConfigurationUuidTest {

  private Hub hub;
  private GridRegistry registry;
  private SelfRegisteringRemote remote;

  private DesiredCapabilities ff20_caps;

  @Before
  public void prepare() throws Exception {

    hub = GridTestHelper.getHub();
    registry = hub.getRegistry();
    registry.setThrowOnCapabilityNotPresent(false);

    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    remote.setMaxConcurrent(100);

    ff20_caps = new DesiredCapabilities(new FirefoxOptions());
    ff20_caps.setCapability(FirefoxDriver.BINARY, "should be overwritten");
    ff20_caps.setVersion("20");
    remote.addBrowser(ff20_caps, 1);

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(registry, 1);
  }

  @Test(timeout = 5000)
  public void testProxyInjectsConfigurationUUID() {
    Map<String, Object> req_caps = new HashMap<>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    req_caps.put(CapabilityType.VERSION, "20");
    req_caps.put(FirefoxDriver.BINARY, "custom");

    RequestHandler newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();

    assertEquals(ff20_caps.getCapability(GridNodeConfiguration.CONFIG_UUID_CAPABILITY),
                 newSessionRequest.getSession().getRequestedCapabilities()
                     .get(GridNodeConfiguration.CONFIG_UUID_CAPABILITY));
    assertEquals("custom",
                 newSessionRequest.getSession().getRequestedCapabilities()
                     .get(FirefoxDriver.BINARY));
  }

  @After
  public void teardown() {
    remote.stopRemoteServer();
    hub.stop();
  }

  private SeleniumBasedRequest getNewRequest(Map<String, Object> desiredCapability) {
    HttpServletRequest httpreq = mock(HttpServletRequest.class);
    return new SeleniumBasedRequest(httpreq, registry, RequestType.START_SESSION, desiredCapability) {

      @Override
      public ExternalSessionKey extractSession() {
        return null;
      }

      @Override
      public RequestType extractRequestType() {
        return null;
      }

      @Override
      public Map<String, Object> extractDesiredCapability() {
        return getDesiredCapabilities();
      }
    };
  }

  class MockedRequestHandler extends RequestHandler {

    public MockedRequestHandler(SeleniumBasedRequest request) {
      super(request,null, request.getRegistry());
    }

    @Override
    public void setSession(TestSession session) {
      super.setSession(session);
    }

    @Override
    protected void forwardRequest(TestSession session, RequestHandler handler) {}

    @Override
    public void forwardNewSessionRequestAndUpdateRegistry(TestSession session)
        throws NewSessionException {}
  }

}
