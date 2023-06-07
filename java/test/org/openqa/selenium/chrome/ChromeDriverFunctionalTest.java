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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.fail;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;

import com.google.common.util.concurrent.Uninterruptibles;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.assertj.core.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chromium.ChromiumNetworkConditions;
import org.openqa.selenium.chromium.HasCasting;
import org.openqa.selenium.chromium.HasCdp;
import org.openqa.selenium.chromium.HasNetworkConditions;
import org.openqa.selenium.chromium.HasPermissions;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;

class ChromeDriverFunctionalTest extends JupiterTestBase {

  private final String CLIPBOARD_READ = "clipboard-read";
  private final String CLIPBOARD_WRITE = "clipboard-write";

  @Test
  @NoDriverBeforeTest
  public void builderGeneratesDefaultChromeOptions() {
    // This test won't pass if we want to use Chrome in a non-standard location
    Assumptions.assumeThat(System.getProperty("webdriver.chrome.binary")).isNull();

    localDriver = ChromeDriver.builder().build();
    Capabilities capabilities = ((ChromeDriver) localDriver).getCapabilities();

    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ZERO);
    assertThat(capabilities.getCapability("browserName")).isEqualTo("chrome");
  }

  @Test
  @NoDriverBeforeTest
  public void builderOverridesDefaultChromeOptions() {
    ChromeOptions options = (ChromeOptions) CHROME.getCapabilities();
    options.setImplicitWaitTimeout(Duration.ofMillis(1));
    localDriver = ChromeDriver.builder().oneOf(options).build();
    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout())
        .isEqualTo(Duration.ofMillis(1));
  }

  @Test
  @NoDriverBeforeTest
  public void driverOverridesDefaultClientConfig() {
    assertThatThrownBy(
            () -> {
              ClientConfig clientConfig =
                  ClientConfig.defaultConfig().readTimeout(Duration.ofSeconds(0));
              localDriver =
                  new ChromeDriver(
                      ChromeDriverService.createDefaultService(),
                      (ChromeOptions) CHROME.getCapabilities(),
                      clientConfig);
            })
        .isInstanceOf(SessionNotCreatedException.class);
  }

  @Test
  void builderWithClientConfigThrowsException() {
    ClientConfig clientConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(1));
    RemoteWebDriverBuilder builder =
        ChromeDriver.builder().oneOf(CHROME.getCapabilities()).config(clientConfig);

    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(builder::build)
        .withMessage("ClientConfig instances do not work for Local Drivers");
  }

  @Test
  @Ignore(value = CHROME, reason = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=4350")
  void canSetPermission() {
    HasPermissions permissions = (HasPermissions) driver;

    driver.get(pages.clicksPage);
    assumeThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("prompt");
    assumeThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("granted");

    permissions.setPermission(CLIPBOARD_READ, "denied");
    permissions.setPermission(CLIPBOARD_WRITE, "prompt");

    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("denied");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("prompt");
  }

  public String checkPermission(WebDriver driver, String permission) {
    @SuppressWarnings("unchecked")
    Map<String, Object> result =
        (Map<String, Object>)
            ((JavascriptExecutor) driver)
                .executeAsyncScript(
                    "callback = arguments[arguments.length - 1];"
                        + "callback(navigator.permissions.query({"
                        + "name: arguments[0]"
                        + "}));",
                    permission);
    return result.get("state").toString();
  }

  @Test
  @Ignore(gitHubActions = true)
  void canCast() {
    HasCasting caster = (HasCasting) driver;

    // Does not get list the first time it is called
    caster.getCastSinks();
    Uninterruptibles.sleepUninterruptibly(Duration.ofMillis(1500));
    List<Map<String, String>> castSinks = caster.getCastSinks();

    // Can not call these commands if there are no sinks available
    if (castSinks.size() > 0) {
      String deviceName = castSinks.get(0).get("name");

      caster.startTabMirroring(deviceName);
      caster.stopCasting(deviceName);
    }
  }

  @Test
  @Ignore(gitHubActions = true)
  public void canCastOnDesktop() {
    HasCasting caster = (HasCasting) driver;

    // Does not get list the first time it is called
    caster.getCastSinks();
    Uninterruptibles.sleepUninterruptibly(Duration.ofMillis(1500));
    List<Map<String, String>> castSinks = caster.getCastSinks();

    // Can not call these commands if there are no sinks available
    if (castSinks.size() > 0) {
      String deviceName = castSinks.get(0).get("name");

      caster.startDesktopMirroring(deviceName);
      caster.stopCasting(deviceName);
    }
  }

  @Test
  void canManageNetworkConditions() {
    HasNetworkConditions conditions = (HasNetworkConditions) driver;

    ChromiumNetworkConditions networkConditions = new ChromiumNetworkConditions();
    networkConditions.setLatency(Duration.ofMillis(200));

    conditions.setNetworkConditions(networkConditions);
    assertThat(conditions.getNetworkConditions().getLatency()).isEqualTo(Duration.ofMillis(200));

    conditions.deleteNetworkConditions();

    try {
      conditions.getNetworkConditions();
      fail("If Network Conditions were deleted, should not be able to get Network Conditions");
    } catch (WebDriverException e) {
      if (!e.getMessage().contains("network conditions must be set before it can be retrieved")) {
        throw e;
      }
    }
  }

  @Test
  void canExecuteCdpCommands() {
    HasCdp cdp = (HasCdp) driver;

    Map<String, Object> parameters = Map.of("url", pages.simpleTestPage);
    cdp.executeCdpCommand("Page.navigate", parameters);

    assertThat(driver.getTitle()).isEqualTo("Hello WebDriver");
  }
}
