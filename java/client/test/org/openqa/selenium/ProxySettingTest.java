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

package org.openqa.selenium;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.ProxyServer;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

public class ProxySettingTest extends JUnit4TestBase {

  private ProxyServer proxyServer;

  @Before
  public void newProxyInstance() {
    proxyServer = new ProxyServer();
  }

  @Before
  public void avoidRemote() {
    // TODO: Resolve why these tests don't work on the remote server
    assumeTrue(TestUtilities.isLocal());
  }

  @Ignore({ANDROID, CHROME, HTMLUNIT, IE, IPHONE, OPERA, OPERA_MOBILE, SAFARI, SELENESE})
  @Test
  public void canConfigureProxyWithRequiredCapability() {
    Proxy proxyToUse = proxyServer.asProxy();
    DesiredCapabilities requiredCaps = new DesiredCapabilities();
    requiredCaps.setCapability(PROXY, proxyToUse);

    WebDriver driver = new WebDriverBuilder().setRequiredCapabilities(requiredCaps).get();
    driver.get(pages.simpleTestPage);
    driver.quit();

    assertTrue("Proxy should have been called", proxyServer.hasBeenCalled("simpleTest.html"));
  }

  @Ignore({ANDROID, CHROME, HTMLUNIT, IE, IPHONE, OPERA, OPERA_MOBILE, SAFARI, SELENESE})
  @Test
  public void requiredProxyCapabilityShouldHavePriority() {
    ProxyServer desiredProxyServer = new ProxyServer();
    Proxy desiredProxy = desiredProxyServer.asProxy();
    Proxy requiredProxy = proxyServer.asProxy();

    DesiredCapabilities desiredCaps = new DesiredCapabilities();
    desiredCaps.setCapability(PROXY, desiredProxy);
    DesiredCapabilities requiredCaps = new DesiredCapabilities();
    requiredCaps.setCapability(PROXY, requiredProxy);

    WebDriver driver = new WebDriverBuilder().setDesiredCapabilities(desiredCaps).
        setRequiredCapabilities(requiredCaps).get();
    driver.get(pages.simpleTestPage);
    driver.quit();

    assertFalse("Desired proxy should not have been called.",
                desiredProxyServer.hasBeenCalled("simpleTest.html"));
    assertTrue("Required proxy should have been called.",
               proxyServer.hasBeenCalled("simpleTest.html"));

    desiredProxyServer.destroy();
  }

  @After
  public void deleteProxyInstance() {
    if (proxyServer != null) {
      proxyServer.destroy();
    }
  }

}