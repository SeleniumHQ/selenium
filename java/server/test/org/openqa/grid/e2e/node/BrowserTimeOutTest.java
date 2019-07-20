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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 * checks that the session is stopped and browser released when browser timeout happens.
 */
public class BrowserTimeOutTest {

//  private Hub hub;
//  private SelfRegisteringRemote node;

  @Before
  public void setup() {
//    GridHubConfiguration gridHubConfiguration = new GridHubConfiguration();
//    gridHubConfiguration.port = PortProber.findFreePort();
//    gridHubConfiguration.host = "localhost";
//
//    gridHubConfiguration.browserTimeout = 5;
//    gridHubConfiguration.servlets =
//      Collections.singletonList("org.openqa.grid.e2e.node.SlowServlet");
//    hub = GridTestHelper.getHub(gridHubConfiguration);
//
//    // register a selenium 1
//    node = GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
//    node.addBrowser(GridTestHelper.getSelenium1FirefoxCapability(), 1);
//    node.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);
//
//    node.setRemoteServer(new SeleniumServer(node.getConfiguration()));
//    node.startRemoteServer();
//    node.sendRegistrationRequest();
//
//    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }


  @Test
  public void testWebDriverTimesOut() {
//    String url = hub.getUrl("/grid/admin/SlowServlet").toExternalForm();
//    DesiredCapabilities caps = GridTestHelper.getDefaultBrowserCapability();
//    WebDriver driver = new RemoteWebDriver(hub.getWebDriverHubRequestURL(), caps);
//
//    try {
//      driver.get(url);
//    } catch(WebDriverException ignore) {
//    } finally {
//      RegistryTestHelper.waitForActiveTestSessionCount(hub.getRegistry(), 0);
//    }
  }

  @After
  public void teardown() {
//    node.stopRemoteServer();
//    hub.stop();
  }
}
