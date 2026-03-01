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

import static java.util.Objects.requireNonNull;
import static java.util.logging.Level.FINE;
import static java.util.logging.Level.INFO;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.StringReader;
import java.net.URL;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
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
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverBeforeTest;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.drivers.Browser;

class RemoteWebDriverBiDiTest extends JupiterTestBase {
  private static final Logger LOG = Logger.getLogger(RemoteWebDriverBiDiTest.class.getName());

  private Deployment deployment;
  private URL remoteUrl;

  @BeforeEach
  void setup() {
    Browser browser = requireNonNull(Browser.detect());
    LOG.log(FINE, () -> String.format("Starting grid server for %s...", browser));

    deployment =
        DeploymentTypes.STANDALONE.start(
            browser.getCapabilities(),
            new TomlConfig(
                new StringReader(
                    "[node]\n"
                        + "selenium-manager = false\n"
                        + "driver-implementation = "
                        + String.format("\"%s\"", browser.displayName()))));
    remoteUrl = deployment.getServer().getUrl();
    LOG.log(INFO, () -> String.format("Started grid server for %s: %s", browser, remoteUrl));

    localDriver = new RemoteWebDriver(remoteUrl, browser.getCapabilities());
    localDriver = new Augmenter().augment(localDriver);
  }

  @AfterEach
  void tearDownDeployment() {
    if (localDriver != null) {
      localDriver.quit();
    }

    if (deployment != null) {
      LOG.log(FINE, () -> String.format("Stopping grid server %s ...", remoteUrl));
      Safely.safelyCall(() -> deployment.tearDown());
      LOG.log(INFO, () -> String.format("Stopped grid server %s", remoteUrl));
    }
  }

  @Test
  @NoDriverBeforeTest
  void ensureBiDiSessionCreation() {
    try (BiDi biDi = ((HasBiDi) localDriver).getBiDi()) {
      BiDiSessionStatus status = biDi.getBidiSessionStatus();
      assertThat(status).isNotNull();
      assertThat(status.getMessage()).isNotEmpty();
    }
  }

  @Test
  @NoDriverBeforeTest
  void canListenToLogs() throws ExecutionException, InterruptedException, TimeoutException {
    try (LogInspector logInspector = new LogInspector(localDriver)) {
      CompletableFuture<ConsoleLogEntry> future = new CompletableFuture<>();
      logInspector.onConsoleEntry(future::complete);

      String page = appServer.whereIs("/bidi/logEntryAdded.html");
      localDriver.get(page);
      localDriver.findElement(By.id("consoleLog")).click();

      ConsoleLogEntry logEntry = future.get(5, TimeUnit.SECONDS);

      Source source = logEntry.getSource();
      assertThat(source.getBrowsingContext().isPresent()).isTrue();
      assertThat(source.getRealm()).isNotNull();
      assertThat(logEntry.getText()).isEqualTo("Hello, world!");
      assertThat(logEntry.getArgs()).hasSize(1);
      assertThat(logEntry.getType()).isEqualTo("console");
      assertThat(logEntry.getLevel()).isEqualTo(LogLevel.INFO);
      assertThat(logEntry.getMethod()).isEqualTo("log");
    }
  }

  @Test
  @NoDriverBeforeTest
  void canNavigateToUrl() {
    BrowsingContext browsingContext = new BrowsingContext(localDriver, WindowType.TAB);

    String url = appServer.whereIs("/bidi/logEntryAdded.html");
    NavigationResult info = browsingContext.navigate(url);

    assertThat(browsingContext.getId()).isNotEmpty();
    assertThat(info.getNavigationId()).isNotNull();
    assertThat(info.getUrl()).contains("/bidi/logEntryAdded.html");
  }
}
