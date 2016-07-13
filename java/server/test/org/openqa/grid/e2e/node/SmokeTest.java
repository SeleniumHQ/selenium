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

import static org.junit.Assert.assertEquals;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.SeleniumProtocol;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.e2e.utils.RegistryTestHelper;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.server.SeleniumServer;

import java.net.MalformedURLException;
import java.net.URL;

public class SmokeTest {

  private Hub hub;

  @Before
  public void prepare() throws Exception {

    hub = GridTestHelper.getHub();

    SelfRegisteringRemote remote =
        GridTestHelper.getRemoteWithoutCapabilities(hub.getUrl(), GridRole.NODE);
    remote.addBrowser(GridTestHelper.getDefaultBrowserCapability(), 1);

    DesiredCapabilities chromeOnSeleniumCapability = DesiredCapabilities.chrome();
    chromeOnSeleniumCapability.setCapability(RegistrationRequest.SELENIUM_PROTOCOL,SeleniumProtocol.WebDriver);

    remote.addBrowser(chromeOnSeleniumCapability, 1);

    remote.setRemoteServer(new SeleniumServer(remote.getConfiguration()));
    remote.startRemoteServer();

    remote.getConfiguration().timeout = -1;
    remote.sendRegistrationRequest();
    RegistryTestHelper.waitForNode(hub.getRegistry(), 1);
  }

  @Test
  public void chromeOnWebDriver() throws MalformedURLException {
    WebDriver driver = null;
    try {
      DesiredCapabilities caps = DesiredCapabilities.chrome();
      driver = new RemoteWebDriver(hub.getWebDriverHubRequestURL(), caps);
      driver.get(hub.getConsoleURL().toString());
      assertEquals(driver.getTitle(), "Grid Console");
    } finally {
      if (driver != null) {
        driver.quit();
      }
    }
  }

  @After
  public void stop() throws Exception {
    hub.stop();
  }
}
