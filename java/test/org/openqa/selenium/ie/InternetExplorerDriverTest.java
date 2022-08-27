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

package org.openqa.selenium.ie;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.awt.*;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.ie.InternetExplorerDriver.ENABLE_PERSISTENT_HOVERING;

public class InternetExplorerDriverTest extends JupiterTestBase {

  @Test
  @NoDriverBeforeTest
  public void builderGeneratesDefaultIEOptions() {
    localDriver = InternetExplorerDriver.builder().build();
    Capabilities capabilities = ((InternetExplorerDriver) localDriver).getCapabilities();
    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ZERO);
    assertThat(capabilities.getCapability("browserName")).isEqualTo("internet explorer");
  }

  @Test
  @NoDriverBeforeTest
  public void builderOverridesDefaultIEOptions() {
    InternetExplorerOptions options = new InternetExplorerOptions();
    options.setImplicitWaitTimeout(Duration.ofMillis(1));
    localDriver = InternetExplorerDriver.builder().oneOf(options).build();
    assertThat(localDriver.manage().timeouts().getImplicitWaitTimeout()).isEqualTo(Duration.ofMillis(1));
  }

  @Test
  public void builderWithClientConfigThrowsException() {
    ClientConfig clientConfig = ClientConfig.defaultConfig().readTimeout(Duration.ofMinutes(1));
    RemoteWebDriverBuilder builder = InternetExplorerDriver.builder().config(clientConfig);

    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(builder::build)
      .withMessage("ClientConfig instances do not work for Local Drivers");
  }

  @Test
  @NoDriverBeforeTest
  public void canRestartTheIeDriverInATightLoop() {
    for (int i = 0; i < 5; i++) {
      WebDriver driverInLoop = newIeDriver();
      driverInLoop.quit();
    }
  }

  @Test
  @NoDriverBeforeTest
  public void canStartMultipleIeDriverInstances() {
    WebDriver firstDriver = newIeDriver();
    WebDriver secondDriver = newIeDriver();
    try {
      firstDriver.get(pages.xhtmlTestPage);
      secondDriver.get(pages.formPage);
      assertThat(firstDriver.getTitle()).isEqualTo("XHTML Test Page");
      assertThat(secondDriver.getTitle()).isEqualTo("We Leave From Here");
    } finally {
      firstDriver.quit();
      secondDriver.quit();
    }
  }

  @NoDriverBeforeTest
  @NoDriverAfterTest
  @Test
  public void testPersistentHoverCanBeTurnedOff() throws Exception {
    createNewDriver(new ImmutableCapabilities(ENABLE_PERSISTENT_HOVERING, false));

    driver.get(pages.javascriptPage);
    // Move to a different element to make sure the mouse is not over the
    // element with id 'item1' (from a previous test).
    new Actions(driver).moveToElement(driver.findElement(By.id("keyUp"))).build().perform();
    WebElement element = driver.findElement(By.id("menu1"));

    WebElement item = driver.findElement(By.id("item1"));
    assertThat(item.getText()).isEqualTo("");

    ((JavascriptExecutor) driver).executeScript("arguments[0].style.background = 'green'", element);
    new Actions(driver).moveToElement(element).build().perform();

    // Move the mouse somewhere - to make sure that the thread firing the events making
    // hover persistent is not active.
    Robot robot = new Robot();
    robot.mouseMove(50, 50);

    // Intentionally wait to make sure hover DOES NOT persist.
    Thread.sleep(1000);

    wait.until(d -> item.getText().equals(""));

    assertThat(item.getText()).isEqualTo("");
  }

  private WebDriver newIeDriver() {
    return new WebDriverBuilder().get();
  }
}
