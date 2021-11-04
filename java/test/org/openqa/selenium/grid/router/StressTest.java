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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
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

import java.io.StringReader;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.concurrent.TimeUnit.MINUTES;
import static org.assertj.core.api.Assertions.assertThat;

public class StressTest {

  private final ExecutorService executor =
    Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * 2);
  private final List<TearDownFixture> tearDowns = new LinkedList<>();
  private Server<?> server;
  private Browser browser;
  private Server<?> appServer;

  @Before
  public void setupServers() {
    browser = Objects.requireNonNull(Browser.detect());

    Deployment deployment = DeploymentTypes.DISTRIBUTED.start(
      browser.getCapabilities(),
      new TomlConfig(new StringReader(
        "[node]\n" +
        "driver-implementation = " + browser.displayName())));
    tearDowns.add(deployment);

    server = deployment.getServer();

    appServer = new NettyServer(
      new BaseServerOptions(new MemoizedConfig(new MapConfig(Map.of()))),
      req -> {
        try {
          Thread.sleep(2000);
        } catch (InterruptedException e) {
          throw new RuntimeException(e);
        }
        return new HttpResponse()
          .setContent(Contents.string("<h1>Cheese</h1>", UTF_8));
      });

    tearDowns.add(() -> appServer.stop());
    appServer.start();
  }

  @After
  public void tearDown() {
    tearDowns.parallelStream().forEach(Safely::safelyCall);
    executor.shutdownNow();
  }

  @Test
  public void multipleSimultaneousSessions() throws Exception {
    assertThat(server.isStarted()).isTrue();

    CompletableFuture<?>[] futures = new CompletableFuture<?>[10];
    for (int i = 0; i < futures.length; i++) {
      CompletableFuture<Object> future = new CompletableFuture<>();
      futures[i] = future;

      executor.submit(() -> {
        try {
          WebDriver driver = RemoteWebDriver.builder()
            .oneOf(browser.getCapabilities())
            .address(server.getUrl())
            .build();

          driver.get(appServer.getUrl().toString());
          driver.findElement(By.tagName("body"));

          // And now quit
          driver.quit();
          future.complete(true);
        } catch (Exception e) {
          future.completeExceptionally(e);
        }
      });
    }

    CompletableFuture.allOf(futures).get(4, MINUTES);
  }
}
