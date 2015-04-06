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

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;

public class GridTestHelper {

  public static SelfRegisteringRemote getRemoteWithoutCapabilities(Hub hub, GridRole role) {
    return getRemoteWithoutCapabilities(hub.getUrl(), role);
  }

  public static SelfRegisteringRemote getRemoteWithoutCapabilities(URL hub, GridRole role) {
    RegistrationRequest req = RegistrationRequest.build("-role", "node","-host","localhost");


    req.getConfiguration().put(RegistrationRequest.PORT, PortProber.findFreePort());

    // some values have to be computed again after changing internals.
    String url =
        "http://" + req.getConfiguration().get(RegistrationRequest.HOST) + ":"
            + req.getConfiguration().get(RegistrationRequest.PORT);
    req.getConfiguration().put(RegistrationRequest.REMOTE_HOST, url);

    req.getConfiguration().put(RegistrationRequest.HUB_HOST, hub.getHost());
    req.getConfiguration().put(RegistrationRequest.HUB_PORT, hub.getPort());

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

  public static DesiredCapabilities getFirefoxCapability() {
    return DesiredCapabilities.firefox();
  }

  public static DesiredCapabilities getDefaultBrowserCapability() {
    String browser = System.getProperty("webdriver.gridtest.browser");
    if (browser != null) {
      DesiredCapabilities caps = new DesiredCapabilities();
      caps.setBrowserName(browser);
      return caps;
    } else {
      return DesiredCapabilities.firefox();
    }
  }

  public static Hub getHub() throws Exception {
    GridHubConfiguration config = new GridHubConfiguration();
    config.setHost("localhost");
    config.setPort(PortProber.findFreePort());
    return getHub(config);
  }

  public static Hub getHub(GridHubConfiguration config) throws Exception {
    Hub hub = new Hub(config);
    hub.start();
    return hub;
  }

  public static void getRemoteWebDriver(DesiredCapabilities caps, Hub hub)
      throws MalformedURLException {
    new RemoteWebDriver(getGridDriver(hub), caps);
  }

  public static URL getGridDriver(Hub hub) throws MalformedURLException {
    return new URL(hub.getUrl() + "/grid/driver");
  }
}
