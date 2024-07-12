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

package org.openqa.selenium.bidi.network;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.Safely.safelyCall;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.module.Network;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.Pages;

class NetworkEventsTest extends JupiterTestBase {

  private String page;
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  @NotYetImplemented(EDGE)
  void canListenToBeforeRequestSentEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (Network network = new Network(driver)) {
      CompletableFuture<BeforeRequestSent> future = new CompletableFuture<>();
      network.onBeforeRequestSent(future::complete);
      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);

      BeforeRequestSent requestSent = future.get(5, TimeUnit.SECONDS);
      String windowHandle = driver.getWindowHandle();
      assertThat(requestSent.getBrowsingContextId()).isEqualTo(windowHandle);
      assertThat(requestSent.getRequest().getRequestId()).isNotNull();
      assertThat(requestSent.getRequest().getMethod()).isEqualToIgnoringCase("get");
      assertThat(requestSent.getRequest().getUrl()).isNotNull();
      assertThat(requestSent.getInitiator().getType().toString()).isEqualToIgnoringCase("other");
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  void canListenToResponseStartedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (Network network = new Network(driver)) {
      CompletableFuture<ResponseDetails> future = new CompletableFuture<>();
      network.onResponseStarted(future::complete);
      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);

      ResponseDetails response = future.get(5, TimeUnit.SECONDS);
      String windowHandle = driver.getWindowHandle();
      assertThat(response.getBrowsingContextId()).isEqualTo(windowHandle);
      assertThat(response.getRequest().getRequestId()).isNotNull();
      assertThat(response.getRequest().getMethod()).isEqualToIgnoringCase("get");
      assertThat(response.getRequest().getUrl()).isNotNull();
      assertThat(response.getResponseData().getHeaders().size()).isGreaterThanOrEqualTo(1);
      assertThat(response.getResponseData().getUrl()).contains("/bidi/logEntryAdded.html");
      assertThat(response.getResponseData().getStatus()).isEqualTo(200L);
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  void canListenToResponseCompletedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (Network network = new Network(driver)) {
      CompletableFuture<ResponseDetails> future = new CompletableFuture<>();
      network.onResponseCompleted(future::complete);
      page = server.whereIs("/bidi/logEntryAdded.html");
      driver.get(page);

      ResponseDetails response = future.get(5, TimeUnit.SECONDS);
      String windowHandle = driver.getWindowHandle();
      assertThat(response.getBrowsingContextId()).isEqualTo(windowHandle);
      assertThat(response.getRequest().getRequestId()).isNotNull();
      assertThat(response.getRequest().getMethod()).isEqualToIgnoringCase("get");
      assertThat(response.getRequest().getUrl()).isNotNull();
      assertThat(response.getResponseData().getHeaders().size()).isGreaterThanOrEqualTo(1);
      assertThat(response.getResponseData().getUrl()).contains("/bidi/logEntryAdded.html");
      assertThat(response.getResponseData().getStatus()).isEqualTo(200L);
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  void canListenToResponseCompletedEventWithCookie()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (Network network = new Network(driver)) {
      CompletableFuture<BeforeRequestSent> future = new CompletableFuture<>();

      driver.get(new Pages(server).blankPage);
      driver.manage().addCookie(new Cookie("foo", "bar"));
      network.onBeforeRequestSent(future::complete);
      driver.navigate().refresh();

      BeforeRequestSent requestSent = future.get(5, TimeUnit.SECONDS);
      String windowHandle = driver.getWindowHandle();
      assertThat(requestSent.getBrowsingContextId()).isEqualTo(windowHandle);
      assertThat(requestSent.getRequest().getCookies().size()).isEqualTo(1);
      assertThat(requestSent.getRequest().getCookies().get(0).getName()).isEqualTo("foo");
      assertThat(requestSent.getRequest().getCookies().get(0).getValue().getValue())
          .isEqualTo("bar");
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canListenToOnAuthRequiredEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (Network network = new Network(driver)) {
      CompletableFuture<ResponseDetails> future = new CompletableFuture<>();
      network.onAuthRequired(future::complete);
      page = server.whereIs("basicAuth");
      driver.get(page);

      ResponseDetails response = future.get(5, TimeUnit.SECONDS);
      String windowHandle = driver.getWindowHandle();
      assertThat(response.getBrowsingContextId()).isEqualTo(windowHandle);
      assertThat(response.getRequest().getRequestId()).isNotNull();
      assertThat(response.getRequest().getMethod()).isEqualToIgnoringCase("get");
      assertThat(response.getRequest().getUrl()).isNotNull();
      assertThat(response.getResponseData().getHeaders().size()).isGreaterThanOrEqualTo(1);
      assertThat(response.getResponseData().getUrl()).contains("basicAuth");
      assertThat(response.getResponseData().getStatus()).isEqualTo(401L);
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canListenToFetchError() throws ExecutionException, InterruptedException, TimeoutException {
    try (Network network = new Network(driver)) {
      CompletableFuture<FetchError> future = new CompletableFuture<>();
      network.onFetchError(future::complete);
      page = server.whereIs("error");
      try {
        driver.get("https://not_a_valid_url.test/");
      } catch (WebDriverException ignored) {
      }

      FetchError fetchError = future.get(5, TimeUnit.SECONDS);
      String windowHandle = driver.getWindowHandle();
      assertThat(fetchError.getBrowsingContextId()).isEqualTo(windowHandle);
      assertThat(fetchError.getRequest().getRequestId()).isNotNull();
      assertThat(fetchError.getRequest().getMethod()).isEqualToIgnoringCase("get");
      assertThat(fetchError.getRequest().getUrl()).contains("https://not_a_valid_url.test/");
      assertThat(fetchError.getRequest().getHeaders().size()).isGreaterThanOrEqualTo(1);
      assertThat(fetchError.getNavigationId()).isNotNull();
      assertThat(fetchError.getErrorText()).contains("UNKNOWN_HOST");
    }
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
