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

package org.openqa.selenium.edge;

import org.junit.Test;
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
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.Assertions.fail;
import static org.assertj.core.api.Assumptions.assumeThat;

public class EdgeDriverFunctionalTest extends JUnit4TestBase {

  private final String CLIPBOARD_READ = "clipboard-read";
  private final String CLIPBOARD_WRITE = "clipboard-write";

  @Test
  public void builderGeneratesDefaultChromeOptions() {
    WebDriver driver = EdgeDriver.builder().build();
    driver.quit();
  }

  @Test
  public void builderOverridesDefaultChromeOptions() {
    EdgeOptions options = new EdgeOptions();
    options.setImplicitWaitTimeout(Duration.ofMillis(1));
    WebDriver driver = EdgeDriver.builder().oneOf(options).build();
    assertThat(driver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ofMillis(1));

    driver.quit();
  }

  @Test
  public void builderWithClientConfigthrowsException() {
    ClientConfig clientConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(1));
    RemoteWebDriverBuilder builder = EdgeDriver.builder().config(clientConfig);

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
  public void canSetPermissionHeadless() {
    EdgeOptions options = new EdgeOptions();
    options.setHeadless(true);

    //TestEdgeDriver is not honoring headless request; using EdgeDriver instead
    WebDriver driver = new WebDriverBuilder().get(options);
    try {
      HasPermissions permissions = (HasPermissions) driver;

      driver.get(pages.clicksPage);
      assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("prompt");
      assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("prompt");

      permissions.setPermission(CLIPBOARD_READ, "granted");
      permissions.setPermission(CLIPBOARD_WRITE, "granted");

      assertThat(checkPermission(driver, CLIPBOARD_READ)).isEqualTo("granted");
      assertThat(checkPermission(driver, CLIPBOARD_WRITE)).isEqualTo("granted");
    } finally {
      driver.quit();
    }
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
