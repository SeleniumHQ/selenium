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

import org.junit.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chromium.ChromiumDriver;
import org.openqa.selenium.chromium.ChromiumNetworkConditions;
import org.openqa.selenium.chromium.HasNetworkConditions;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

public class ChromeDriverFunctionalTest extends JUnit4TestBase {

  private final String CLIPBOARD_READ = "clipboard-read";
  private final String CLIPBOARD_WRITE = "clipboard-write";

  private ChromiumDriver driver = null;

  @Test
  public void canSetPermission() {
    //Cast provided driver to enable ChromeSpecific calls
    driver = (ChromiumDriver) super.driver;

    driver.get(pages.clicksPage);
    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("prompt");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("granted");

    driver.setPermission(CLIPBOARD_READ, "denied");
    driver.setPermission(CLIPBOARD_WRITE, "prompt");

    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("denied");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("prompt");
  }

  @Test
  public void canSetPermissionHeadless() {
    ChromeOptions options = new ChromeOptions();
    options.setHeadless(true);
    //TestChromeDriver is not honoring headless request; using ChromeDriver instead
    super.driver = new ChromeDriver(options);
    driver = (ChromeDriver) super.driver;

    driver.get(pages.clicksPage);
    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("prompt");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("prompt");

    driver.setPermission(CLIPBOARD_READ, "granted");
    driver.setPermission(CLIPBOARD_WRITE, "granted");

    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("granted");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("granted");
  }

  public String checkPermission(ChromiumDriver driver, String permission){
    @SuppressWarnings("unchecked")
    Map<String, Object> result = (Map<String, Object>) driver.executeAsyncScript(
      "callback = arguments[arguments.length - 1];"
      + "callback(navigator.permissions.query({"
      + "name: arguments[0]"
      + "}));", permission);
    return result.get("state").toString();
  }

  @Test
  public void shouldAllowChromiumToManageNetworkConditions() {
    driver = (ChromiumDriver) super.driver;

    ChromiumNetworkConditions networkConditions = new ChromiumNetworkConditions();
    networkConditions.setLatency(Duration.ofMillis(200));

      driver.setNetworkConditions(networkConditions);
      assertThat(driver.getNetworkConditions().getLatency()).isEqualTo(Duration.ofMillis(200));

      driver.deleteNetworkConditions();

      try {
        driver.getNetworkConditions();
        fail("If Network Conditions were deleted, should not be able to get Network Conditions");
      } catch (WebDriverException e) {
        if (!e.getMessage().contains("network conditions must be set before it can be retrieved")) {
          throw e;
        }
      }
  }

  @Test
  public void shouldAllowRemoteWebDriverToAugmentHasNetworkConditions() throws MalformedURLException {
    WebDriver driver = new RemoteWebDriver(new URL("http://localhost:4444/"), new ChromeOptions());
    WebDriver augmentedDriver = new Augmenter().augment(driver);

    ChromiumNetworkConditions networkConditions = new ChromiumNetworkConditions();
    networkConditions.setLatency(Duration.ofMillis(200));

    try {
      ((HasNetworkConditions) augmentedDriver).setNetworkConditions(networkConditions);
      assertThat(((HasNetworkConditions) augmentedDriver).getNetworkConditions().getLatency()).isEqualTo(Duration.ofMillis(200));

      ((HasNetworkConditions) augmentedDriver).deleteNetworkConditions();

      try {
        ((HasNetworkConditions) augmentedDriver).getNetworkConditions();
        fail("If Network Conditions were deleted, should not be able to get Network Conditions");
      } catch (WebDriverException e) {
        if (!e.getMessage().contains("network conditions must be set before it can be retrieved")) {
          throw e;
        }
      }
    } finally {
      driver.quit();
    }
  }

}
