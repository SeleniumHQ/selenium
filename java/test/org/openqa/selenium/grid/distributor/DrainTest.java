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

package org.openqa.selenium.grid.distributor;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.StringReader;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.grid.commands.Hub;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.node.httpd.NodeServer;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.net.UrlChecker;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.drivers.Browser;

class DrainTest {

  private final Browser browser = Objects.requireNonNull(Browser.detect());

  @Disabled("the Node is terminated calling System.exit, this should be reworked in the future")
  @Test
  void nodeDoesNotTakeTooManySessions() throws Exception {
    String[] rawConfig =
        new String[] {
          "[events]",
          "publish = \"tcp://localhost:" + PortProber.findFreePort() + "\"",
          "subscribe = \"tcp://localhost:" + PortProber.findFreePort() + "\"",
          "",
          "[server]",
          "registration-secret = \"feta\""
        };

    Config baseConfig =
        new MemoizedConfig(new TomlConfig(new StringReader(String.join("\n", rawConfig))));

    Server<?> hub = startHub(baseConfig);
    try (AutoCloseable stopHub = () -> Safely.safelyCall(hub::stop)) {
      UrlChecker urlChecker = new UrlChecker();
      urlChecker.waitUntilAvailable(
          5, TimeUnit.SECONDS, hub.getUrl().toURI().resolve("readyz").toURL());

      // the CI has not enough CPUs so use a fixed number here
      int nThreads = 4 * 3;
      ExecutorService executor = Executors.newFixedThreadPool(nThreads);

      try {
        List<CompletableFuture<WebDriver>> pendingSessions = new ArrayList<>();
        CountDownLatch allPending = new CountDownLatch(nThreads);

        for (int i = 0; i < nThreads; i++) {
          CompletableFuture<WebDriver> future =
              CompletableFuture.supplyAsync(
                  () -> {
                    allPending.countDown();

                    return RemoteWebDriver.builder()
                        .oneOf(browser.getCapabilities())
                        .address(hub.getUrl())
                        .build();
                  },
                  executor);

          pendingSessions.add(future);
        }

        // ensure all sessions are in the queue
        Assertions.assertThat(allPending.await(8, TimeUnit.SECONDS)).isTrue();

        for (int i = 0; i < nThreads; i += 3) {
          // remove all completed futures
          assertThat(pendingSessions.removeIf(CompletableFuture::isDone)).isEqualTo(i != 0);

          // start a node draining after 3 sessions
          Server<?> node = startNode(baseConfig, hub, 6, 3);

          urlChecker.waitUntilAvailable(
              60, TimeUnit.SECONDS, node.getUrl().toURI().resolve("readyz").toURL());

          // use nano time to avoid issues with a jumping clock e.g. on WSL2 or due to time-sync
          long started = System.nanoTime();

          // wait for the first to start
          CompletableFuture.anyOf(pendingSessions.toArray(CompletableFuture<?>[]::new))
              .get(120, TimeUnit.SECONDS);

          // we want to check not more than 3 are started, polling won't help here
          Thread.sleep(Duration.ofNanos(System.nanoTime() - started).multipliedBy(2).toMillis());

          int stopped = 0;

          for (CompletableFuture<WebDriver> future : pendingSessions) {
            if (future.isDone()) {
              stopped++;
              future.get().quit();
            }
          }

          // the node should only pick 3 sessions to start, then starts to drain
          Assertions.assertThat(stopped).isEqualTo(3);

          // check the node stopped
          urlChecker.waitUntilUnavailable(
              40, TimeUnit.SECONDS, node.getUrl().toURI().resolve("readyz").toURL());
        }
      } finally {
        executor.shutdownNow();
      }
    }
  }

  @Test
  void sessionIsNotRejectedWhenNodeDrains() throws Exception {
    String[] rawConfig =
        new String[] {
          "[events]",
          "publish = \"tcp://localhost:" + PortProber.findFreePort() + "\"",
          "subscribe = \"tcp://localhost:" + PortProber.findFreePort() + "\"",
          "",
          "[server]",
          "registration-secret = \"feta\""
        };

    Config baseConfig =
        new MemoizedConfig(new TomlConfig(new StringReader(String.join("\n", rawConfig))));

    Server<?> hub = startHub(baseConfig);
    try (AutoCloseable stopHub = () -> Safely.safelyCall(hub::stop)) {
      UrlChecker urlChecker = new UrlChecker();
      urlChecker.waitUntilAvailable(
          5, TimeUnit.SECONDS, hub.getUrl().toURI().resolve("readyz").toURL());

      ExecutorService executor = Executors.newFixedThreadPool(2);

      try {
        Supplier<CompletableFuture<WebDriver>> newDriver =
            () ->
                CompletableFuture.supplyAsync(
                    () ->
                        RemoteWebDriver.builder()
                            .oneOf(browser.getCapabilities())
                            .address(hub.getUrl())
                            .build(),
                    executor);

        CompletableFuture<WebDriver> pendingA = newDriver.get();
        CompletableFuture<WebDriver> pendingB = newDriver.get();

        for (int i = 0; i < 16; i++) {
          // the node should drain automatically, covered by other tests
          startNode(baseConfig, hub, 6, 1);

          // wait for one to start
          CompletableFuture.anyOf(pendingA, pendingB).get(80, TimeUnit.SECONDS);

          if (pendingA.isDone() && pendingB.isDone()) {
            pendingA.get().quit();
            pendingB.get().quit();

            throw new IllegalStateException("only one should be started");
          } else if (pendingA.isDone()) {
            pendingA.get().quit();
            pendingA = newDriver.get();
          } else if (pendingB.isDone()) {
            pendingB.get().quit();
            pendingB = newDriver.get();
          }
        }
      } finally {
        executor.shutdownNow();
      }
    }
  }

  Server<?> startHub(Config baseConfig) {
    Config hubConfig =
        new MemoizedConfig(
            new CompoundConfig(
                new MapConfig(
                    Map.of(
                        "server",
                        Map.of("port", PortProber.findFreePort()),
                        "events",
                        Map.of("bind", true),
                        "distributor",
                        Map.of("newsession-threadpool-size", "6"))),
                baseConfig));

    return new Hub().asServer(hubConfig).start();
  }

  Server<?> startNode(Config baseConfig, Server<?> hub, int maxSessions, int drainAfter) {
    MapConfig additionalNodeConfig =
        new MapConfig(
            Map.of(
                "server", Map.of("port", PortProber.findFreePort()),
                "node",
                    Map.of(
                        "hub",
                        hub.getUrl(),
                        "driver-implementation",
                        browser.displayName(),
                        "override-max-sessions",
                        "true",
                        "max-sessions",
                        Integer.toString(maxSessions),
                        "drain-after-session-count",
                        drainAfter)));

    Config nodeConfig = new MemoizedConfig(new CompoundConfig(additionalNodeConfig, baseConfig));
    return new NodeServer().asServer(nodeConfig).start();
  }
}
