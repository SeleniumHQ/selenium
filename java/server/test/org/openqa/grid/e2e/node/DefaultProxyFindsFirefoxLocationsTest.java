package org.openqa.grid.e2e.node;

import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Map;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestType;
import org.openqa.grid.web.servlet.handler.WebDriverRequestHandler;
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
  private SelfRegisteringRemote remote;

  @BeforeClass
  public void prepare() throws Exception {

    hub = GridTestHelper.getHub();


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
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void firefoxOnWebDriver() throws MalformedURLException {
    Map<String, Object> ff = new HashMap<String, Object>();
    ff.put(CapabilityType.BROWSER_NAME, "firefox");
    ff.put(CapabilityType.VERSION, "7");
    MockedNewSessionRequestHandlerRemembersForwardedCapability newSessionRequest =
        new MockedNewSessionRequestHandlerRemembersForwardedCapability(hub.getRegistry(), ff);
    newSessionRequest.process();

    Assert.assertEquals(locationFF7,
        newSessionRequest.getForwardedCapability().get(FirefoxDriver.BINARY));
    
    Map<String, Object> ff2 = new HashMap<String, Object>();
    ff2.put(CapabilityType.BROWSER_NAME, "firefox");
    ff2.put(CapabilityType.VERSION, "3");
    MockedNewSessionRequestHandlerRemembersForwardedCapability newSessionRequest2 =
        new MockedNewSessionRequestHandlerRemembersForwardedCapability(hub.getRegistry(), ff2);
    newSessionRequest2.process();

    Assert.assertEquals(locationFF3,
        newSessionRequest2.getForwardedCapability().get(FirefoxDriver.BINARY));

  }


  @AfterClass
  public void teardown() throws Exception {
    hub.stop();
  }

  // TODO freynaud find to extends MockedNewSessionRequestHandler instead.
  class MockedNewSessionRequestHandlerRemembersForwardedCapability
      extends WebDriverRequestHandler {

    public MockedNewSessionRequestHandlerRemembersForwardedCapability(Registry registry,
        Map<String, Object> desiredCapabilities) {
      super(null,null,registry);
      setRequestType(RequestType.START_SESSION);
      setDesiredCapabilities(desiredCapabilities);
    }

    private Map<String, Object> requestedCapability;

    // keep track of what would be forwarded, but don't forward it.
    @Override
    public String forwardNewSessionRequest(TestSession session) {
      requestedCapability = session.getRequestedCapabilities();
      return "";
    }


    public Map<String, Object> getForwardedCapability() {
      return requestedCapability;
    }
  }
}
