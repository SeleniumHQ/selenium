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

package org.openqa.selenium.remote.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeFalse;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.openqa.selenium.Platform;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.edge.EdgeDriverService;
import org.openqa.selenium.firefox.GeckoDriverService;
import org.openqa.selenium.safari.SafariDriverService;
import org.openqa.selenium.testing.drivers.Browser;
import uk.org.webcompere.systemstubs.jupiter.SystemStub;
import uk.org.webcompere.systemstubs.jupiter.SystemStubsExtension;
import uk.org.webcompere.systemstubs.properties.SystemProperties;

@ExtendWith(SystemStubsExtension.class)
class DriverFinderFunctionalTest {

  private final Browser browser = Browser.detect();
  private final DriverService service = serviceFor(browser);

  @TempDir private Path cacheDir;

  // Selenium Manager hands SE_* system properties to its process as environment variables
  @SystemStub private SystemProperties properties;

  @Test
  void resolvesAnExecutableDriverPath() {
    assertThat(Path.of(driverFinder().getDriverPath())).isExecutable();
  }

  @Test
  void resolvesAnExecutableBrowserPath() {
    assumeFalse(isPinned(), "pinned runs supply the browser through options");

    assertThat(Path.of(driverFinder().getBrowserPath())).isExecutable();
  }

  @Test
  void downloadsTheDriverIntoTheSeleniumCache() {
    assumeFalse(isPinned(), "pinned runs do not use Selenium Manager");
    assumeFalse(browser == Browser.SAFARI, "driver ships with the OS");
    properties.set("SE_CACHE_PATH", cacheDir.toString()).set("SE_SKIP_DRIVER_IN_PATH", "true");

    // Match by name so 8.3 short names on Windows don't fail the comparison
    assertThat(driverFinder().getDriverPath()).contains(cacheDir.getFileName().toString());
  }

  @Test
  void downloadsTheBrowserIntoTheSeleniumCache() {
    assumeFalse(isPinned(), "pinned runs do not use Selenium Manager");
    assumeFalse(resolvesToSystemInstall(), "browser installs to a system location");
    properties.set("SE_CACHE_PATH", cacheDir.toString()).set("SE_FORCE_BROWSER_DOWNLOAD", "true");

    assertThat(driverFinder().getBrowserPath()).contains(cacheDir.getFileName().toString());
  }

  @Test
  void resolvesTheBrowserToItsSystemInstallLocation() {
    assumeFalse(isPinned(), "pinned runs do not use Selenium Manager");
    assumeTrue(resolvesToSystemInstall(), "only Safari and Windows Edge install to the system");
    properties.set("SE_CACHE_PATH", cacheDir.toString()).set("SE_FORCE_BROWSER_DOWNLOAD", "true");

    assertThat(driverFinder().getBrowserPath()).doesNotContain(cacheDir.getFileName().toString());
  }

  private DriverFinder driverFinder() {
    return new DriverFinder(service, browser.getCapabilities());
  }

  private boolean isPinned() {
    return System.getProperty(service.getDriverProperty()) != null;
  }

  private boolean resolvesToSystemInstall() {
    return browser == Browser.SAFARI
        || (browser == Browser.EDGE && Platform.getCurrent().is(Platform.WINDOWS));
  }

  private static DriverService serviceFor(Browser browser) {
    return switch (browser) {
      case CHROME -> ChromeDriverService.createDefaultService();
      case EDGE -> EdgeDriverService.createDefaultService();
      case FIREFOX -> GeckoDriverService.createDefaultService();
      case SAFARI -> SafariDriverService.createDefaultService();
      default -> throw new IllegalStateException("No driver service for " + browser);
    };
  }
}
