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
import static org.junit.jupiter.api.Assertions.fail;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;
import org.openqa.selenium.bidi.browsingcontext.ReadinessState;
import org.openqa.selenium.bidi.module.Network;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

class NetworkCommandsTest extends JupiterTestBase {
  private String page;

  @Test
  @NeedsFreshDriver
  void canAddIntercept() {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
      assertThat(intercept).isNotNull();
    }
  }

  @Test
  @NeedsFreshDriver
  void canContinueRequest() throws InterruptedException {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));

      CountDownLatch latch = new CountDownLatch(1);

      // String alternatePage = appServer.whereIs("printPage.html");
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

      BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

      browsingContext.navigate(
          appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);
      boolean countdown = latch.await(5, TimeUnit.SECONDS);
      assertThat(countdown).isTrue();
    }
  }

  @Test
  @NeedsFreshDriver
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

      BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

      browsingContext.navigate(
          appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);

      boolean countdown = latch.await(5, TimeUnit.SECONDS);
      assertThat(countdown).isTrue();
    }
  }

  @Test
  @NeedsFreshDriver
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

      BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

      browsingContext.navigate(
          appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);

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

      BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

      browsingContext.navigate(
          appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);

      boolean countdown = latch.await(5, TimeUnit.SECONDS);
      assertThat(countdown).isTrue();

      assertThat(driver.getPageSource()).contains("Hello");
    }
  }

  @Test
  @NeedsFreshDriver
  void canRemoveIntercept() {
    try (Network network = new Network(driver)) {
      String intercept =
          network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
      assertThat(intercept).isNotNull();

      network.removeIntercept(intercept);
    }
  }

  @Test
  @NeedsFreshDriver
  void canContinueWithAuthCredentials() {
    try (Network network = new Network(driver)) {
      network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));
      network.onAuthRequired(
          responseDetails ->
              network.continueWithAuth(
                  responseDetails.getRequest().getRequestId(),
                  new UsernameAndPassword("test", "test")));

      page = appServer.whereIs("basicAuth");
      BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

      browsingContext.navigate(page, ReadinessState.COMPLETE);

      assertThat(driver.findElement(By.tagName("h1")).getText()).isEqualTo("authorized");
    }
  }

  @Test
  @NeedsFreshDriver
  void canContinueWithoutAuthCredentials() {
    try (Network network = new Network(driver)) {
      network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));
      network.onAuthRequired(
          responseDetails -> {
            if (responseDetails.getRequest().getUrl().contains("basicAuth")) {
              network.continueWithAuthNoCredentials(responseDetails.getRequest().getRequestId());
            }
          });
      page = appServer.whereIs("basicAuth");
      BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

      try {
        browsingContext.navigate(page, ReadinessState.COMPLETE);
        fail("Exception should be thrown");
      } catch (Exception e) {
        assertThat(e).isInstanceOf(WebDriverException.class);
      }
    }
  }

  @Test
  @NeedsFreshDriver
  void canCancelAuth() throws InterruptedException {
    try (Network network = new Network(driver)) {
      network.addIntercept(new AddInterceptParameters(InterceptPhase.AUTH_REQUIRED));
      network.onAuthRequired(
          responseDetails -> {
            if (responseDetails.getRequest().getUrl().contains("basicAuth")) {
              // Does not handle the alert
              network.cancelAuth(responseDetails.getRequest().getRequestId());
            }
          });

      AtomicInteger status = new AtomicInteger();
      CountDownLatch latch = new CountDownLatch(1);

      network.onResponseCompleted(
          responseDetails -> {
            if (responseDetails.getRequest().getUrl().contains("basicAuth")) {
              status.set(responseDetails.getResponseData().getStatus());
              latch.countDown();
            }
          });

      page = appServer.whereIs("basicAuth");
      BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

      try {
        browsingContext.navigate(page, ReadinessState.COMPLETE);
      } catch (Exception BiDiException) {
        // Ignore
        // Only Chromium browsers throw an error because the navigation did not complete as
        // expected.
      }

      latch.await(10, TimeUnit.SECONDS);
      assertThat(status.get()).isEqualTo(401);
    }
  }

  @Test
  @NeedsFreshDriver
  void canFailRequest() {
    try (Network network = new Network(driver)) {
      network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
      network.onBeforeRequestSent(
          responseDetails -> network.failRequest(responseDetails.getRequest().getRequestId()));
      page = appServer.whereIs("basicAuth");
      driver.manage().timeouts().pageLoadTimeout(Duration.of(5, ChronoUnit.SECONDS));

      assertThatThrownBy(
              () -> {
                BrowsingContext browsingContext =
                    new BrowsingContext(driver, driver.getWindowHandle());
                browsingContext.navigate(
                    appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);
              })
          .isInstanceOf(WebDriverException.class);
    }
  }

  @Test
  @NeedsFreshDriver
  void canSetCacheBehaviorToBypass() {
    try (Network network = new Network(driver)) {
      page = appServer.whereIs("basicAuth");

      BrowsingContext context = new BrowsingContext(driver, WindowType.TAB);
      String contextId = context.getId();

      network.setCacheBehavior(CacheBehavior.BYPASS, Collections.singletonList(contextId));
    }
  }

  @Test
  @NeedsFreshDriver
  void canSetCacheBehaviorToDefault() {
    try (Network network = new Network(driver)) {
      page = appServer.whereIs("basicAuth");

      BrowsingContext context = new BrowsingContext(driver, WindowType.TAB);
      String contextId = context.getId();

      network.setCacheBehavior(CacheBehavior.DEFAULT, Collections.singletonList(contextId));
    }
  }

  @Test
  @NeedsFreshDriver
  void canSetCacheBehaviorWithNoContextId() {
    try (Network network = new Network(driver)) {
      page = appServer.whereIs("basicAuth");

      network.setCacheBehavior(CacheBehavior.BYPASS);
      network.setCacheBehavior(CacheBehavior.DEFAULT);
    }
  }

  @Test
  @NeedsFreshDriver
  void throwsExceptionForInvalidContext() {
    try (Network network = new Network(driver)) {
      page = appServer.whereIs("basicAuth");

      assertThatThrownBy(
              () ->
                  network.setCacheBehavior(
                      CacheBehavior.DEFAULT, Collections.singletonList("invalid-context")))
          .isInstanceOf(BiDiException.class)
          .hasMessageContaining("no such frame");
    }
  }
}
