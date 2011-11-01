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

package org.openqa.grid.e2e.node;

import java.net.MalformedURLException;
import java.net.URL;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * checks that the browser is properly stopped when a selenium1 session times out.
 */
public class NodeTimeOutTest {

  private Hub hub;
  private SelfRegisteringRemote node;

  @BeforeClass(alwaysRun = true)
  public void setup() throws Exception {
    hub = GridTestHelper.getHub();

    // register a selenium 1

    node = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    node.addBrowser(GridTestHelper.getSelenium1FirefoxCapability(), 1);
    node.addBrowser(DesiredCapabilities.firefox(), 1);
    node.setTimeout(5000, 2000);
    node.startRemoteServer();
    node.sendRegistrationRequest();

    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void selenium1TimesOut() throws InterruptedException {
    String url = "http://" + hub.getHost() + ":" + hub.getPort() + "/grid/console";
    System.out.println("A");
    Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", url);
    selenium.start();
    System.out.println("A2");
    selenium.open(url);
    Thread.sleep(8000);
    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);

  }

  @Test
  public void webDriverTimesOut() throws InterruptedException, MalformedURLException {
    String url = "http://" + hub.getHost() + ":" + hub.getPort() + "/grid/console";
    System.out.println("B");
    DesiredCapabilities ff = DesiredCapabilities.firefox();
    WebDriver driver = new RemoteWebDriver(new URL(hub.getUrl() + "/wd/hub"), ff);
    driver.get(url);
    System.out.println("B2");
    Assert.assertEquals(driver.getTitle(), "Grid overview");
    Thread.sleep(8000);
    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);

  }

  @AfterClass
  public void teardown() throws Exception {
    //node.stopRemoteServer();
    //hub.stop();

  }
}
