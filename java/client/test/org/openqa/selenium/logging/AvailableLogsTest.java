/*
Copyright 2012 Selenium committers
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

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.NeedsFreshDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.util.Set;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.remote.CapabilityType.ENABLE_PROFILING_CAPABILITY;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

@Ignore({ANDROID, CHROME, HTMLUNIT, IE, IPHONE, OPERA, OPERA_MOBILE, SAFARI, SELENESE})
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
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertTrue("Browser logs should be enabled by default",
               logTypes.contains(LogType.BROWSER));
  }

  @NeedsFreshDriver
  @Test
  public void clientLogShouldBeEnabledByDefault() {
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
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertTrue("Remote driver logs should be enabled by default",
               logTypes.contains(LogType.DRIVER));
  }

  @Test
  public void profilerLogShouldBeDisabledByDefault() {
    Set<String> logTypes = driver.manage().logs().getAvailableLogTypes();
    assertFalse("Profiler logs should not be enabled by default",
                logTypes.contains(LogType.PROFILER));
  }

  @Test
  public void shouldBeAbleToEnableProfilerLog() {
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