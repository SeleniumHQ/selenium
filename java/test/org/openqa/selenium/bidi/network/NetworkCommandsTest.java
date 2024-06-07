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
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.openqa.selenium.testing.Safely.safelyCall;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.bidi.module.Network;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

class NetworkCommandsTest extends JupiterTestBase {
  private String page;
  private AppServer server;

  @BeforeEach
  public void setUp() {
    server = new NettyAppServer();
    server.start();
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canAddIntercept() {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
      assertThat(intercept).isNotNull();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canContinueRequest() throws InterruptedException {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));

      CountDownLatch latch = new CountDownLatch(1);

      // String alternatePage = server.whereIs("printPage.html");
      // TODO: Test sending request to alternate page once it is supported by browsers
      network.onBeforeRequestSent(
          beforeRequestSent -> {
            network.continueRequest(
                new ContinueRequestParameters(beforeRequestSent.getRequest().getRequestId()));

            // network.continueRequest(
            // new
            // ContinueRequestParameters(beforeRequestSent.getRequest().getRequestId()).method("get").url(alternatePage));

            latch.countDown();
          });

      assertThat(intercept).isNotNull();

      driver.get(server.whereIs("/bidi/logEntryAdded.html"));

      boolean countdown = latch.await(5, TimeUnit.SECONDS);
      assertThat(countdown).isTrue();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canContinueResponse() throws InterruptedException {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.RESPONSE_STARTED));

      CountDownLatch latch = new CountDownLatch(1);

      // TODO: Test sending response with a different status code once it is supported by the
      // browsers
      network.onResponseStarted(
          responseDetails -> {
            network.continueResponse(
                new ContinueResponseParameters(responseDetails.getRequest().getRequestId()));
            latch.countDown();
          });

      assertThat(intercept).isNotNull();

      driver.get(server.whereIs("/bidi/logEntryAdded.html"));

      boolean countdown = latch.await(5, TimeUnit.SECONDS);
      assertThat(countdown).isTrue();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canProvideResponse() throws InterruptedException {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));

      CountDownLatch latch = new CountDownLatch(1);

      network.onBeforeRequestSent(
          beforeRequestSent -> {
            network.provideResponse(
                new ProvideResponseParameters(beforeRequestSent.getRequest().getRequestId()));

            latch.countDown();
          });

      assertThat(intercept).isNotNull();

      driver.get(server.whereIs("/bidi/logEntryAdded.html"));

      boolean countdown = latch.await(5, TimeUnit.SECONDS);
      assertThat(countdown).isTrue();
    }
  }

  @Disabled
  @NotYetImplemented(EDGE)
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(CHROME)
  // TODO: Browsers are yet to implement all parameters. Once implemented, add exhaustive tests.
  void canProvideResponseWithAllParameters() throws InterruptedException {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.RESPONSE_STARTED));

      CountDownLatch latch = new CountDownLatch(1);

      network.onResponseStarted(
          responseDetails -> {
            network.provideResponse(
                new ProvideResponseParameters(responseDetails.getRequest().getRequestId())
                    .body(
                        new BytesValue(
                            BytesValue.Type.STRING,
                            "<html><head><title>Hello," + " World!</title></head><body/></html>")));

            latch.countDown();
          });

      assertThat(intercept).isNotNull();

      driver.get(server.whereIs("/bidi/logEntryAdded.html"));

      boolean countdown = latch.await(5, TimeUnit.SECONDS);
      assertThat(countdown).isTrue();

      assertThat(driver.getPageSource()).contains("Hello");
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canRemoveIntercept() {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
      assertThat(intercept).isNotNull();

      network.removeIntercept(intercept);
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canContinueWithAuthCredentials() {
    try (Network network = new Network(driver)) {
      network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));
      network.onAuthRequired(
          responseDetails ->
              network.continueWithAuth(
                  responseDetails.getRequest().getRequestId(),
                  new UsernameAndPassword("test", "test")));

      page = server.whereIs("basicAuth");
      driver.get(page);
      assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canContinueWithoutAuthCredentials() {
    try (Network network = new Network(driver)) {
      network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));
      network.onAuthRequired(
          responseDetails ->
              // Does not handle the alert
              network.continueWithAuthNoCredentials(responseDetails.getRequest().getRequestId()));
      page = server.whereIs("basicAuth");
      driver.get(page);
      // This would fail if alert was handled
      Alert alert = wait.until(ExpectedConditions.alertIsPresent());
      alert.dismiss();
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canCancelAuth() {
    try (Network network = new Network(driver)) {
      network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));
      network.onAuthRequired(
          responseDetails ->
              // Does not handle the alert
              network.cancelAuth(responseDetails.getRequest().getRequestId()));
      page = server.whereIs("basicAuth");
      driver.get(page);
      assertThatThrownBy(() -> wait.until(ExpectedConditions.alertIsPresent()))
          .isInstanceOf(TimeoutException.class);
    }
  }

  @Test
  @NotYetImplemented(EDGE)
  @NotYetImplemented(CHROME)
  void canFailRequest() {
    try (Network network = new Network(driver)) {
      network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
      network.onBeforeRequestSent(
          responseDetails -> network.failRequest(responseDetails.getRequest().getRequestId()));
      page = server.whereIs("basicAuth");
      driver.manage().timeouts().pageLoadTimeout(Duration.of(5, ChronoUnit.SECONDS));

      assertThatThrownBy(() -> driver.get(page)).isInstanceOf(WebDriverException.class);
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
