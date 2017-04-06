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

package org.openqa.selenium.logging;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.remote.CapabilityType.ENABLE_PROFILING_CAPABILITY;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.isOldChromedriver;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.Set;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(PHANTOMJS)
@Ignore(MARIONETTE)
public class AvailableLogsTest extends JUnit4TestBase {

  private WebDriver localDriver;

  @After
  public void quitDriver() {
    if (localDriver != null) {
      localDriver.quit();
      localDriver = null;
    }
  }

  @Test
  public void browserLogShouldBeEnabledByDefault() {
    assumeFalse(isOldChromedriver(driver));
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertTrue("Browser logs should be enabled by default",
               logTypes.contains(LogType.BROWSER));
  }

  @Test
  public void clientLogShouldBeEnabledByDefault() {
    assumeFalse(isOldChromedriver(driver));
    // Do one action to have *something* in the client logs.
    driver.get(pages.formPage);
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertTrue("Client logs should be enabled by default",
               logTypes.contains(LogType.CLIENT));
    boolean foundExecutingStatement = false;
    boolean foundExecutedStatement = false;
    for (LogEntry logEntry : driver.manage().logs().get(LogType.CLIENT)) {
      foundExecutingStatement |= logEntry.toString().contains("Executing: ");
      foundExecutedStatement |= logEntry.toString().contains("Executed: ");
    }

    assertTrue(foundExecutingStatement);
    assertTrue(foundExecutedStatement);
  }

  @Test
  public void driverLogShouldBeEnabledByDefault() {
    assumeFalse(isOldChromedriver(driver));
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertTrue("Remote driver logs should be enabled by default",
               logTypes.contains(LogType.DRIVER));
  }

  @Test
  public void profilerLogShouldBeDisabledByDefault() {
    assumeFalse(isOldChromedriver(driver));
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertFalse("Profiler logs should not be enabled by default",
                logTypes.contains(LogType.PROFILER));
  }

  @Test
  @Ignore(value = SAFARI, reason = "Safari does not support profiler logs")
  public void shouldBeAbleToEnableProfilerLog() {
    assumeFalse(isOldChromedriver(driver));
    DesiredCapabilities caps = new DesiredCapabilities();
    caps.setCapability(ENABLE_PROFILING_CAPABILITY, true);
    WebDriverBuilder builder = new WebDriverBuilder().setDesiredCapabilities(caps);
    localDriver = builder.get();
    Set<String> logTypes = localDriver.manage().logs().getAvailableLogTypes();
    assertTrue("Profiler log should be enabled", logTypes.contains(LogType.PROFILER));
  }

  @Test
  public void serverLogShouldBeEnabledByDefaultOnRemote() {
    assumeTrue(Boolean.getBoolean("selenium.browser.remote"));

    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertTrue("Server logs should be enabled by default",
               logTypes.contains(LogType.SERVER));
  }

}
