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

public class GridTestHelper {

//  public static SelfRegisteringRemote getRemoteWithoutCapabilities(Hub hub, GridRole role) {
//    return getRemoteWithoutCapabilities(hub.getUrl(), role);
//  }

//  public static SelfRegisteringRemote getRemoteWithoutCapabilities(URL hub, GridRole role) {
//    String[] args = {"-role", role.toString(),
//                     "-host","localhost",
//                     "-hub",hub.toString(),
//                     "-port",String.valueOf(PortProber.findFreePort())};
//    GridNodeCliOptions options = new GridNodeCliOptions();
//    JCommander.newBuilder().addObject(options).build().parse(args);
//    GridNodeConfiguration config = new GridNodeConfiguration(options);
//    RegistrationRequest req = RegistrationRequest.build(config);
//    SelfRegisteringRemote remote = new SelfRegisteringRemote(req);
//    remote.deleteAllBrowsers();
//    return remote;
//  }

//  public static DesiredCapabilities getSelenium1FirefoxCapability() {
//    DesiredCapabilities firefoxOnSeleniumCapability = new DesiredCapabilities();
//    firefoxOnSeleniumCapability.setBrowserName("*firefox");
//    firefoxOnSeleniumCapability.setCapability(RegistrationRequest.SELENIUM_PROTOCOL,
//                                              SeleniumProtocol.Selenium);
//    return firefoxOnSeleniumCapability;
//  }

//  public static DesiredCapabilities getDefaultBrowserCapability() {
//    String browser = System.getProperty("webdriver.gridtest.browser");
//    if (browser != null) {
//      DesiredCapabilities caps = new DesiredCapabilities();
//      caps.setBrowserName(browser);
//      return caps;
//    }
//    return new DesiredCapabilities(BrowserType.HTMLUNIT, "", Platform.ANY);
//  }

//  public static Hub getHub() {
//    return getHub(new GridHubConfiguration(), true);
//  }

//  public static Hub getHub(
//      GridHubConfiguration config,
//      boolean dynamicallyAllocatePortOnLocalHost) {
//    if (dynamicallyAllocatePortOnLocalHost) {
//      config.host = "localhost";
//      config.port = PortProber.findFreePort();
//    }
//    return getHub(config);
//  }

//  public static Hub getHub(GridHubConfiguration config) {
//    Hub hub = new Hub(config);
//    try {
//      hub.start();
//    } catch (Exception e) {
//      fail("Expected hub to start: " + Throwables.getStackTraceAsString(e));
//    }
//    return hub;
//  }

//  public static Hub prepareTestGrid(int nodeCount) {
//    return prepareTestGrid(getDefaultBrowserCapability(), nodeCount);
//  }

//  public static Hub prepareTestGrid(Capabilities caps, int nodeCount) {
//    Hub hub = GridTestHelper.getHub();
//
//    for (int i = 0; i < nodeCount; i++) {
//      SelfRegisteringRemote remote = GridTestHelper.getRemoteWithoutCapabilities(
//          hub.getUrl(),
//          GridRole.NODE);
//      remote.addBrowser(new DesiredCapabilities(caps), 1);
//
//      DesiredCapabilities capabilities = new DesiredCapabilities(caps);
//      capabilities.setCapability(RegistrationRequest.SELENIUM_PROTOCOL, SeleniumProtocol.WebDriver);
//
//      remote.addBrowser(capabilities, 1);
//
//      remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
//
//      try {
//        remote.startRemoteServer();
//      } catch (Exception e) {
//        fail("Unable to start node: " + Throwables.getStackTraceAsString(e));
//      }
//
//      remote.getConfiguration().timeout = -1;
//      remote.sendRegistrationRequest();
//    }
//
//    RegistryTestHelper.waitForNode(hub.getRegistry(), nodeCount);
//    return hub;
//  }

//  public static RemoteWebDriver getRemoteWebDriver(Hub hub) {
//    return new RemoteWebDriver(hub.getWebDriverHubRequestURL(), getDefaultBrowserCapability());
//  }
}
