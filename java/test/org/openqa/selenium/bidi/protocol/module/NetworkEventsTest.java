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

package org.openqa.selenium.bidi.protocol.module;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.protocol.network.AuthRequiredParameters;
import org.openqa.selenium.bidi.protocol.network.BeforeRequestSentParameters;
import org.openqa.selenium.bidi.protocol.network.FetchErrorParameters;
import org.openqa.selenium.bidi.protocol.network.ResponseCompletedParameters;
import org.openqa.selenium.bidi.protocol.network.ResponseStartedParameters;
import org.openqa.selenium.bidi.protocol.network.StringValue;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.Pages;

class NetworkEventsTest extends JupiterTestBase {

  private String page;

  @Test
  @NeedsFreshDriver
  void canListenToBeforeRequestSentEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    Network network = new Network(driver);
    CompletableFuture<BeforeRequestSentParameters> future = new CompletableFuture<>();
    network.subscribe(Network.BEFORE_REQUEST_SENT, future::complete);
    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);

    BeforeRequestSentParameters requestSent = future.get(5, TimeUnit.SECONDS);
    String windowHandle = driver.getWindowHandle();
    assertThat(requestSent.getContext()).isEqualTo(windowHandle);
    assertThat(requestSent.getRequest().getRequest()).isNotNull();
    assertThat(requestSent.getRequest().getMethod()).isEqualToIgnoringCase("get");
    assertThat(requestSent.getRequest().getUrl()).isNotNull();
    assertThat(requestSent.getInitiator()).isPresent();
    assertThat(requestSent.getInitiator().get().getType()).isPresent();
    assertThat(requestSent.getInitiator().get().getType().get().toString())
        .isEqualToIgnoringCase("other");
  }

  @Test
  @NeedsFreshDriver
  void canListenToResponseStartedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    Network network = new Network(driver);
    CompletableFuture<ResponseStartedParameters> future = new CompletableFuture<>();
    network.subscribe(Network.RESPONSE_STARTED, future::complete);
    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);

    ResponseStartedParameters response = future.get(5, TimeUnit.SECONDS);
    String windowHandle = driver.getWindowHandle();
    assertThat(response.getContext()).isEqualTo(windowHandle);
    assertThat(response.getRequest().getRequest()).isNotNull();
    assertThat(response.getRequest().getMethod()).isEqualToIgnoringCase("get");
    assertThat(response.getRequest().getUrl()).isNotNull();
    assertThat(response.getResponse().getHeaders().size()).isGreaterThanOrEqualTo(1);
    assertThat(response.getResponse().getUrl()).contains("/bidi/logEntryAdded.html");
    assertThat(response.getResponse().getStatus()).isEqualTo(200);
  }

  @Test
  @NeedsFreshDriver
  void canListenToResponseCompletedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    Network network = new Network(driver);
    CompletableFuture<ResponseCompletedParameters> future = new CompletableFuture<>();
    network.subscribe(Network.RESPONSE_COMPLETED, future::complete);
    page = appServer.whereIs("/bidi/logEntryAdded.html");
    driver.get(page);

    ResponseCompletedParameters response = future.get(5, TimeUnit.SECONDS);
    String windowHandle = driver.getWindowHandle();
    assertThat(response.getContext()).isEqualTo(windowHandle);
    assertThat(response.getRequest().getRequest()).isNotNull();
    assertThat(response.getRequest().getMethod()).isEqualToIgnoringCase("get");
    assertThat(response.getRequest().getUrl()).isNotNull();
    assertThat(response.getResponse().getHeaders().size()).isGreaterThanOrEqualTo(1);
    assertThat(response.getResponse().getUrl()).contains("/bidi/logEntryAdded.html");
    assertThat(response.getResponse().getStatus()).isEqualTo(200);
  }

  @Test
  @NeedsFreshDriver
  void canListenToResponseCompletedEventWithCookie()
      throws ExecutionException, InterruptedException, TimeoutException {
    Network network = new Network(driver);
    CompletableFuture<BeforeRequestSentParameters> future = new CompletableFuture<>();

    driver.get(new Pages(appServer).blankPage);
    driver.manage().addCookie(new Cookie("foo", "bar"));
    network.subscribe(Network.BEFORE_REQUEST_SENT, future::complete);
    driver.navigate().refresh();

    BeforeRequestSentParameters requestSent = future.get(5, TimeUnit.SECONDS);
    String windowHandle = driver.getWindowHandle();
    assertThat(requestSent.getContext()).isEqualTo(windowHandle);
    assertThat(requestSent.getRequest().getCookies()).hasSize(1);
    assertThat(requestSent.getRequest().getCookies().get(0).getName()).isEqualTo("foo");
    assertThat(((StringValue) requestSent.getRequest().getCookies().get(0).getValue()).getValue())
        .isEqualTo("bar");
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canListenToOnAuthRequiredEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    Network network = new Network(driver);
    CompletableFuture<AuthRequiredParameters> future = new CompletableFuture<>();
    network.subscribe(Network.AUTH_REQUIRED, future::complete);
    page = appServer.whereIs("basicAuth");
    driver.get(page);

    AuthRequiredParameters response = future.get(5, TimeUnit.SECONDS);
    String windowHandle = driver.getWindowHandle();
    assertThat(response.getContext()).isEqualTo(windowHandle);
    assertThat(response.getRequest().getRequest()).isNotNull();
    assertThat(response.getRequest().getMethod()).isEqualToIgnoringCase("get");
    assertThat(response.getRequest().getUrl()).isNotNull();
    assertThat(response.getResponse().getHeaders().size()).isGreaterThanOrEqualTo(1);
    assertThat(response.getResponse().getUrl()).contains("basicAuth");
    assertThat(response.getResponse().getStatus()).isEqualTo(401);
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canListenToFetchError() throws ExecutionException, InterruptedException, TimeoutException {
    Network network = new Network(driver);
    CompletableFuture<FetchErrorParameters> future = new CompletableFuture<>();
    network.subscribe(Network.FETCH_ERROR, future::complete);
    page = appServer.whereIs("error");
    try {
      driver.get("https://not_a_valid_url.test/");
    } catch (WebDriverException ignored) {
      // Expected — the navigation itself fails; we only care about the BiDi event it produces.
    }

    FetchErrorParameters fetchError = future.get(5, TimeUnit.SECONDS);
    String windowHandle = driver.getWindowHandle();
    assertThat(fetchError.getContext()).isEqualTo(windowHandle);
    assertThat(fetchError.getRequest().getRequest()).isNotNull();
    assertThat(fetchError.getRequest().getMethod()).isEqualToIgnoringCase("get");
    assertThat(fetchError.getRequest().getUrl()).contains("https://not_a_valid_url.test/");
    assertThat(fetchError.getRequest().getHeaders().size()).isGreaterThanOrEqualTo(1);
    assertThat(fetchError.getNavigation()).isNotNull();
    assertThat(fetchError.getErrorText()).contains("UNKNOWN_HOST");
  }
}
