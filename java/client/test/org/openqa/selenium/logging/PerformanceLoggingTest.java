/*
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.logging;

import static org.hamcrest.Matchers.greaterThan;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.logging.profiler.EventType;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.drivers.SynthesizedFirefoxDriver;

import com.google.common.base.Predicate;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;

public class PerformanceLoggingTest {
  private WebDriver driver;

  @After
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
      driver = null;
    }
  }

  @Test
  public void testDisabledProfilingDoesNotLog() {
    driver = new SynthesizedFirefoxDriver();
    driver.get("https://www.google.com");
    assertEquals(0, getProfilerEntries().getAll().size());
  }

  @Test
  public void testLogsSingleHttpCommand() {
    startLoggingDriver();
    // Expect start of newSession, end of newSession, start of getLogs, end of getLogs
    assertEquals(4, getProfilerEntriesOfType(EventType.HTTP_COMMAND).size());
  }

  @Test
  public void testGetsYieldToPageLoadLogEntries() throws Exception {
    startLoggingDriver();
    driver.get("https://www.google.com/imghp");
    driver.findElement(By.name("q")).sendKeys("Monkeys");
    driver.findElement(By.name("btnG")).click();
    assertThat(getProfilerEntriesOfType(EventType.YIELD_TO_PAGE_LOAD).size(), greaterThan(0));
  }

  private void startLoggingDriver() {
    driver = new SynthesizedFirefoxDriver(getProfilerEnabledCapabilities());
  }

  private LogEntries getProfilerEntries() {
    return driver.manage().logs().get(LogType.PROFILER);
  }

  private ImmutableList<LogEntry> getProfilerEntriesOfType(final EventType eventType) {
    return ImmutableList.copyOf(Iterables.filter(getProfilerEntries(), new Predicate<LogEntry>() {
      @Override
      public boolean apply(LogEntry entry) {
        return entry.getMessage().contains(eventType.toString());
      }
    }));
  }

  private static DesiredCapabilities getProfilerEnabledCapabilities() {
    DesiredCapabilities capabilities = DesiredCapabilities.firefox();
    capabilities.setCapability(CapabilityType.ENABLE_PROFILING_CAPABILITY, true);
    return capabilities;
  }
}
