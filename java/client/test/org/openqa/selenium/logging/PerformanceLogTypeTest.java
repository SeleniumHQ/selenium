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
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.TestUtilities.isChrome;
import static org.openqa.selenium.testing.TestUtilities.isOldChromedriver;

import com.google.common.collect.Iterables;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.Set;
import java.util.logging.Level;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(PHANTOMJS)
@Ignore(MARIONETTE)
public class PerformanceLogTypeTest extends JUnit4TestBase {

  private WebDriver localDriver;

  @After
  public void quitDriver() {
    if (localDriver != null) {
      localDriver.quit();
      localDriver = null;
    }
  }

  @Test
  public void performanceLogShouldBeDisabledByDefault() {
    assumeFalse(isOldChromedriver(driver));
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertFalse("Performance log should not be enabled by default",
                logTypes.contains(LogType.PERFORMANCE));
  }

  void createLocalDriverWithPerformanceLogType() {
  	DesiredCapabilities caps = new DesiredCapabilities();
    LoggingPreferences logPrefs = new LoggingPreferences();
    logPrefs.enable(LogType.PERFORMANCE, Level.INFO);
    caps.setCapability(CapabilityType.LOGGING_PREFS, logPrefs);
    localDriver = new WebDriverBuilder().setDesiredCapabilities(caps).get();
  }

  @Test
  public void shouldBeAbleToEnablePerformanceLog() {
  	assumeTrue(isChrome(driver) && !isOldChromedriver(driver));  // Only in the new chromedriver.
    createLocalDriverWithPerformanceLogType();
    Set<String> logTypes = localDriver.manage().logs().getAvailableLogTypes();
    assertTrue("Profiler log should be enabled", logTypes.contains(LogType.PERFORMANCE));
  }

  @Test
  public void pageLoadShouldProducePerformanceLogEntries() {
  	assumeTrue(isChrome(driver) && !isOldChromedriver(driver));  // Only in the new chromedriver.
    createLocalDriverWithPerformanceLogType();
    localDriver.get(pages.simpleTestPage);
    LogEntries entries = localDriver.manage().logs().get(LogType.PERFORMANCE);
    assertNotEquals(0, Iterables.size(entries));
  }
}
