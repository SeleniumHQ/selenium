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

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.environment.webserver.JreAppServer;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static java.lang.System.currentTimeMillis;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.http.Contents.utf8String;

public class UrlCheckerTest {

  private final UrlChecker urlChecker = new UrlChecker();
  private final ExecutorService executorService = Executors.newSingleThreadExecutor();
  private JreAppServer server;
  private URL url;

  @Before
  public void buildServer() throws MalformedURLException {
    JreAppServer server = new JreAppServer(req -> new HttpResponse()
      .setStatus(200)
      .setContent(utf8String("<h1>Working</h1>")));
    this.server = server;

    this.url = new URL(server.whereIs("/"));
  }

  @Test
  public void testWaitUntilAvailableIsTimely() throws Exception {
    long delay = 200L;

    executorService.submit(() -> {
      Thread.sleep(delay);
      server.start();
      return null;
    });

    long start = currentTimeMillis();
    urlChecker.waitUntilAvailable(10, TimeUnit.SECONDS, url);
    long elapsed = currentTimeMillis() - start;
    assertThat(elapsed).isLessThan(UrlChecker.CONNECT_TIMEOUT_MS + 100L); // threshold
  }

  @Test
  public void testWaitUntilUnavailableIsTimely() throws Exception {
    long delay = 200L;
    server.start();
    urlChecker.waitUntilAvailable(10, TimeUnit.SECONDS, url);

    executorService.submit(() -> {
      Thread.sleep(delay);
      server.stop();
      return null;
    });

    long start = currentTimeMillis();
    urlChecker.waitUntilUnavailable(10, TimeUnit.SECONDS, url);
    long elapsed = currentTimeMillis() - start;
    assertThat(elapsed).isLessThan(UrlChecker.CONNECT_TIMEOUT_MS + delay + 200L); // threshold
  }

  @After
  public void cleanup() {
    if (server != null) {
      server.stop();
    }
    executorService.shutdown();
  }
}
