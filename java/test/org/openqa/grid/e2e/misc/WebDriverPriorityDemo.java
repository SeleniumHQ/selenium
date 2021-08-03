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

/**
 * how to setup a grid that does not use FIFO for the requests.
 */
public class WebDriverPriorityDemo {
//
//  private Hub hub = null;
//  private GridRegistry registry = null;
//
//  private SelfRegisteringRemote remote = null;
//
//  private URL hubURL = null;
//  private URL driverURL = null;
//  private URL consoleURL = null;
//
//  private WebDriver runningOne = null;
//  private volatile WebDriver importantOne = null;
//  private volatile boolean importantOneStarted = false;
//
//  private DesiredCapabilities browser = null;
//  private DesiredCapabilities important_browser = null;
//
//  @Before
//  public void prepare() {
//
//    // start a small grid that only has 1 testing slot : htmlunit
//
//
//    // assigning a priority rule where requests with the flag "important" go first.
//    GridHubConfiguration hubConfiguration = new GridHubConfiguration();
//    hubConfiguration.prioritizer = new Prioritizer() {
//      @Override
//      public int compareTo(Map<String, Object> a, Map<String, Object> b) {
//        boolean aImportant =
//            a.get("grid:important") == null ? false : Boolean.parseBoolean(a.get("grid:important")
//                                                                               .toString());
//        boolean bImportant =
//            b.get("grid:important") == null ? false : Boolean.parseBoolean(b.get("grid:important")
//                                                                               .toString());
//        if (aImportant == bImportant) {
//          return 0;
//        }
//        if (aImportant && !bImportant) {
//          return -1;
//        }
//        return 1;
//      }
//    };
//
//    hub = GridTestHelper.getHub(hubConfiguration, true);
//    registry = hub.getRegistry();
//
//    hubURL = hub.getUrl();
//    driverURL = hub.getWebDriverHubRequestURL();
//    consoleURL = hub.getConsoleURL();
//
//
//    // initialize node
//
//    browser = GridTestHelper.getDefaultBrowserCapability();
//    important_browser = GridTestHelper.getDefaultBrowserCapability();
//    important_browser.setCapability("grid:important", true);
//
//    remote = GridTestHelper.getRemoteWithoutCapabilities(hubURL, GridRole.NODE);
//    remote.addBrowser(browser, 1);
//
//    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
//    remote.startRemoteServer();
//    remote.setMaxConcurrent(1);
//    remote.setTimeout(-1, -1);
//    remote.sendRegistrationRequest();
//
//    RegistryTestHelper.waitForNode(registry, 1);
//    assertEquals(1, registry.getAllProxies().size());
//    assertEquals(0, registry.getNewSessionRequestCount());
//    assertEquals(0, registry.getActiveSessions().size());
//
//
//    // mark the grid 100% busy = having 1 browser test running.
//    runningOne = new RemoteWebDriver(driverURL, browser);
//    visitHubConsole(runningOne);
//
//    RegistryTestHelper.waitForActiveTestSessionCount(registry, 1);
//    assertEquals(1, registry.getAllProxies().size());
//    assertEquals(0, registry.getNewSessionRequestCount());
//    assertEquals(1, registry.getActiveSessions().size());
//
//
//    // queuing 5 requests on the grid.
//    for (int i = 0; i < 5; i++) {
//      new Thread(new Runnable() { // Thread safety reviewed
//        @Override
//        public void run() {
//          try {
//            new RemoteWebDriver(driverURL, browser);
//          } catch (Exception e) {
//            throw new RuntimeException("Exception is occurred during driver instanciating", e);
//          }
//        }
//      }).start();
//    }
//
//    RegistryTestHelper.waitForNewSessionRequestCount(registry, 5);
//    assertEquals(1, registry.getAllProxies().size());
//    assertEquals(5, registry.getNewSessionRequestCount());
//    assertEquals(1, registry.getActiveSessions().size());
//
//
//    // adding a request with high priority at the end of the queue
//    new Thread(new Runnable() { // Thread safety reviewed
//      @Override
//      public void run() {
//        try {
//          importantOne = new RemoteWebDriver(driverURL, important_browser);
//          importantOneStarted = true;
//        } catch (Exception e) {
//          throw new RuntimeException("Exception is occurred during driver instanciating", e);
//        }
//      }
//    }).start();
//
//    RegistryTestHelper.waitForNewSessionRequestCount(registry, 6);
//    assertEquals(1, registry.getAllProxies().size());
//    assertEquals(6, registry.getNewSessionRequestCount());
//    assertEquals(1, registry.getActiveSessions().size());
//
//
//    // then 5 more non-important requests
//    for (int i = 0; i < 5; i++) {
//      new Thread(new Runnable() { // Thread safety reviewed
//        @Override
//        public void run() {
//          try {
//            new RemoteWebDriver(driverURL, browser);
//          } catch (Exception e) {
//            throw new RuntimeException("Exception is occurred during driver instanciating", e);
//          }
//        }
//      }).start();
//    }
//
//    RegistryTestHelper.waitForNewSessionRequestCount(registry, 11);
//    assertEquals(1, registry.getAllProxies().size());
//    assertEquals(11, registry.getNewSessionRequestCount());
//    assertEquals(1, registry.getActiveSessions().size());
//  }
//
//  @Test(timeout = 20000)
//  public void test5ValidateStateAndPickTheImportantOne() throws InterruptedException {
//    try {
//      // closing the running test.
//      runningOne.quit();
//
//      RegistryTestHelper.waitForNewSessionRequestCount(registry, 10);
//      assertEquals(1, registry.getAllProxies().size());
//      assertEquals(10, registry.getNewSessionRequestCount());
//      assertEquals(1, registry.getActiveSessions().size());
//
//      // TODO freynaud : sometines does not start. FF pops up, but address bar remains empty.
//      while (!importantOneStarted) {
//        Thread.sleep(250);
//        System.out.println("waiting for browser to start");
//      }
//
//      visitHubConsole(importantOne);
//
//    } finally {
//      // cleaning the queue to avoid having some browsers left over after
//      // the test
//      registry.clearNewSessionRequests();
//      importantOne.quit();
//    }
//
//  }
//
//  // simple helper
//  private void visitHubConsole(WebDriver driver) {
//    driver.get(consoleURL.toString());
//    assertEquals(driver.getTitle(), "Grid Console");
//  }
//
//  @After
//  public void stop() {
//    if (remote != null) {
//      remote.stopRemoteServer();
//    }
//    if (hub != null) {
//      hub.stop();
//    }
//  }
}
