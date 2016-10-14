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
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.exception.NewSessionException;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.SeleniumServer;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public class DefaultProxyFindsFirefoxLocationsTest {

  private static final String LOCATION_FF_7 = "/home/ff7";
  private static final String LOCATION_FF_3 = "c:\\program files\\ff3";

  private static final String LOCATION_CHROME_27 = "/home/chrome27";
  private static final String LOCATION_CHROME_29 = "c:\\program files\\Chrome29.exe";

  private Hub hub;
  private Registry registry;
  private SelfRegisteringRemote remote;

  @Before
  public void prepare() throws Exception {

    hub = GridTestHelper.getHub();
    registry = hub.getRegistry();
    registry.setThrowOnCapabilityNotPresent(false);

    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    remote.setMaxConcurrent(100);

    DesiredCapabilities caps = null;

    // firefox

    caps = DesiredCapabilities.firefox();
    caps.setCapability(FirefoxDriver.BINARY, LOCATION_FF_7);
    caps.setVersion("7");
    remote.addBrowser(caps, 1);
    caps = DesiredCapabilities.firefox();
    caps.setCapability(FirefoxDriver.BINARY, LOCATION_FF_3);
    caps.setVersion("3");
    remote.addBrowser(caps, 1);
    caps = DesiredCapabilities.firefox();
    caps.setCapability(FirefoxDriver.BINARY, "should be overwritten");
    caps.setVersion("20");
    remote.addBrowser(caps, 1);

    // chrome

    caps = DesiredCapabilities.chrome();
    caps.setCapability("chrome_binary", LOCATION_CHROME_27);
    caps.setVersion("27");
    remote.addBrowser(caps, 1);
    caps = DesiredCapabilities.chrome();
    caps.setCapability("chrome_binary", LOCATION_CHROME_29);
    caps.setVersion("29");
    remote.addBrowser(caps, 2);
    caps = DesiredCapabilities.chrome();
    caps.setCapability("chrome_binary", "should be overwritten");
    caps.setVersion("30");
    remote.addBrowser(caps, 1);

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(registry, 1);
  }

  @Test(timeout = 5000)
  public void testBrowserLocations() throws MalformedURLException {
    Map<String, Object> req_caps = null;
    RequestHandler newSessionRequest = null;

    // firefox

    req_caps = new HashMap<>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    req_caps.put(CapabilityType.VERSION, "7");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals(LOCATION_FF_7,
                 newSessionRequest.getSession().getRequestedCapabilities()
                     .get(FirefoxDriver.BINARY));

    req_caps = new HashMap<>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    req_caps.put(CapabilityType.VERSION, "3");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals(LOCATION_FF_3,
                 newSessionRequest.getSession().getRequestedCapabilities()
                     .get(FirefoxDriver.BINARY));

    req_caps = new HashMap<>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    req_caps.put(CapabilityType.VERSION, "20");
    req_caps.put(FirefoxDriver.BINARY, "custom");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals("custom",
                 newSessionRequest.getSession().getRequestedCapabilities()
                     .get(FirefoxDriver.BINARY));

    // chrome

    req_caps = new HashMap<>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
    req_caps.put(CapabilityType.VERSION, "27");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();

    Map<String, Object> json = (Map<String, Object>) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY);
    assertEquals(LOCATION_CHROME_27, json.get("binary"));

    req_caps = new HashMap<>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
    req_caps.put(CapabilityType.VERSION, "29");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();

    json = (Map<String, Object>) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY);
    assertEquals(LOCATION_CHROME_29, json.get("binary"));

    req_caps = new HashMap<>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
    req_caps.put(CapabilityType.VERSION, "29");
    Map<String, Object> options = new HashMap<>();
    options.put("test1", "test2");
    req_caps.put(ChromeOptions.CAPABILITY, options);
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();

    json = (Map<String, Object>) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY);
    assertEquals(LOCATION_CHROME_29, json.get("binary"));
    assertEquals("test2", json.get("test1"));

    req_caps = new HashMap<>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
    req_caps.put(CapabilityType.VERSION, "30");
    options = new HashMap<>();
    options.put("test11", "test22");
    options.put("binary", "custom");
    req_caps.put(ChromeOptions.CAPABILITY, options);
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();

    json = (Map<String, Object>) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY);
    assertEquals("custom", json.get("binary"));
    assertEquals("test22", json.get("test11"));
  }

  @After
  public void teardown() throws Exception {
    remote.stopRemoteServer();
    hub.stop();
  }

  private SeleniumBasedRequest getNewRequest(Map<String, Object> desiredCapability) {
    HttpServletRequest httpreq = mock(HttpServletRequest.class);
    return new SeleniumBasedRequest(httpreq, registry, RequestType.START_SESSION, desiredCapability) {

      public ExternalSessionKey extractSession() {
        return null;
      }

      public RequestType extractRequestType() {
        return null;
      }

      public Map<String, Object> extractDesiredCapability() {
        return getDesiredCapabilities();
      }
    };
  }

  class MockedRequestHandler extends RequestHandler {

    public MockedRequestHandler(SeleniumBasedRequest request) {
      super(request,null, request.getRegistry());
    }

    public void setSession(TestSession session) {
      super.setSession(session);
    }

    @Override
    protected void forwardRequest(TestSession session, RequestHandler handler) throws IOException {}

    @Override
    public void forwardNewSessionRequestAndUpdateRegistry(TestSession session)
        throws NewSessionException {}
  }

}
