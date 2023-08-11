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
package org.openqa.selenium.net;

import static java.lang.System.currentTimeMillis;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.remote.http.HttpResponse;

class UrlCheckerTest {

  private final UrlChecker urlChecker = new UrlChecker();
  private final ExecutorService executorService = Executors.newSingleThreadExecutor();
  private NettyAppServer server;
  private URL url;

  @BeforeEach
  public void buildServer() throws MalformedURLException, UrlChecker.TimeoutException {
    // Warming NettyServer up
    final NettyAppServer server = createServer();
    executorService.submit(
        () -> {
          server.start();
          return null;
        });
    urlChecker.waitUntilAvailable(10, TimeUnit.SECONDS, new URL(server.whereIs("/")));
    server.stop();

    this.server = createServer();
    this.url = new URL(this.server.whereIs("/"));
  }

  private NettyAppServer createServer() {
    return new NettyAppServer(
        req -> new HttpResponse().setStatus(200).setContent(utf8String("<h1>Working</h1>")));
  }

  @Test
  void testWaitUntilAvailableIsTimely() throws Exception {
    long delay = 200L;

    executorService.submit(
        () -> {
          Thread.sleep(delay);
          server.start();
          return null;
        });

    long start = currentTimeMillis();
    urlChecker.waitUntilAvailable(10, TimeUnit.SECONDS, url);
    long elapsed = currentTimeMillis() - start;
    assertThat(elapsed).isLessThan(UrlChecker.CONNECT_TIMEOUT_MS + 600L); // threshold
  }

  @Test
  void testWaitUntilUnavailableIsTimely() throws Exception {
    long delay = 200L;
    server.start();
    urlChecker.waitUntilAvailable(10, TimeUnit.SECONDS, url);

    executorService.submit(
        () -> {
          Thread.sleep(delay);
          server.stop();
          return null;
        });

    long start = currentTimeMillis();
    urlChecker.waitUntilUnavailable(10, TimeUnit.SECONDS, url);
    long elapsed = currentTimeMillis() - start;
    assertThat(elapsed).isLessThan(UrlChecker.CONNECT_TIMEOUT_MS + delay + 600L); // threshold
  }

  @AfterEach
  public void cleanup() {
    safelyCall(() -> server.stop());
    safelyCall(executorService::shutdownNow);
  }
}
