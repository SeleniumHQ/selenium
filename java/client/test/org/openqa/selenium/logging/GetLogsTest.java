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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(PHANTOMJS)
@Ignore(MARIONETTE)
public class GetLogsTest extends JUnit4TestBase {

  private WebDriver localDriver;

  @After
  public void quitDriver() {
    if (localDriver != null) {
      localDriver.quit();
      localDriver = null;
    }
  }

  @Test
  public void logBufferShouldBeResetAfterEachGetLogCall() {
    assumeFalse(TestUtilities.isOldChromedriver(driver));  // Only chromedriver2 supports logging.
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    for (String logType : logTypes) {
      driver.get(pages.simpleTestPage);
      LogEntries firstEntries = driver.manage().logs().get(logType);
      assumeTrue(firstEntries.getAll().size() > 0);
      LogEntries secondEntries = driver.manage().logs().get(logType);
      assertFalse(String.format("There should be no overlapping log entries in " +
          "consecutive get log calls for %s logs", logType),
          LogEntriesChecks.hasOverlappingLogEntries(firstEntries, secondEntries));
    }
  }

  @Test
  public void differentLogsShouldNotContainTheSameLogEntries() {
    assumeFalse(TestUtilities.isOldChromedriver(driver));  // Only chromedriver2 supports logging.
    driver.get(pages.simpleTestPage);
    Map<String, LogEntries> logTypeToEntriesMap = new HashMap<>();
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    for (String logType : logTypes) {
      logTypeToEntriesMap.put(logType, driver.manage().logs().get(logType));
    }
    for (String firstLogType : logTypeToEntriesMap.keySet()) {
      for (String secondLogType : logTypeToEntriesMap.keySet()) {
        if (!firstLogType.equals(secondLogType)) {
          assertFalse(String.format("Two different log types (%s, %s) should not " +
              "contain the same log entries", firstLogType, secondLogType),
              LogEntriesChecks.hasOverlappingLogEntries(logTypeToEntriesMap.get(firstLogType),
                  logTypeToEntriesMap.get(secondLogType)));
        }
      }
    }
  }

  @Test
  @NeedsLocalEnvironment
  public void turningOffLogShouldMeanNoLogMessages() {
    assumeFalse(TestUtilities.isOldChromedriver(driver));  // Only chromedriver2 supports logging.
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    for (String logType : logTypes) {
      createWebDriverWithLogging(logType, Level.OFF);
      LogEntries entries = localDriver.manage().logs().get(logType);
      assertEquals(String.format("There should be no log entries for " +
          "log type %s when logging is turned off.", logType),
          0, entries.getAll().size());
      quitDriver();
    }
  }

  private void createWebDriverWithLogging(String logType, Level logLevel) {
    LoggingPreferences loggingPrefs = new LoggingPreferences();
    loggingPrefs.enable(logType, logLevel);
    Capabilities caps = new ImmutableCapabilities(CapabilityType.LOGGING_PREFS, loggingPrefs);
    WebDriverBuilder builder = new WebDriverBuilder().setDesiredCapabilities(caps);
    localDriver = builder.get();
    localDriver.get(pages.simpleTestPage);
  }
}
