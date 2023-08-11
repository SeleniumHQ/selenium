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
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(FIREFOX)
@Ignore(SAFARI)
class AvailableLogsTest extends JupiterTestBase {

  private WebDriver localDriver;

  @AfterEach
  public void quitDriver() {
    if (localDriver != null) {
      localDriver.quit();
      localDriver = null;
    }
  }

  @Test
  void browserLogShouldBeEnabledByDefault() {
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertThat(logTypes.contains(LogType.BROWSER))
        .describedAs("Browser logs should be enabled by default")
        .isTrue();
  }

  @Test
  void clientLogShouldBeEnabledByDefault() {
    // Do one action to have *something* in the client logs.
    driver.get(pages.formPage);
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertThat(logTypes.contains(LogType.CLIENT))
        .describedAs("Client logs should be enabled by default")
        .isTrue();
    boolean foundExecutingStatement = false;
    boolean foundExecutedStatement = false;
    for (LogEntry logEntry : driver.manage().logs().get(LogType.CLIENT)) {
      foundExecutingStatement |= logEntry.toString().contains("Executing: ");
      foundExecutedStatement |= logEntry.toString().contains("Executed: ");
    }

    assertThat(foundExecutingStatement).isTrue();
    assertThat(foundExecutedStatement).isTrue();
  }

  @Test
  void driverLogShouldBeEnabledByDefault() {
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertThat(logTypes.contains(LogType.DRIVER))
        .describedAs("Remote driver logs should be enabled by default")
        .isTrue();
  }

  @Test
  void profilerLogShouldBeDisabledByDefault() {
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertThat(logTypes.contains(LogType.PROFILER))
        .describedAs("Profiler logs should not be enabled by default")
        .isFalse();
  }

  @Test
  void serverLogShouldBeEnabledByDefaultOnRemote() {
    assumeTrue(Boolean.getBoolean("selenium.browser.remote"));

    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertThat(logTypes.contains(LogType.SERVER))
        .describedAs("Server logs should be enabled by default")
        .isTrue();
  }
}
