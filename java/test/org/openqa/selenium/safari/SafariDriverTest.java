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

package org.openqa.selenium.safari;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assume.assumeTrue;

public class SafariDriverTest extends JUnit4TestBase {

  private boolean technologyPreviewInstalled() {
    Path driverShim =
      Paths.get("/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver");
    return Files.exists(driverShim);
  }

  private SafariDriverService service;
  private WebDriver driver2;

  @After
  public void stopAll() {
    if (driver2 != null) {
      driver2.quit();
    }
    if (service != null) {
      service.stop();
    }
  }

  @Test
  public void builderGeneratesDefaultChromeOptions() {
    WebDriver driver = SafariDriver.builder().build();
    driver.quit();
  }

  @Test
  public void builderOverridesDefaultChromeOptions() {
    SafariOptions options = new SafariOptions();
    options.setImplicitWaitTimeout(Duration.ofMillis(1));
    WebDriver driver = SafariDriver.builder().oneOf(options).build();
    assertThat(driver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ofMillis(1));

    driver.quit();
  }

  @Test
  public void builderWithClientConfigthrowsException() {
    ClientConfig clientConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(1));
    RemoteWebDriverBuilder builder = SafariDriver.builder().config(clientConfig);

    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(builder::build)
      .withMessage("ClientConfig instances do not work for Local Drivers");
  }

  @Test
  public void canStartADriverUsingAService() throws IOException {
    removeDriver();
    int port = PortProber.findFreePort();
    service = new SafariDriverService.Builder().usingPort(port).build();
    service.start();
    driver2 = new SafariDriver(service);
    driver2.get(pages.xhtmlTestPage);
    assertThat(driver2.getTitle()).isEqualTo("XHTML Test Page");
  }

  @Test
  public void canStartTechnologyPreview() {
    assumeTrue(technologyPreviewInstalled());
    removeDriver();
    SafariOptions options = new SafariOptions();
    options.setUseTechnologyPreview(true);
    driver2 = new SafariDriver(options);
    driver2.get(pages.xhtmlTestPage);
    assertThat(driver2.getTitle()).isEqualTo("XHTML Test Page");
  }

  @Test
  public void canChangePermissions() {
    HasPermissions permissions = (HasPermissions) driver;

    assertThat(permissions.getPermissions().get("getUserMedia")).isEqualTo(true);

    permissions.setPermissions("getUserMedia", false);

    assertThat(permissions.getPermissions().get("getUserMedia")).isEqualTo(false);
  }

  @Test
  public void canAttachDebugger() {
    // Need to close driver after opening the inspector
    WebDriver driver = new WebDriverBuilder().get(new SafariOptions());

    try {
      ((HasDebugger) driver).attachDebugger();
    } finally {
      driver.quit();
    }
  }
}
