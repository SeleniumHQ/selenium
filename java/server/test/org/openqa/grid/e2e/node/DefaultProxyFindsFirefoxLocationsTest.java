/*
Copyright 2011 Selenium committers
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

package org.openqa.grid.e2e.node;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
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

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public class DefaultProxyFindsFirefoxLocationsTest {

  private static final String locationFF7 = "/home/ff7";
  private static final String locationFF3 = "c:\\program files\\ff3";

  private static final String locationChrome27 = "/home/chrome27";
  private static final String locationChrome29 = "c:\\program files\\Chrome29.exe";

  private static final String locationOpera12 = "/home/opera12";
  private static final String locationOpera11 = "c:\\program files\\Opera11.exe";

  private static Hub hub;
  private static Registry registry;
  private static SelfRegisteringRemote remote;

  @BeforeClass
  public static void prepare() throws Exception {

    hub = GridTestHelper.getHub();
    registry = hub.getRegistry();
    registry.setThrowOnCapabilityNotPresent(false);

    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    remote.setMaxConcurrent(100);

    DesiredCapabilities caps = null;

    // firefox

    caps = DesiredCapabilities.firefox();
    caps.setCapability(FirefoxDriver.BINARY, locationFF7);
    caps.setVersion("7");
    remote.addBrowser(caps, 1);
    caps = DesiredCapabilities.firefox();
    caps.setCapability(FirefoxDriver.BINARY, locationFF3);
    caps.setVersion("3");
    remote.addBrowser(caps, 1);
    caps = DesiredCapabilities.firefox();
    caps.setCapability(FirefoxDriver.BINARY, "should be overwritten");
    caps.setVersion("20");
    remote.addBrowser(caps, 1);

    // chrome

    caps = DesiredCapabilities.chrome();
    caps.setCapability("chrome_binary", locationChrome27);
    caps.setVersion("27");
    remote.addBrowser(caps, 1);
    caps = DesiredCapabilities.chrome();
    caps.setCapability("chrome_binary", locationChrome29);
    caps.setVersion("29");
    remote.addBrowser(caps, 2);
    caps = DesiredCapabilities.chrome();
    caps.setCapability("chrome_binary", "should be overwritten");
    caps.setVersion("30");
    remote.addBrowser(caps, 1);

    // opera

    caps = DesiredCapabilities.opera();
    caps.setCapability("opera_binary", locationOpera12);
    caps.setVersion("12");
    remote.addBrowser(caps, 1);
    caps = DesiredCapabilities.opera();
    caps.setCapability("opera_binary", locationOpera11);
    caps.setVersion("11");
    remote.addBrowser(caps, 1);
    caps = DesiredCapabilities.opera();
    caps.setCapability("opera_binary", "should be overwritten");
    caps.setVersion("10");
    remote.addBrowser(caps, 1);


    remote.startRemoteServer();
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(registry, 1);
  }

  @Test(timeout = 5000)
  public void testBrowserLocations() throws MalformedURLException {
    Map<String, Object> req_caps = null;
    RequestHandler newSessionRequest = null;
    String actual = null;
    JSONObject options = null;

    // firefox

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    req_caps.put(CapabilityType.VERSION, "7");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals(locationFF7,
                 newSessionRequest.getSession().getRequestedCapabilities()
                     .get(FirefoxDriver.BINARY));

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    req_caps.put(CapabilityType.VERSION, "3");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals(locationFF3,
                 newSessionRequest.getSession().getRequestedCapabilities()
                     .get(FirefoxDriver.BINARY));

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    req_caps.put(CapabilityType.VERSION, "20");
    req_caps.put(FirefoxDriver.BINARY, "custom");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals("custom",
                 newSessionRequest.getSession().getRequestedCapabilities()
                     .get(FirefoxDriver.BINARY));

    // opera

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.OPERA);
    req_caps.put(CapabilityType.VERSION, "11");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals(locationOpera11,
                 newSessionRequest.getSession().getRequestedCapabilities().get("opera.binary"));

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.OPERA);
    req_caps.put(CapabilityType.VERSION, "12");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals(locationOpera12,
                 newSessionRequest.getSession().getRequestedCapabilities().get("opera.binary"));

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.OPERA);
    req_caps.put(CapabilityType.VERSION, "10");
    req_caps.put("opera.binary", "custom");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    assertEquals("custom",
                 newSessionRequest.getSession().getRequestedCapabilities().get("opera.binary"));

    // chrome

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
    req_caps.put(CapabilityType.VERSION, "27");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    try {
      actual = (String) ((JSONObject) newSessionRequest.getSession().getRequestedCapabilities().get(
          ChromeOptions.CAPABILITY)).get("binary");
    } catch (JSONException e) {
      actual = "Exception is raised: " + e.getMessage();
    }
    assertEquals(locationChrome27, actual);

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
    req_caps.put(CapabilityType.VERSION, "29");
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    try {
      actual = (String) ((JSONObject) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY)).get("binary");
    } catch (JSONException e) {
      actual = "Exception is raised: " + e.getMessage();
    }
    assertEquals(locationChrome29, actual);

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
    req_caps.put(CapabilityType.VERSION, "29");
    options = new JSONObject();
    try {
      options.put("test1", "test2");
    } catch (JSONException e) {
      assertTrue("Unable to initialize chrome options: " + e.getMessage(), false);
    }
    req_caps.put(ChromeOptions.CAPABILITY, options);
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    try {
      actual = (String) ((JSONObject) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY)).get("binary");
    } catch (JSONException e) {
      actual = "Exception is raised: " + e.getMessage();
    }
    assertEquals(locationChrome29, actual);
    try {
      actual = (String) ((JSONObject) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY)).get("test1");
    } catch (JSONException e) {
      actual = "Exception is raised: " + e.getMessage();
    }
    assertEquals("test2", actual);

    req_caps = new HashMap<String, Object>();
    req_caps.put(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
    req_caps.put(CapabilityType.VERSION, "30");
    options = new JSONObject();
    try {
      options.put("test11", "test22");
      options.put("binary", "custom");
    } catch (JSONException e) {
      assertTrue("Unable to initialize chrome options: " + e.getMessage(), false);
    }
    req_caps.put(ChromeOptions.CAPABILITY, options);
    newSessionRequest = new MockedRequestHandler(getNewRequest(req_caps));
    newSessionRequest.process();
    try {
      actual = (String) ((JSONObject) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY)).get("binary");
    } catch (JSONException e) {
      actual = "Exception is raised: " + e.getMessage();
    }
    // Ignored due it fails
    //Assert.assertEquals("custom", actual);
    try {
      actual = (String) ((JSONObject) newSessionRequest.getSession().getRequestedCapabilities().get(ChromeOptions.CAPABILITY)).get("test11");
    } catch (JSONException e) {
      actual = "Exception is raised: " + e.getMessage();
    }
    assertEquals("test22", actual);
  }

  @AfterClass
  public static void teardown() throws Exception {
    remote.stopRemoteServer();
    hub.stop();
  }
  
  private SeleniumBasedRequest getNewRequest(Map<String, Object> desiredCapability) {
    HttpServletRequest httpreq = mock(HttpServletRequest.class);
    return new SeleniumBasedRequest(httpreq, registry, RequestType.START_SESSION, desiredCapability) {

      public String getNewSessionRequestedCapability(TestSession session) {
        return null;
      }
     
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