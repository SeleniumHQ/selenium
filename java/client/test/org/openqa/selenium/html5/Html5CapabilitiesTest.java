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

package org.openqa.selenium.html5;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_APPLICATION_CACHE;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_LOCATION_CONTEXT;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_SQL_DATABASE;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_WEB_STORAGE;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.TestUtilities;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

@Ignore(HTMLUNIT)
@Ignore(IE)
@Ignore(SAFARI)
@Ignore(FIREFOX)
@Ignore(CHROME)
public class Html5CapabilitiesTest extends JUnit4TestBase {

  private WebDriver localDriver;

  @Before
  public void avoidRemote() {
    // TODO: Resolve why these tests don't work on the remote server
    assumeTrue(TestUtilities.isLocal());
  }

  @Test
  public void enableWebStorageCapability() {
    configureCapability(SUPPORTS_WEB_STORAGE, true);
    assertThat(hasWebStorage(localDriver)).isTrue();
  }

  @Test
  public void disableWebStorageCapability() {
    configureCapability(SUPPORTS_WEB_STORAGE, false);
    assertThat(hasWebStorage(localDriver)).isFalse();
  }

  private boolean hasWebStorage(WebDriver driver) {
    driver.get(pages.html5Page);
    return (Boolean) ((JavascriptExecutor) driver).executeScript("return !!window.localStorage");
  }

  @Test
  public void enableApplicationCacheCapability() {
    configureCapability(SUPPORTS_APPLICATION_CACHE, true);
    // TODO: Checks that application cache is enabled
  }

  @Test
  public void disableApplicationCacheCapability() {
    configureCapability(SUPPORTS_APPLICATION_CACHE, false);
    // TODO: Checks that application cache is disabled
  }

  @Test
  public void enableLocationContextCapability() {
    configureCapability(SUPPORTS_LOCATION_CONTEXT, true);
    // TODO: Checks that location context is enabled
  }

  @Test
  public void disableLocationContextCapability() {
    configureCapability(SUPPORTS_LOCATION_CONTEXT, false);
    // TODO: Checks that location context is disabled
  }

  @Test
  public void enableDatabaseCapability() {
    configureCapability(SUPPORTS_SQL_DATABASE, true);
    // TODO: Checks that SQL database is enabled
  }

  @Test
  public void disableDatabaseCapability() {
    configureCapability(SUPPORTS_SQL_DATABASE, false);
    // TODO: Checks that SQL database is disabled
  }

  private void configureCapability(String capability, boolean isEnabled) {
    Capabilities desiredCaps = new ImmutableCapabilities(capability, isEnabled);
    localDriver = new WebDriverBuilder().get(desiredCaps);
    Capabilities caps = ((HasCapabilities) localDriver).getCapabilities();
    assertThat(caps.getCapability(capability)).isNotNull();
    assertThat(caps.is(capability)).isEqualTo(isEnabled);
  }

  @After
  public void quitDriver() {
    if (this.localDriver != null) {
      this.localDriver.quit();
      this.localDriver = null;
    }
  }
}
