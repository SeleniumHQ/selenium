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

package org.openqa.grid.e2e.misc;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import org.testng.Assert;
import org.testng.Reporter;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

/**
 * how to setup a grid that does not use FIFO for the requests.
 */
public class WebDriverPriorityDemo {

  private Hub hub;
  private URL hubURL;

  // start a small grid that only has 1 testing slot : firefox
  @BeforeClass(alwaysRun = true)
  public void prepare() throws Exception {

    GridHubConfiguration config = new GridHubConfiguration();
    config.setHost("localhost");
    config.setPort(PortProber.findFreePort());
    hub = new Hub(config);
    hubURL = hub.getUrl();

    hub.start();
    hubURL = new URL("http://" + hub.getHost() + ":" + hub.getPort());

    SelfRegisteringRemote remote =
            GridTestHelper.getRemoteWithoutCapabilities(hubURL, GridRole.NODE);
    remote.addBrowser(DesiredCapabilities.firefox(), 1);

    remote.startRemoteServer();
    remote.setMaxConcurrent(1);
    remote.setTimeout(-1, -1);
    remote.sendRegistrationRequest();

    // assigning a priority rule where requests with the flag "important"
    // go first.
    hub.getRegistry().setPrioritizer(new Prioritizer() {
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
        } else {
          return 1;
        }
      }
    });
  }

  WebDriver runningOne;

  // mark the grid 100% busy = having 1 firefox test running.
  @Test
  public void test() throws MalformedURLException {
    DesiredCapabilities ff = DesiredCapabilities.firefox();
    runningOne = new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);
    runningOne.get(hubURL + "/grid/console");
    Assert.assertEquals(runningOne.getTitle(), "Grid overview");

  }

  // queuing 5 requests on the grid.
  @Test(dependsOnMethods = "test")
  public void sendMoreRequests() {
    for (int i = 0; i < 5; i++) {
      new Thread(new Runnable() { // Thread safety reviewed
        public void run() {
          DesiredCapabilities ff = DesiredCapabilities.firefox();
          try {
            new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);
          } catch (MalformedURLException e) {
            e.printStackTrace();
          }
        }
      }).start();
    }
  }

  volatile WebDriver importantOne;
  volatile boolean importantOneStarted = false;

  // adding a request with high priority at the end of the queue
  @Test(dependsOnMethods = "sendMoreRequests", timeOut = 30000)
  public void sendTheImportantOne() throws InterruptedException {
    while (hub.getRegistry().getNewSessionRequestCount() != 5) {
      Thread.sleep(250);
      System.out.println(hub.getRegistry().getNewSessionRequestCount());
    }
    Assert.assertEquals(hub.getRegistry().getNewSessionRequestCount(), 5);
    Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 1);

    final DesiredCapabilities ff = DesiredCapabilities.firefox();
    ff.setCapability("_important", true);

    new Thread(new Runnable() { // Thread safety reviewed
      public void run() {
        try {
          importantOne = new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);
          importantOneStarted = true;
        } catch (MalformedURLException e) {
          throw new RuntimeException("bug", e);
        }

      }
    }).start();

  }

  // then 5 more non-important requests
  @Test(dependsOnMethods = "sendTheImportantOne")
  public void sendMoreRequests2() {
    for (int i = 0; i < 5; i++) {
      new Thread(new Runnable() { // Thread safety reviewed
        public void run() {
          DesiredCapabilities ff = DesiredCapabilities.firefox();
          try {
            new RemoteWebDriver(new URL(hubURL + "/grid/driver"), ff);
          } catch (MalformedURLException e) {
            e.printStackTrace();
          }
        }
      }).start();
    }
  }

  @Test(dependsOnMethods = "sendMoreRequests2", timeOut = 20000)
  public void validateStateAndPickTheImportantOne() throws InterruptedException {
    try {
      while (hub.getRegistry().getNewSessionRequestCount() != 11) {
        Thread.sleep(500);
      }
      // queue = 5 + 1 important + 5.
      Assert.assertEquals(hub.getRegistry().getNewSessionRequestCount(), 11);

      // 1 firefox still running
      Assert.assertEquals(hub.getRegistry().getActiveSessions().size(), 1);

      // closing the running test.
      runningOne.quit();

      // validating new expected state
      while (!(hub.getRegistry().getActiveSessions().size() == 1 && hub.getRegistry()
              .getNewSessionRequestCount() == 10)) {
        Thread.sleep(250);
        Reporter.log("waiting for correct state.");
      }

      // TODO freynaud : sometines does not start. FF pops up, but address bar remains empty.
      while (!importantOneStarted) {
        Thread.sleep(250);
        Reporter.log("waiting for browser to start");
      }
      importantOne.get(hubURL + "/grid/console");
      Assert.assertEquals(importantOne.getTitle(), "Grid overview");
    } finally {
      // cleaning the queue to avoid having some browsers left over after
      // the test
      hub.getRegistry().clearNewSessionRequests();
      importantOne.quit();
    }

  }

  @AfterClass(alwaysRun = true)
  public void stop() throws Exception {
    hub.stop();
  }
}
