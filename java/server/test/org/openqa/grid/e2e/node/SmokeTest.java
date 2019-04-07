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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.e2e.utils.GridTestHelper;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

public class SmokeTest {

  private Hub hub;

  @Before
  public void prepare() {
    hub = GridTestHelper.prepareTestGrid(DesiredCapabilities.htmlUnit(), 1);
  }

  @Test
  public void browserOnWebDriver() {
    WebDriver driver = null;
    try {
      DesiredCapabilities caps = DesiredCapabilities.htmlUnit();
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
  public void stop() {
    hub.stop();
  }

}
