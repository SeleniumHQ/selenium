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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

public class SafariDriverTest extends JupiterTestBase {

  private SafariDriverService service;

  private boolean technologyPreviewInstalled() {
    Path driverShim =
      Paths.get("/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver");
    return Files.exists(driverShim);
  }

  @Test
  @NoDriverBeforeTest
  public void builderGeneratesDefaultSafariOptions() {
    localDriver = SafariDriver.builder().build();
    Capabilities capabilities = ((SafariDriver) localDriver).getCapabilities();
    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ZERO);
    assertThat(capabilities.getCapability("browserName")).isEqualTo("Safari");
  }

  @Test
  @NoDriverBeforeTest
  public void builderOverridesDefaultSafariOptions() {
    SafariOptions options = new SafariOptions();
    options.setImplicitWaitTimeout(Duration.ofMillis(1));
    localDriver = SafariDriver.builder().oneOf(options).build();
    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ofMillis(1));
  }

  @Test
  @NoDriverBeforeTest
  public void builderWithClientConfigThrowsException() {
    ClientConfig clientConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(1));
    RemoteWebDriverBuilder builder = SafariDriver.builder().config(clientConfig);

    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(builder::build)
      .withMessage("ClientConfig instances do not work for Local Drivers");
  }

  @Test
  @NoDriverBeforeTest
  public void canStartADriverUsingAService() throws IOException {
    int port = PortProber.findFreePort();
    service = new SafariDriverService.Builder().usingPort(port).build();
    service.start();
    localDriver = new SafariDriver(service);
    localDriver.get(pages.xhtmlTestPage);
    assertThat(localDriver.getTitle()).isEqualTo("XHTML Test Page");
  }

  @Test
  @NoDriverBeforeTest
  public void canStartTechnologyPreview() {
    assumeTrue(technologyPreviewInstalled());

    SafariOptions options = new SafariOptions();
    options.setUseTechnologyPreview(true);
    localDriver = new SafariDriver(options);
    localDriver.get(pages.xhtmlTestPage);
    assertThat(localDriver.getTitle()).isEqualTo("XHTML Test Page");
  }

  @Test
  public void canChangePermissions() {
    HasPermissions permissions = (HasPermissions) driver;

    assertThat(permissions.getPermissions().get("getUserMedia")).isEqualTo(true);

    permissions.setPermissions("getUserMedia", false);

    assertThat(permissions.getPermissions().get("getUserMedia")).isEqualTo(false);
  }

  @Test
  @NoDriverBeforeTest
  public void canAttachDebugger() {
    localDriver = new WebDriverBuilder().get(new SafariOptions());
    ((HasDebugger) localDriver).attachDebugger();
  }
}
