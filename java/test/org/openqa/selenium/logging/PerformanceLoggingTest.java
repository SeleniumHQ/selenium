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
import static org.openqa.selenium.remote.CapabilityType.ENABLE_PROFILING_CAPABILITY;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.logging.profiler.EventType;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(SAFARI)
@Ignore(FIREFOX)
public class PerformanceLoggingTest extends JUnit4TestBase {

  private WebDriver loggingDriver;

  @After
  public void quitDriver() {
    if (loggingDriver != null) {
      loggingDriver.quit();
      loggingDriver = null;
    }
  }

  @Test
  public void testDisabledProfilingDoesNotLog() {
    driver.get(pages.simpleTestPage);
    assertThat(getProfilerEntries(driver).getAll())
        .describedAs("Profiler should not log when disabled")
        .hasSize(0);
  }

  @Test
  public void testLogsSingleHttpCommand() {
    startLoggingDriver();
    List<LogEntry> entries = getProfilerEntriesOfType(getProfilerEntries(loggingDriver),
                                                      EventType.HTTP_COMMAND);
    // Expect start of newSession, end of newSession, start of getLogs, end of getLogs
    String[] expected = {"\"command\": \"newSession\",\"startorend\": \"start\"",
        "\"command\": \"newSession\",\"startorend\": \"end\"",
        "\"command\": \"getLog\",\"startorend\": \"start\"",
        "\"command\": \"getLog\",\"startorend\": \"end\""};
    assertThat(containsExpectedEntries(entries, expected)).isTrue();
  }

  /**
   * Checks if the given list of strings occur in the given order among the
   * given log messages (one string per message).
   *
   * @param entries The list of log entries.
   * @param expected The array of expected strings.
   * @return true if a match was found for all expected strings, otherwise false.
   */
  private boolean containsExpectedEntries(List<LogEntry> entries, String[] expected) {
    int index = 0;
    for (LogEntry entry : entries) {
      if (index == expected.length) {
        return true;
      }
      if (!entry.getMessage().contains(expected[index])) {
        index++;
      }
    }
    return (index == expected.length);
  }

  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  public void testGetsYieldToPageLoadLogEntries() {
    startLoggingDriver();
    loggingDriver.get(pages.formPage);
    loggingDriver.findElement(By.id("submitButton")).click();
    assertThat(
        getProfilerEntriesOfType(getProfilerEntries(loggingDriver), EventType.YIELD_TO_PAGE_LOAD).size())
        .isGreaterThan(0);
  }

  private void startLoggingDriver() {
    if (loggingDriver == null) {
      loggingDriver = new WebDriverBuilder()
          .get(new ImmutableCapabilities(ENABLE_PROFILING_CAPABILITY, true));
    }
  }

  private LogEntries getProfilerEntries(WebDriver driver) {
    return driver.manage().logs().get(LogType.PROFILER);
  }

  private List<LogEntry> getProfilerEntriesOfType(LogEntries entries, EventType eventType) {
    return StreamSupport.stream(entries.spliterator(), false).filter(
        entry -> entry.getMessage().contains(eventType.toString())).collect(Collectors.toList());
  }
}
