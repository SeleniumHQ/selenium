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

import static org.hamcrest.Matchers.greaterThan;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.remote.CapabilityType.ENABLE_PROFILING_CAPABILITY;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;

import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.logging.profiler.EventType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.Arrays;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(PHANTOMJS)
@Ignore(SAFARI)
@Ignore(MARIONETTE)
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
    assertEquals("Profiler should not log when disabled",
        getProfilerEntries(driver).getAll().size(), 0);
  }

  @Test
  public void testLogsSingleHttpCommand() {
    startLoggingDriver();
    ImmutableList<LogEntry> entries = getProfilerEntriesOfType(getProfilerEntries(loggingDriver),
        EventType.HTTP_COMMAND);
    // Expect start of newSession, end of newSession, start of getLogs, end of getLogs
    String[] expected = {"\"command\": \"newSession\",\"startorend\": \"start\"",
        "\"command\": \"newSession\",\"startorend\": \"end\"",
        "\"command\": \"getLog\",\"startorend\": \"start\"",
        "\"command\": \"getLog\",\"startorend\": \"end\""};
    assertTrue("Profiler entries should contain: " + Arrays.toString(expected),
         containsExpectedEntries(entries, expected));
  }

  /**
   * Checks if the given list of strings occur in the given order among the
   * given log messages (one string per message).
   *
   * @param entries The list of log entries.
   * @param expected The array of expected strings.
   * @return true if a match was found for all expected strings, otherwise false.
   */
  private boolean containsExpectedEntries(ImmutableList<LogEntry> entries, String[] expected) {
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
  public void testGetsYieldToPageLoadLogEntries() throws Exception {
    startLoggingDriver();
    loggingDriver.get(pages.formPage);
    loggingDriver.findElement(By.id("submitButton")).click();
    assertThat(getProfilerEntriesOfType(getProfilerEntries(loggingDriver),
        EventType.YIELD_TO_PAGE_LOAD).size(), greaterThan(0));
  }

  private void startLoggingDriver() {
    if (loggingDriver == null) {
      WebDriverBuilder builder = new WebDriverBuilder().setDesiredCapabilities(
        getCapabilitiesWithProfilerOn(true));
      loggingDriver = builder.get();
    }
  }

  private LogEntries getProfilerEntries(WebDriver driver) {
    return driver.manage().logs().get(LogType.PROFILER);
  }

  private ImmutableList<LogEntry> getProfilerEntriesOfType(final LogEntries entries,
      final EventType eventType) {
    return ImmutableList.copyOf(Iterables.filter(entries, new Predicate<LogEntry>() {
      public boolean apply(LogEntry entry) {
        return entry.getMessage().contains(eventType.toString());
      }
    }));
  }

  private static DesiredCapabilities getCapabilitiesWithProfilerOn(boolean enabled) {
    DesiredCapabilities capabilities = DesiredCapabilities.firefox();
    capabilities.setCapability(ENABLE_PROFILING_CAPABILITY, enabled);
    return capabilities;
  }
}
