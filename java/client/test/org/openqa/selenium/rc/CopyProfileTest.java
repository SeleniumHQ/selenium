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

package org.openqa.selenium.rc;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.firefox.FirefoxDriver.PROFILE;
import static org.openqa.selenium.testing.Driver.ALL;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Pages;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.InProcessTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.drivers.OutOfProcessSeleniumServer;

// TODO(reorg): This test is never run. It must be.
// Firefox specific test, but needs to be in remote
@Ignore(ALL)
public class CopyProfileTest {
  private OutOfProcessSeleniumServer selenium;
  private TestEnvironment env;

  @Before
  public void setUp() throws Exception {
    env = GlobalTestEnvironment.get(InProcessTestEnvironment.class);
    selenium = new OutOfProcessSeleniumServer();
    selenium.start();
  }

  @After
  protected void tearDown() throws Exception {
    selenium.stop();
  }

  @Test
  public void testShouldCopyProfileFromLocalMachineToRemoteInstance() throws Exception {
    System.setProperty("webdriver.development", "true");
    System.setProperty("jna.library.path", "..\\build;build");

    FirefoxProfile profile = new FirefoxProfile();
    profile.setPreference("browser.startup.homepage", new Pages(env.getAppServer()).xhtmlTestPage);

    DesiredCapabilities caps = DesiredCapabilities.firefox();
    caps.setCapability(PROFILE, profile);

    WebDriver driver = new RemoteWebDriver(selenium.getWebDriverUrl(), caps);

    String title = driver.getTitle();
    driver.quit();

    assertEquals(title, "XHTML Test Page", title);
  }

}
