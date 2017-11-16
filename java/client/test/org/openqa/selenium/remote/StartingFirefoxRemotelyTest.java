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

package org.openqa.selenium.remote;

import static org.junit.Assert.assertEquals;

import org.junit.After;
import org.junit.Assume;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.net.URL;

public class StartingFirefoxRemotelyTest extends JUnit4TestBase {

  private URL remoteUrl;
  private WebDriver localDriver;

  @BeforeClass
  public static void ensureTestingFirefox() {
    Assume.assumeTrue("ff".equals(System.getProperty("selenium.browser")));
    Assume.assumeTrue(Boolean.getBoolean("selenium.browser.remote"));
  }

  @Before
  public void getRemoteServerUrl() {
    CommandExecutor executor = ((RemoteWebDriver) driver).getCommandExecutor();
    Assume.assumeTrue(executor instanceof HttpCommandExecutor);

    remoteUrl = ((HttpCommandExecutor) executor).getAddressOfRemoteServer();
  }

  @After
  public void quitDriver() {
    if (localDriver != null) {
      localDriver.quit();
    }
  }

  @Test
  public void canSetProfileThroughDesiredCapabilities() {
    MutableCapabilities caps = DesiredCapabilities.firefox();
    caps.setCapability(FirefoxDriver.PROFILE, new FirefoxProfile());

    localDriver = new RemoteWebDriver(remoteUrl, caps);
    localDriver.get(pages.xhtmlTestPage);
    assertEquals("XHTML Test Page", localDriver.getTitle());
  }

  @Test
  public void canSetProfileThroughFirefoxOptions() {
    FirefoxOptions options = new FirefoxOptions();
    options.setProfile(new FirefoxProfile());
    Capabilities caps = new ImmutableCapabilities(FirefoxOptions.FIREFOX_OPTIONS, options);

    localDriver = new RemoteWebDriver(remoteUrl, caps);
    localDriver.get(pages.xhtmlTestPage);
    assertEquals("XHTML Test Page", localDriver.getTitle());
  }

  @Test
  public void shouldBeAbleToMergeDesiredOptionsIntoFirefoxOptions() {
    FirefoxOptions options = new FirefoxOptions().setProfile(new FirefoxProfile());

    localDriver = new RemoteWebDriver(remoteUrl, options);
    localDriver.get(pages.xhtmlTestPage);
    assertEquals("XHTML Test Page", localDriver.getTitle());
  }

  @Test
  public void canStartFirefoxWithoutAnyConfigurationOptions() {
    localDriver = new RemoteWebDriver(remoteUrl, new FirefoxOptions());
    localDriver.get(pages.xhtmlTestPage);
    assertEquals("XHTML Test Page", localDriver.getTitle());
  }
}
