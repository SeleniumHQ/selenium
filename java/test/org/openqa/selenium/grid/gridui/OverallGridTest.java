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

package org.openqa.selenium.grid.gridui;

import java.util.Objects;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.drivers.Browser;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.openqa.selenium.grid.gridui.Urls.whereIs;
import static org.openqa.selenium.support.ui.ExpectedConditions.textToBe;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfAllElementsLocatedBy;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.Safely.safelyCall;

class OverallGridTest extends AbstractGridTest {

  private Server<?> server;
  private WebDriver driver;
  private WebDriver remoteWebDriver;
  private Wait<WebDriver> wait;

  @BeforeEach
  public void setup() {
    server = createStandalone();

    driver = new WebDriverBuilder().get();

    wait = new WebDriverWait(driver, Duration.ofSeconds(10));
  }

  @AfterEach
  public void tearDown() {
    safelyCall(() -> driver.quit());
    safelyCall(() -> remoteWebDriver.quit());
    safelyCall(() -> server.stop());
  }

  @Test
  void shouldReportConcurrencyZeroPercentWhenGridIsStartedWithoutLoad() {
    driver.get(whereIs(server, "/ui/index.html#/sessions"));

    WebElement concurrency = wait
      .until(visibilityOfElementLocated(By.cssSelector("div[data-testid='concurrency-usage']")));

    assertEquals("0%", concurrency.getText());
  }

  @Test
  void shouldShowOneNodeRegistered() {
    driver.get(whereIs(server, "/ui/index.html#"));

    List<WebElement> nodeInfoIcons = wait
      .until(visibilityOfAllElementsLocatedBy(By.cssSelector("button[data-testid*='node-info-']")));

    assertEquals(1, nodeInfoIcons.size());
  }

  @Test
  void shouldIncrementSessionCountWhenSessionStarts() {
    remoteWebDriver = new RemoteWebDriver(server.getUrl(), Objects.requireNonNull(Browser.detect()).getCapabilities());
    driver.get(whereIs(server, "/ui/index.html#/sessions"));

    wait.until(textToBe(By.cssSelector("div[data-testid='session-count']"), "1"));
  }
}
