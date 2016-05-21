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

package org.openqa.grid.e2e.misc;

import static org.junit.Assert.assertEquals;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.server.SeleniumServer;

import java.net.URL;
import java.util.Map;

/**
 * how to setup a grid that does not use FIFO for the requests.
 */
public class WebDriverPriorityDemo {

  private static Hub hub = null;
  private static Registry registry = null;

  private static SelfRegisteringRemote remote = null;

  private static URL hubURL = null;
  private static URL driverURL = null;
  private static URL consoleURL = null;

  static WebDriver runningOne = null;
  volatile static WebDriver importantOne = null;
  volatile static boolean importantOneStarted = false;

  private static DesiredCapabilities browser = null;
  private static DesiredCapabilities important_browser = null;

  @BeforeClass
  public static void prepare() throws Exception {

    // start a small grid that only has 1 testing slot : htmlunit

    hub = GridTestHelper.getHub();
    registry = hub.getRegistry();

    hubURL = hub.getUrl();
    driverURL = hub.getWebDriverHubRequestURL();
    consoleURL = hub.getConsoleURL();

    // assigning a priority rule where requests with the flag "important" go first.
    registry.getConfiguration().prioritizer = new Prioritizer() {
      public int compareTo(Map<String, Object> a, Map<String, Object> b) {
        boolean aImportant =
            a.get("_important") == null ? false : Boolean.parseBoolean(a.get("_important")
                                                                           .toString());
        boolean bImportant =
            b.get("_important") == null ? false : Boolean.parseBoolean(b.get("_important")
                                                                           .toString());
        if (aImportant == bImportant) {
          return 0;
        }
        if (aImportant && !bImportant) {
          return -1;
        }
        return 1;
      }
    };

    // initialize node

    browser = GridTestHelper.getDefaultBrowserCapability();
    important_browser = GridTestHelper.getDefaultBrowserCapability();
    important_browser.setCapability("_important", true);

    remote = GridTestHelper.getRemoteWithoutCapabilities(hubURL, GridRole.NODE);
    remote.addBrowser(browser, 1);

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();
    remote.setMaxConcurrent(1);
    remote.setTimeout(-1, -1);
    remote.sendRegistrationRequest();

    RegistryTestHelper.waitForNode(registry, 1);
    assertEquals(1, registry.getAllProxies().size());
    assertEquals(0, registry.getNewSessionRequestCount());
    assertEquals(0, registry.getActiveSessions().size());


    // mark the grid 100% busy = having 1 browser test running.
    runningOne = new RemoteWebDriver(driverURL, browser);
    visitHubConsole(runningOne);

    RegistryTestHelper.waitForActiveTestSessionCount(registry, 1);
    assertEquals(1, registry.getAllProxies().size());
    assertEquals(0, registry.getNewSessionRequestCount());
    assertEquals(1, registry.getActiveSessions().size());


    // queuing 5 requests on the grid.
    for (int i = 0; i < 5; i++) {
      new Thread(new Runnable() { // Thread safety reviewed
        public void run() {
          try {
            new RemoteWebDriver(driverURL, browser);
          } catch (Exception e) {
            throw new RuntimeException("Exception is occurred during driver instanciating", e);
          }
        }
      }).start();
    }

    RegistryTestHelper.waitForNewSessionRequestCount(registry, 5);
    assertEquals(1, registry.getAllProxies().size());
    assertEquals(5, registry.getNewSessionRequestCount());
    assertEquals(1, registry.getActiveSessions().size());


    // adding a request with high priority at the end of the queue
    new Thread(new Runnable() { // Thread safety reviewed
      public void run() {
        try {
          importantOne = new RemoteWebDriver(driverURL, important_browser);
          importantOneStarted = true;
        } catch (Exception e) {
          throw new RuntimeException("Exception is occurred during driver instanciating", e);
        }
      }
    }).start();

    RegistryTestHelper.waitForNewSessionRequestCount(registry, 6);
    assertEquals(1, registry.getAllProxies().size());
    assertEquals(6, registry.getNewSessionRequestCount());
    assertEquals(1, registry.getActiveSessions().size());


    // then 5 more non-important requests
    for (int i = 0; i < 5; i++) {
      new Thread(new Runnable() { // Thread safety reviewed
        public void run() {
          try {
            new RemoteWebDriver(driverURL, browser);
          } catch (Exception e) {
            throw new RuntimeException("Exception is occurred during driver instanciating", e);
          }
        }
      }).start();
    }

    RegistryTestHelper.waitForNewSessionRequestCount(registry, 11);
    assertEquals(1, registry.getAllProxies().size());
    assertEquals(11, registry.getNewSessionRequestCount());
    assertEquals(1, registry.getActiveSessions().size());
  }

  @Test(timeout = 20000)
  public void test5ValidateStateAndPickTheImportantOne() throws InterruptedException {
    try {

      // closing the running test.
      runningOne.quit();

      RegistryTestHelper.waitForNewSessionRequestCount(registry, 10);
      assertEquals(1, registry.getAllProxies().size());
      assertEquals(10, registry.getNewSessionRequestCount());
      assertEquals(1, registry.getActiveSessions().size());

      // TODO freynaud : sometines does not start. FF pops up, but address bar remains empty.
      while (!importantOneStarted) {
        Thread.sleep(250);
        System.out.println("waiting for browser to start");
      }

      visitHubConsole(importantOne);

    } finally {
      // cleaning the queue to avoid having some browsers left over after
      // the test
      registry.clearNewSessionRequests();
      importantOne.quit();
    }

  }

  // simple helper
  static private void visitHubConsole(WebDriver driver) {
    driver.get(consoleURL.toString());
    assertEquals(driver.getTitle(), "Grid Console");
  }

  @AfterClass
  public static void stop() throws Exception {
    if (remote != null) {
      remote.stopRemoteServer();
    }
    if (hub != null) {
      hub.stop();
    }
  }
}
