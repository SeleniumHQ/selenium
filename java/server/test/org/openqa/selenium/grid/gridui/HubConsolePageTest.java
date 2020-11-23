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
import org.openqa.selenium.grid.commands.Hub;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.drivers.WebDriverBuilder;

import java.io.StringReader;
import java.time.Duration;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.grid.gridui.Urls.whereIs;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class HubConsolePageTest {

  private Server<?> hub;
  private WebDriver driver;
  private Wait<WebDriver> wait;

  @Before
  public void setFields() {
    int publish = PortProber.findFreePort();
    int subscribe = PortProber.findFreePort();

    hub = createHub(publish, subscribe);

    driver = new WebDriverBuilder().get();

    wait = new WebDriverWait(driver, Duration.ofSeconds(5));
  }

  @After
  public void stopServers() {
    safelyCall(() -> driver.quit());
    safelyCall(() -> hub.stop());
  }

  @Test
  public void shouldReportNoCapacityWhenNoNodesAreRegistered() {
    driver.get(whereIs(hub, "/ui/index.html#/"));

    WebElement element = wait.until(visibilityOfElementLocated(By.id("ring-system")));

    assertEquals("0% free", element.getText());
  }

  private static Server<?> createHub(int publish, int subscribe) {
    String[] rawConfig = new String[] {
      "[events]",
      "bind = true",
      "publish = \"tcp://localhost:" + publish + "\"",
      "subscribe = \"tcp://localhost:" + subscribe + "\"",
      "",
      "[server]",
      "port = " + PortProber.findFreePort(),
      "registration-secret = \"cheddar\""
    };

    Config hubConfig = new MemoizedConfig(new TomlConfig(new StringReader(String.join("\n", rawConfig))));

    Server<?> hubServer = new Hub().asServer(hubConfig).start();

    waitUntilReady(hubServer, Boolean.FALSE);

    return hubServer;
  }

  private static void waitUntilReady(Server<?> server, Boolean state) {
    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

    new FluentWait<>(client)
      .withTimeout(Duration.ofSeconds(5))
      .until(c -> {
        HttpResponse response = c.execute(new HttpRequest(GET, "/readyz"));
        return response.isSuccessful();
      });
  }
}
