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

package org.openqa.selenium.grid.router;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.io.StringReader;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.BiDiSessionStatus;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.NavigationResult;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import org.openqa.selenium.bidi.log.LogLevel;
import org.openqa.selenium.bidi.module.LogInspector;
import org.openqa.selenium.bidi.script.Source;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.drivers.Browser;

class RemoteWebDriverBiDiTest {
  private static AppServer server;
  private WebDriver driver;

  @BeforeAll
  static void serverSetup() {
    server = new NettyAppServer(false);
    server.start();
  }

  @BeforeEach
  void setup() {
    Browser browser = Objects.requireNonNull(Browser.detect());

    Deployment deployment =
        DeploymentTypes.STANDALONE.start(
            browser.getCapabilities(),
            new TomlConfig(
                new StringReader(
                    "[node]\n"
                        + "selenium-manager = false\n"
                        + "driver-implementation = "
                        + String.format("\"%s\"", browser.displayName()))));

    driver = new RemoteWebDriver(deployment.getServer().getUrl(), browser.getCapabilities());
    driver = new Augmenter().augment(driver);
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void ensureBiDiSessionCreation() {
    try (BiDi biDi = ((HasBiDi) driver).getBiDi()) {
      BiDiSessionStatus status = biDi.getBidiSessionStatus();
      assertThat(status).isNotNull();
      assertThat(status.getMessage()).isNotEmpty();
    }
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void canListenToLogs() throws ExecutionException, InterruptedException, TimeoutException {
    driver = new Augmenter().augment(driver);

    try (LogInspector logInspector = new LogInspector(driver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete);

      String page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);
      driver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      Source source = logEntry.getSource();
      assertThat(source.getBrowsingContext().isPresent()).isTrue();
      assertThat(source.getRealm()).isNotNull();
      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getArgs().size()).isEqualTo(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
    }
  }

  @Test
  @Ignore(IE)
  @Ignore(SAFARI)
  void canNavigateToUrl() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = server.whereIs("/bidi/logEntryAdded.html");
    NavigationResult info = browsingContext.navigate(url);

    assertThat(browsingContext.getId()).isNotEmpty();
    assertThat(info.getNavigationId()).isNotNull();
    assertThat(info.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @AfterEach
  void clean() {
    driver.quit();
  }

  @AfterAll
  static void stopServer() {
    server.stop();
  }
}
