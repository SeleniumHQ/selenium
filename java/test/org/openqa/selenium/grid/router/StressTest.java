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

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.concurrent.TimeUnit.MINUTES;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.openqa.selenium.remote.CapabilityType.ENABLE_DOWNLOADS;

import java.io.StringReader;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.TearDownFixture;
import org.openqa.selenium.testing.drivers.Browser;

class StressTest {

  private final ExecutorService executor =
      Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * 2);
  private final List<TearDownFixture> tearDowns = new LinkedList<>();
  private Server<?> server;
  private Browser browser;
  private Server<?> appServer;

  @BeforeEach
  public void setupServers() {
    browser = Objects.requireNonNull(Browser.detect());

    Deployment deployment =
        DeploymentTypes.DISTRIBUTED.start(
            browser.getCapabilities(),
            new TomlConfig(
                new StringReader(
                    "[node]\n"
                        + "driver-implementation = "
                        + String.format("\"%s\"", browser.displayName())
                        + "\n"
                        + "session-timeout = 11"
                        + "\n"
                        + "override-max-sessions = true"
                        + "\n"
                        + "max-sessions = "
                        + Runtime.getRuntime().availableProcessors() * 2
                        + "\n"
                        + "enable-managed-downloads = true")));
    tearDowns.add(deployment);

    server = deployment.getServer();

    appServer =
        new NettyServer(
            new BaseServerOptions(new MemoizedConfig(new MapConfig(Map.of()))),
            req -> {
              try {
                Thread.sleep(2000);
              } catch (InterruptedException e) {
                throw new RuntimeException(e);
              }
              return new HttpResponse().setContent(Contents.string("<h1>Cheese</h1>", UTF_8));
            });

    tearDowns.add(() -> appServer.stop());
    appServer.start();
  }

  @AfterEach
  public void tearDown() {
    tearDowns.parallelStream().forEach(Safely::safelyCall);
    executor.shutdownNow();
  }

  @Test
  void multipleSimultaneousSessions() throws Exception {
    assertThat(server.isStarted()).isTrue();

    CompletableFuture<?>[] futures = new CompletableFuture<?>[10];
    for (int i = 0; i < futures.length; i++) {
      CompletableFuture<Object> future = new CompletableFuture<>();
      futures[i] =
          CompletableFuture.runAsync(
              () -> {
                WebDriver driver =
                    RemoteWebDriver.builder()
                        .oneOf(
                            browser
                                .getCapabilities()
                                .merge(new MutableCapabilities(Map.of(ENABLE_DOWNLOADS, true))))
                        .address(server.getUrl())
                        .build();

                driver.get(appServer.getUrl().toString());
                driver.findElement(By.tagName("body"));

                // And now quit
                driver.quit();
              },
              executor);
    }

    CompletableFuture.allOf(futures).get(6, MINUTES);
  }

  @Test
  void multipleSimultaneousSessionsTimedOut() throws Exception {
    assertThat(server.isStarted()).isTrue();

    CompletableFuture<?>[] futures = new CompletableFuture<?>[10];
    for (int i = 0; i < futures.length; i++) {
      futures[i] =
          CompletableFuture.runAsync(
              () -> {
                WebDriver driver =
                    RemoteWebDriver.builder()
                        .oneOf(browser.getCapabilities())
                        .address(server.getUrl())
                        .build();
                driver.get(appServer.getUrl().toString());
                try {
                  Thread.sleep(11000);
                } catch (InterruptedException ex) {
                  Thread.currentThread().interrupt();
                  throw new RuntimeException(ex);
                }
                // note: As soon as the session cleanup of the node is performed, the grid is unable
                // to route the request. All commands to a session in this state will fail with:
                // "Unable to find session with ID:"
                NoSuchSessionException exception =
                    assertThrows(NoSuchSessionException.class, driver::getTitle);
                assertThat(exception.getMessage())
                    .matches(
                        (msg) ->
                            // the session timed out, the cleanup is pending
                            msg.startsWith("Cannot find session with id:")
                                // the session timed out, the cleanup is done
                                || msg.startsWith("Unable to find session with ID:"),
                        "Cannot find session … / Unable to find session …");
                WebDriverException webDriverException =
                    assertThrows(
                        WebDriverException.class,
                        () -> ((RemoteWebDriver) driver).getDownloadableFiles());
                assertThat(webDriverException.getMessage())
                    .matches(
                        (msg) ->
                            // the session timed out, the cleanup is pending
                            msg.startsWith("Cannot find downloads file system for session id:")
                                // the session timed out, the cleanup is done
                                || msg.startsWith("Unable to find session with ID:"),
                        "Cannot find downloads … / Unable to find session …");
              },
              executor);
    }

    CompletableFuture.allOf(futures).get(6, MINUTES);
  }
}
