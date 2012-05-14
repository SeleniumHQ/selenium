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

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.jmock.Mockery;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.internal.ExternalSessionKey;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.exception.NewSessionException;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

public class DefaultProxyFindsFirefoxLocationsTest {

  private static final String locationFF7 = "/home/ff7";
  private static final String locationFF3 = "c:\\program files\\ff3";
  private Hub hub;
  private Registry registry;
  private SelfRegisteringRemote remote;

  @BeforeClass
  public void prepare() throws Exception {

    hub = GridTestHelper.getHub();
    registry = hub.getRegistry();
    registry.setThrowOnCapabilityNotPresent(false);


    remote = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    DesiredCapabilities ff7 = DesiredCapabilities.firefox();
    ff7.setCapability(FirefoxDriver.BINARY, locationFF7);
    ff7.setVersion("7");



    DesiredCapabilities ff3 = DesiredCapabilities.firefox();
    ff3.setCapability(FirefoxDriver.BINARY, locationFF3);
    ff3.setVersion("3");


    remote.addBrowser(ff7, 1);
    remote.addBrowser(ff3, 1);

    remote.sendRegistrationRequest();


  }

  @Test(timeOut = 1000)
  public void firefoxOnWebDriver() throws MalformedURLException {
    Map<String, Object> ff = new HashMap<String, Object>();
    ff.put(CapabilityType.BROWSER_NAME, "firefox");
    ff.put(CapabilityType.VERSION, "7");
    RequestHandler newSessionRequest = new MockedRequestHandler(getNewRequest(ff));
    newSessionRequest.process();

    Assert.assertEquals(locationFF7,
        newSessionRequest.getSession().getRequestedCapabilities().get(FirefoxDriver.BINARY));

    Map<String, Object> ff2 = new HashMap<String, Object>();
    ff2.put(CapabilityType.BROWSER_NAME, "firefox");
    ff2.put(CapabilityType.VERSION, "3");
    RequestHandler newSessionRequest2 = new MockedRequestHandler(getNewRequest(ff2));
    newSessionRequest2.process();

    Assert.assertEquals(locationFF3, newSessionRequest2.getSession().getRequestedCapabilities()
        .get(FirefoxDriver.BINARY));

  }


  @AfterClass
  public void teardown() throws Exception {
    hub.stop();
  }

  
  private SeleniumBasedRequest getNewRequest(Map<String, Object> desiredCapability) {
    Mockery context = new Mockery();
    HttpServletRequest hhtpreq = context.mock(HttpServletRequest.class);
    return new SeleniumBasedRequest(hhtpreq, registry, RequestType.START_SESSION, desiredCapability) {
      public String getNewSessionRequestedCapability(TestSession session) {
        return null;
      }

     
      public ExternalSessionKey extractSession() {
        // TODO Auto-generated method stub
        return null;
      }

      public RequestType extractRequestType() {
        // TODO Auto-generated method stub
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
