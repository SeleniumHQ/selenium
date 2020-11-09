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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.grid.commands.Standalone;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.time.Duration;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.grid.gridui.Urls.whereIs;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class ConsolePageTest {

  private Server<?> server;
  private WebDriver driver;
  private Wait<WebDriver> wait;

  @Before
  public void setup() {
    server = createStandalone();

    driver = new WebDriverBuilder().get();

    wait = new WebDriverWait(driver, Duration.ofSeconds(5));
  }

  @After
  public void tearDown() {
    safelyCall(() -> driver.quit());
    safelyCall(() -> server.stop());
  }

  @Test
  public void shouldReportAllNodesFreeWhenGridIsStartedWithoutLoad() {
    driver.get(whereIs(server, "/ui/index.html#/console"));

    WebElement ring = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("ring-system")));

    assertEquals("100% free", ring.getText());
  }

  @Test
  public void shouldDoSomethingExciting() {
    driver.get(whereIs(server, "/ui/index.html#/console"));

    WebElement element = wait.until(visibilityOfElementLocated(By.xpath("//a[contains(@href,'node')]")));
    element.click();

    wait.until(visibilityOf(driver.findElement(By.id("node-info"))));
  }

  private Server<?> createStandalone() {
    int port = PortProber.findFreePort();

    Config config = new MemoizedConfig(
      new MapConfig(Map.of(
        "server", Map.of(
          "port", port),
        "node", Map.of(
          "detect-drivers", true))));

    Server<?> server = new Standalone().asServer(config).start();

    waitUntilReady(server);

    return server;
  }

  private void waitUntilReady(Server<?> server) {
    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

    new FluentWait<>(client)
        .withTimeout(Duration.ofSeconds(5))
        .until(c -> {
          HttpResponse response = c.execute(new HttpRequest(GET, "/status"));
          Map<String, Object> status = Values.get(response, MAP_TYPE);
          return status != null && Boolean.TRUE.equals(status.get("ready"));
        });
  }

}
