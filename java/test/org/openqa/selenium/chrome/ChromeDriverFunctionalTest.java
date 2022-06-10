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

import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.JavascriptExecutor;
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
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.fail;
import static org.assertj.core.api.Assumptions.assumeThat;

public class ChromeDriverFunctionalTest extends JupiterTestBase {

  private final String CLIPBOARD_READ = "clipboard-read";
  private final String CLIPBOARD_WRITE = "clipboard-write";

  @Test
  @NoDriverBeforeTest
  public void builderGeneratesDefaultChromeOptions() {
    localDriver = ChromeDriver.builder().build();
    Capabilities capabilities = ((ChromeDriver) localDriver).getCapabilities();

    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ZERO);
    assertThat(capabilities.getCapability("browserName")).isEqualTo("chrome");
  }

  @Test
  @NoDriverBeforeTest
  public void builderOverridesDefaultChromeOptions() {
    ChromeOptions options = new ChromeOptions();
    options.setImplicitWaitTimeout(Duration.ofMillis(1));
    localDriver = ChromeDriver.builder().oneOf(options).build();
    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ofMillis(1));
  }

  @Test
  public void builderWithClientConfigThrowsException() {
    ClientConfig clientConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(1));
    RemoteWebDriverBuilder builder = ChromeDriver.builder().config(clientConfig);

    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(builder::build)
      .withMessage("ClientConfig instances do not work for Local Drivers");
  }

  @Test
  public void canSetPermission() {
    HasPermissions permissions = (HasPermissions) driver;

    driver.get(pages.clicksPage);
    assumeThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("prompt");
    assumeThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("granted");

    permissions.setPermission(CLIPBOARD_READ, "denied");
    permissions.setPermission(CLIPBOARD_WRITE, "prompt");

    assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("denied");
    assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("prompt");
  }

  @Test
  @NoDriverBeforeTest
  public void canSetPermissionHeadless() {
    ChromeOptions options = new ChromeOptions();
    options.setHeadless(true);

    localDriver = new WebDriverBuilder().get(options);
    HasPermissions permissions = (HasPermissions) localDriver;

    localDriver.get(pages.clicksPage);
    assertThat(checkPermission(localDriver, CLIPBOARD_READ)).isEqualTo("prompt");
    assertThat(checkPermission(localDriver, CLIPBOARD_WRITE)).isEqualTo("prompt");

    permissions.setPermission(CLIPBOARD_READ, "granted");
    permissions.setPermission(CLIPBOARD_WRITE, "granted");

    assertThat(checkPermission(localDriver, CLIPBOARD_READ)).isEqualTo("granted");
    assertThat(checkPermission(localDriver, CLIPBOARD_WRITE)).isEqualTo("granted");
  }

  public String checkPermission(WebDriver driver, String permission){
    @SuppressWarnings("unchecked")
    Map<String, Object> result = (Map<String, Object>) ((JavascriptExecutor) driver).executeAsyncScript(
      "callback = arguments[arguments.length - 1];"
      + "callback(navigator.permissions.query({"
      + "name: arguments[0]"
      + "}));", permission);
    return result.get("state").toString();
  }

  @Test
  @Ignore(gitHubActions = true)
  public void canCast() throws InterruptedException {
    HasCasting caster = (HasCasting) driver;

    // Does not get list the first time it is called
    caster.getCastSinks();
    Thread.sleep(1500);
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
  public void canCastOnDesktop() throws InterruptedException {
    HasCasting caster = (HasCasting) driver;

    // Does not get list the first time it is called
    caster.getCastSinks();
    Thread.sleep(1500);
    List<Map<String, String>> castSinks = caster.getCastSinks();

    // Can not call these commands if there are no sinks available
    if (castSinks.size() > 0) {
      String deviceName = castSinks.get(0).get("name");

      caster.startDesktopMirroring(deviceName);
      caster.stopCasting(deviceName);
    }
  }

  @Test
  public void canManageNetworkConditions() {
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
  public void canExecuteCdpCommands() {
    HasCdp cdp = (HasCdp) driver;

    Map<String, Object> parameters = Map.of("url", pages.simpleTestPage);
    cdp.executeCdpCommand("Page.navigate", parameters);

    assertThat(driver.getTitle()).isEqualTo("Hello WebDriver");
  }
}
