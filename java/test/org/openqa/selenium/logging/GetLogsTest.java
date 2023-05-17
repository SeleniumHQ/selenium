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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(FIREFOX)
@Ignore(SAFARI)
class GetLogsTest extends JupiterTestBase {

  private WebDriver localDriver;

  @AfterEach
  public void quitDriver() {
    if (localDriver != null) {
      localDriver.quit();
      localDriver = null;
    }
  }

  @Test
  void logBufferShouldBeResetAfterEachGetLogCall() {
    driver.get(pages.errorsPage);
    driver.findElement(By.cssSelector("input")).click();

    LogEntries firstEntries = driver.manage().logs().get(LogType.BROWSER);
    assertThat(firstEntries.getAll()).isNotEmpty();
    assertThat(driver.manage().logs().get(LogType.BROWSER).getAll()).isEmpty();

    driver.findElement(By.cssSelector("input")).click();
    LogEntries secondEntries = driver.manage().logs().get(LogType.BROWSER);
    assertThat(secondEntries.getAll()).isNotEmpty();
    assertThat(hasOverlappingLogEntries(firstEntries, secondEntries))
        .describedAs("There should be no overlapping log entries in consecutive get log calls")
        .isFalse();
  }

  @Test
  void differentLogsShouldNotContainTheSameLogEntries() {
    driver.get(pages.errorsPage);
    driver.findElement(By.cssSelector("input")).click();

    Map<String, LogEntries> logTypeToEntriesMap = new HashMap<>();
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    for (String logType : logTypes) {
      logTypeToEntriesMap.put(logType, driver.manage().logs().get(logType));
    }

    for (Map.Entry<String, LogEntries> entry : logTypeToEntriesMap.entrySet()) {
      for (Map.Entry<String, LogEntries> nested : logTypeToEntriesMap.entrySet()) {
        if (!entry.getKey().equals(nested.getKey())) {
          assertThat(hasOverlappingLogEntries(entry.getValue(), nested.getValue()))
              .describedAs(
                  "Two different log types (%s, %s) should not  contain the same log entries",
                  entry.getKey(), nested.getKey())
              .isFalse();
        }
      }
    }
  }

  /**
   * Checks if there are overlapping entries in the given logs.
   *
   * @param firstLog The first log.
   * @param secondLog The second log.
   * @return true if an overlapping entry is discovered, otherwise false.
   */
  private static boolean hasOverlappingLogEntries(LogEntries firstLog, LogEntries secondLog) {
    for (LogEntry firstEntry : firstLog) {
      for (LogEntry secondEntry : secondLog) {
        if (firstEntry.getLevel().getName().equals(secondEntry.getLevel().getName())
            && firstEntry.getMessage().equals(secondEntry.getMessage())
            && firstEntry.getTimestamp() == secondEntry.getTimestamp()) {
          return true;
        }
      }
    }
    return false;
  }
}
