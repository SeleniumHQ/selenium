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

import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.TestWaiter;
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
    Selenium selenium = new DefaultSelenium(hub.getHost(), hub.getPort(), "*firefox", url);
    selenium.start();
    selenium.open(url);
    
    TestWaiter.waitFor(new Callable<Integer>() {
      public Integer call() throws Exception {
        Integer i = hub.getRegistry().getActiveSessions().size();
        if (i != 0) {
          return null;
        } else {
          return i;
        }
      }
    },8,TimeUnit.SECONDS);
    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);

  }

  @Test
  public void webDriverTimesOut() throws InterruptedException, MalformedURLException {
    String url = "http://" + hub.getHost() + ":" + hub.getPort() + "/grid/console";
    DesiredCapabilities ff = DesiredCapabilities.firefox();
    WebDriver driver = new RemoteWebDriver(new URL(hub.getUrl() + "/wd/hub"), ff);
    driver.get(url);
    Assert.assertEquals(driver.getTitle(), "Grid overview");
    TestWaiter.waitFor(new Callable<Integer>() {
      public Integer call() throws Exception {
        Integer i = hub.getRegistry().getActiveSessions().size();
        if (i != 0) {
          return null;
        } else {
          return i;
        }
      }
    },8,TimeUnit.SECONDS);
    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 0);

  }

  @AfterClass
  public void teardown() throws Exception {
    node.stopRemoteServer();
    hub.stop();

  }
}
