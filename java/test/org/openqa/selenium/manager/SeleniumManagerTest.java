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

package org.openqa.selenium.manager;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.edge.EdgeDriverService;
import org.openqa.selenium.firefox.GeckoDriverService;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.remote.service.DriverFinder;
import org.openqa.selenium.remote.service.DriverService;
import org.openqa.selenium.safari.SafariDriverService;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.Browser;

class SeleniumManagerTest extends JupiterTestBase {

  private DriverService service;
  Path cachePath = SeleniumManager.getInstance().getCachePath();
  Browser browser = Browser.detect();

  @BeforeEach
  void removeCachedBinary() throws IOException {
    Path cachedManager = cachePath.resolve("manager");
    if (Files.exists(cachedManager) && !FileHandler.delete(cachedManager.toFile())) {
      throw new IOException("Unable to delete cached Selenium Manager directory: " + cachedManager);
    }
  }

  @AfterEach
  void stopService() {
    if (service != null) {
      service.stop();
    }
  }

  @Test
  @NoDriverBeforeTest
  void startsService() throws IOException {
    String driverProperty = driverExecutableProperty(browser);
    String previousPath = System.getProperty(driverProperty);
    try {
      System.clearProperty(driverProperty);

      service = buildService(browser);
      Assertions.assertThat(service.getExecutable()).isNull();

      DriverFinder finder = new DriverFinder(service, service.getDefaultDriverOptions());
      String driverPath = finder.getDriverPath();
      String browserPath = finder.getBrowserPath();

      Assertions.assertThat(Files.isExecutable(Path.of(driverPath))).isTrue();
      Assertions.assertThat(Files.isExecutable(Path.of(browserPath))).isTrue();
      if (browser != Browser.SAFARI) {
        Assertions.assertThat(driverPath).contains(cachePath.toString());
        Assertions.assertThat(browserPath).contains(cachePath.toString());
      }

      service.setExecutable(driverPath);
      service.start();

      Assertions.assertThat(service.isRunning()).isTrue();
    } finally {
      if (previousPath == null) {
        System.clearProperty(driverProperty);
      } else {
        System.setProperty(driverProperty, previousPath);
      }
    }
  }

  private DriverService buildService(Browser browser) {
    switch (browser) {
      case CHROME:
        return new ChromeDriverService.Builder().build();
      case EDGE:
        return new EdgeDriverService.Builder().build();
      case FIREFOX:
        return new GeckoDriverService.Builder().build();
      case SAFARI:
        return new SafariDriverService.Builder().build();
      default:
        throw new IllegalStateException("Unsupported browser: " + browser);
    }
  }

  private String driverExecutableProperty(Browser browser) {
    switch (browser) {
      case CHROME:
        return ChromeDriverService.CHROME_DRIVER_EXE_PROPERTY;
      case EDGE:
        return EdgeDriverService.EDGE_DRIVER_EXE_PROPERTY;
      case FIREFOX:
        return GeckoDriverService.GECKO_DRIVER_EXE_PROPERTY;
      case SAFARI:
        return SafariDriverService.SAFARI_DRIVER_EXE_PROPERTY;
      default:
        throw new IllegalStateException("Unsupported browser: " + browser);
    }
  }
}
