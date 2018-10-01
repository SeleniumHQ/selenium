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

package org.openqa.grid.e2e.utils;

import static org.junit.Assert.fail;

import com.google.common.base.Throwables;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.internal.cli.GridNodeCliOptions;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.server.SeleniumServer;

import java.net.URL;

public class GridTestHelper {

  public static SelfRegisteringRemote getRemoteWithoutCapabilities(Hub hub, GridRole role) {
    return getRemoteWithoutCapabilities(hub.getUrl(), role);
  }

  public static SelfRegisteringRemote getRemoteWithoutCapabilities(URL hub, GridRole role) {
    String[] args = {"-role", role.toString(),
                     "-host","localhost",
                     "-hub",hub.toString(),
                     "-port",String.valueOf(PortProber.findFreePort())};
    GridNodeCliOptions options = new GridNodeCliOptions();
    options.parse(args);
    GridNodeConfiguration config = new GridNodeConfiguration(options);
    RegistrationRequest req = RegistrationRequest.build(config);
    SelfRegisteringRemote remote = new SelfRegisteringRemote(req);
    remote.deleteAllBrowsers();
    return remote;
  }

  public static DesiredCapabilities getSelenium1FirefoxCapability() {
    DesiredCapabilities firefoxOnSeleniumCapability = new DesiredCapabilities();
    firefoxOnSeleniumCapability.setBrowserName("*firefox");
    firefoxOnSeleniumCapability.setCapability(RegistrationRequest.SELENIUM_PROTOCOL,
                                              SeleniumProtocol.Selenium);
    return firefoxOnSeleniumCapability;
  }

  public static DesiredCapabilities getDefaultBrowserCapability() {
    String browser = System.getProperty("webdriver.gridtest.browser");
    if (browser != null) {
      DesiredCapabilities caps = new DesiredCapabilities();
      caps.setBrowserName(browser);
      return caps;
    }
    return DesiredCapabilities.htmlUnit();
  }

  public static Hub getHub() {
    return getHub(new GridHubConfiguration(), true);
  }

  public static Hub getHub(
      GridHubConfiguration config,
      boolean dynamicallyAllocatePortOnLocalHost) {
    if (dynamicallyAllocatePortOnLocalHost) {
      config.host = "localhost";
      config.port = PortProber.findFreePort();
    }
    return getHub(config);
  }

  public static Hub getHub(GridHubConfiguration config) {
    Hub hub = new Hub(config);
    try {
      hub.start();
    } catch (Exception e) {
      fail("Expected hub to start: " + Throwables.getStackTraceAsString(e));
    }
    return hub;
  }

  public static Hub prepareTestGrid(Capabilities caps, int nodeCount) {
    Hub hub = GridTestHelper.getHub();

    for (int i = 0; i < nodeCount; i++) {
      SelfRegisteringRemote remote = GridTestHelper.getRemoteWithoutCapabilities(
          hub.getUrl(),
          GridRole.NODE);
      remote.addBrowser(new DesiredCapabilities(caps), 1);

      DesiredCapabilities capabilities = new DesiredCapabilities(caps);
      capabilities.setCapability(RegistrationRequest.SELENIUM_PROTOCOL, SeleniumProtocol.WebDriver);

      remote.addBrowser(capabilities, 1);

      remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));

      try {
        remote.startRemoteServer();
      } catch (Exception e) {
        fail("Unable to start node: " + Throwables.getStackTraceAsString(e));
      }

      remote.getConfiguration().timeout = -1;
      remote.sendRegistrationRequest();
    }

    RegistryTestHelper.waitForNode(hub.getRegistry(), nodeCount);
    return hub;
  }

  public static RemoteWebDriver getRemoteWebDriver(DesiredCapabilities caps, Hub hub) {
    return new RemoteWebDriver(hub.getWebDriverHubRequestURL(), caps);
  }
}
