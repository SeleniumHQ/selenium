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

package org.openqa.selenium.chrome;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;

import com.google.common.collect.ImmutableMap;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Base64;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.Browser;

class ChromeOptionsFunctionalTest extends JupiterTestBase {

  private static final String EXT_PATH = "common/extensions/webextensions-selenium-example.crx";

  @AfterAll
  public static void resetBrowser() {
    seleniumExtension.removeDriver();
  }

  @Test
  public void canStartChromeWithCustomOptions() {
    ChromeOptions options = (ChromeOptions) Browser.CHROME.getCapabilities();
    options.addArguments("user-agent=foo;bar");
    localDriver = seleniumExtension.createNewDriver(options);

    localDriver.get(pages.clickJacker);

    Object userAgent =
        ((RemoteWebDriver) localDriver).executeScript("return window.navigator.userAgent");
    assertThat(userAgent).isEqualTo("foo;bar");
  }

  @Test
  void optionsStayEqualAfterSerialization() {
    ChromeOptions options1 = new ChromeOptions();
    ChromeOptions options2 = new ChromeOptions();
    assertThat(options2).isEqualTo(options1);
    options1.asMap();
    assertThat(options2).isEqualTo(options1);
  }

  @Test
  @NoDriverBeforeTest
  public void canSetAcceptInsecureCerts() {
    ChromeOptions options = (ChromeOptions) Browser.CHROME.getCapabilities();
    options.setAcceptInsecureCerts(true);
    localDriver = seleniumExtension.createNewDriver(options);

    assertThat(
            ((RemoteWebDriver) localDriver).getCapabilities().getCapability(ACCEPT_INSECURE_CERTS))
        .isEqualTo(true);
  }

  @Test
  @NoDriverBeforeTest
  public void canAddExtensionFromFile() {
    ChromeOptions options = createChromeOptionsForExtensions();
    options.addExtensions(InProject.locate(EXT_PATH).toFile());
    localDriver = seleniumExtension.createNewDriver(options);

    localDriver.get(toLocalUrl(pages.echoPage));
    WebElement footerElement = localDriver.findElement(By.id("webextensions-selenium-example"));

    String footText = footerElement.getText();
    assertThat(footText).isEqualTo("Content injected by webextensions-selenium-example");
  }

  @Test
  @NoDriverBeforeTest
  public void canAddExtensionFromStringEncodedInBase64() throws IOException {
    ChromeOptions options = createChromeOptionsForExtensions();
    options.addEncodedExtensions(
        Base64.getEncoder().encodeToString(Files.readAllBytes(InProject.locate(EXT_PATH))));
    localDriver = seleniumExtension.createNewDriver(options);

    localDriver.get(pages.echoPage);

    WebElement footerElement = localDriver.findElement(By.id("webextensions-selenium-example"));

    String footText = footerElement.getText();
    assertThat(footText).isEqualTo("Content injected by webextensions-selenium-example");
  }

  private ChromeOptions createChromeOptionsForExtensions() {
    ChromeOptions options = (ChromeOptions) Browser.CHROME.getCapabilities();
    return options.setExperimentalOption(
        "prefs", ImmutableMap.of("extensions.ui.developer_mode", true));
  }
}
