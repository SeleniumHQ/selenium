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

import static org.junit.Assert.assertNotNull;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.grid.commands.Standalone;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;
import static org.junit.Assert.assertEquals;

import java.io.StringReader;
import java.time.Duration;
import java.util.Map;

public class ConsolePageTest {

  private static final int port = PortProber.findFreePort();

  private Server<?> server;

  @Before
  public void setFields() {
    this.server = createStandalone();
  }

  @After
  public void stopServers() {
    this.server.stop();
  }

  @Test
  public void testConsolePage() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");
    WebDriver driver = new RemoteWebDriver(server.getUrl(), caps);
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));

    driver.get("localhost:" + port + "/ui/index.html#/console");

    WebElement element = wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.id("ring-system"))));

    assertEquals("100% free", element.getText());
  }

  @Test
  public void testNodePage() {
    Capabilities caps = new ImmutableCapabilities("browserName", "chrome");
    WebDriver driver = new RemoteWebDriver(server.getUrl(), caps);
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(2));

    driver.get("localhost:" + port + "/ui/index.html#/console");
    WebElement element = wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.xpath("//a[contains(@href,'node')]"))));

    element.click();

    wait.until(ExpectedConditions.visibilityOf(driver.findElement(By.id("node-info"))));
  }

  private static Server<?> createStandalone() {
    String[] rawConfig = new String[]{
        "[network]",
        "relax-checks = true",
        "[node]",
        "detect-drivers = true",
        "[server]",
        "port = " + port,
        "registration-secret = \"provolone\""
    };
    Config config = new MemoizedConfig(
        new TomlConfig(new StringReader(String.join("\n", rawConfig))));

    Server<?> server = new Standalone().asServer(config).start();

    waitUntilReady(server);

    return server;
  }

  private static void waitUntilReady(Server<?> server) {
    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

    new FluentWait<>(client)
        .withTimeout(Duration.ofSeconds(5))
        .until(c -> {
          HttpResponse response = c.execute(new HttpRequest(GET, "/status"));
          Map<String, Object> status = Values.get(response, MAP_TYPE);
          return Boolean.TRUE.equals(status.get("ready"));
        });
  }
}
