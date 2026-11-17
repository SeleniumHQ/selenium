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

package org.openqa.selenium.firefox;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;

import java.time.Duration;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.webextension.FirefoxWebExtensionOptions;
import org.openqa.selenium.webextension.HasWebExtensions;
import org.openqa.selenium.webextension.WebExtension;

/**
 * Exercises the classic {@code /moz/addon} fallback of {@link HasWebExtensions}, which a Firefox
 * session takes when BiDi is not enabled.
 */
class WebExtensionsWithoutBiDiTest extends JupiterTestBase {

  private static final String EXT_XPI = "common/extensions/webextensions-selenium-example.xpi";
  private static final String EXT_SIGNED_DIR =
      "common/extensions/webextensions-selenium-example-signed";
  private static final String EXPECTED_ID = "webextensions-selenium-example-v3@example.com";
  private static final String INJECTED = "Content injected by webextensions-selenium-example";

  @AfterAll
  public static void resetBrowser() {
    seleniumExtension.removeDriver();
  }

  @Test
  @NoDriverBeforeTest
  void installsAndUninstallsAnArchiveThroughTheClassicEndpoint() {
    startWithoutBiDi();

    WebExtension extension =
        ((HasWebExtensions) driver).installWebExtension(InProject.locate(EXT_XPI));
    assertInstallInjectsAndUninstallRemoves(extension);
  }

  @Test
  @NoDriverBeforeTest
  void installsAndUninstallsADirectoryThroughTheClassicEndpoint() {
    startWithoutBiDi();

    // The classic endpoint installs permanently by default, which Firefox refuses for a directory.
    WebExtension extension =
        ((HasWebExtensions) driver)
            .installWebExtension(
                InProject.locate(EXT_SIGNED_DIR),
                new FirefoxWebExtensionOptions().permanent(false));
    assertInstallInjectsAndUninstallRemoves(extension);
  }

  private void startWithoutBiDi() {
    FirefoxOptions options = (FirefoxOptions) Browser.FIREFOX.getCapabilities();
    options.setCapability("webSocketUrl", false);
    createNewDriver(options);
    // A session without BiDi has no webSocketUrl to connect to.
    Object webSocketUrl =
        ((HasCapabilities) driver).getCapabilities().getCapability("webSocketUrl");
    assertThat(webSocketUrl instanceof String).as("BiDi should be disabled").isFalse();
  }

  private void assertInstallInjectsAndUninstallRemoves(WebExtension extension) {
    assertThat(extension.getId()).isEqualTo(EXPECTED_ID);

    driver.get(pages.blankPage);
    // The content script injects asynchronously after the page loads.
    WebElement injected =
        wait.until(presenceOfElementLocated(By.id("webextensions-selenium-example")));
    assertThat(injected.getText()).isEqualTo(INJECTED);

    ((HasWebExtensions) driver).uninstallWebExtension(extension);
    driver.navigate().refresh();
    assertStaysAbsent(driver, By.id("webextensions-selenium-example"));
  }

  // The content script injects asynchronously after load, so an element missing right after a
  // refresh proves nothing; it has to stay missing for longer than injection takes.
  private static void assertStaysAbsent(WebDriver driver, By locator) {
    assertThatThrownBy(() ->
            new WebDriverWait(driver, Duration.ofSeconds(2))
                .until(presenceOfElementLocated(locator)))
        .isInstanceOf(TimeoutException.class);
  }
}
