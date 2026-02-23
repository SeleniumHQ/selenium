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

package org.openqa.selenium.bidi.speculation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.bidi.module.SpeculationInspector;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

class SpeculationInspectorTest extends JupiterTestBase {

  private Script script;
  private SpeculationInspector speculationInspector;

  @BeforeEach
  public void setUp() {
    script = new Script(driver);
    speculationInspector = new SpeculationInspector(driver);
  }

  @AfterEach
  public void cleanUp() {
    if (speculationInspector != null) {
      speculationInspector.close();
    }
    if (script != null) {
      script.close();
    }
  }

  void addSpeculationRulesAndLink(String rules, String href, String linkText, String linkId) {
    String expression =
        String.format(
            "const script = document.createElement('script');"
                + "script.type = 'speculationrules';"
                + "script.textContent = `%s`;"
                + "document.head.appendChild(script);"
                + "const link = document.createElement('a');"
                + "link.href = '%s';"
                + "link.textContent = '%s';"
                + "link.id = '%s';"
                + "document.body.appendChild(link);",
            rules, href, linkText, linkId);

    script.callFunctionInBrowsingContext(
        driver.getWindowHandle(),
        expression,
        false,
        Optional.empty(),
        Optional.empty(),
        Optional.empty());
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  void canListenToPrefetchStatusUpdatedWithPendingAndReadyEvents() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(2);
    List<PrefetchStatusUpdatedParameters> events = new ArrayList<>();

    speculationInspector.onPrefetchStatusUpdated(
        event -> {
          events.add(event);
          latch.countDown();
        });

    String testUrl = appServer.whereIs("/common/blank.html");
    driver.get(testUrl);

    String prefetchTarget = appServer.whereIs("/common/dummy.xml");
    String speculationRules =
        String.format(
            "{\"prefetch\": [{\"where\": {\"href_matches\": \"%s\"}, \"eagerness\":"
                + " \"immediate\"}]}",
            prefetchTarget);

    addSpeculationRulesAndLink(speculationRules, prefetchTarget, "Test Link", "prefetch-page");

    // Wait for 2 events (pending and ready)
    latch.await(5, TimeUnit.SECONDS);

    // Verify we got pending and ready events
    assertThat(events).hasSizeGreaterThanOrEqualTo(2);

    PrefetchStatusUpdatedParameters firstEvent = events.get(0);
    assertThat(firstEvent.getUrl()).isEqualTo(prefetchTarget);
    assertThat(firstEvent.getStatus()).isEqualTo(PreloadingStatus.PENDING);
    assertThat(firstEvent.getContext()).isEqualTo(driver.getWindowHandle());

    PrefetchStatusUpdatedParameters secondEvent = events.get(1);
    assertThat(secondEvent.getUrl()).isEqualTo(prefetchTarget);
    assertThat(secondEvent.getStatus()).isEqualTo(PreloadingStatus.READY);
    assertThat(secondEvent.getContext()).isEqualTo(driver.getWindowHandle());
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  void canListenToPrefetchStatusUpdatedWithNavigationAndSuccess()
      throws ExecutionException, InterruptedException, TimeoutException {
    CountDownLatch latch = new CountDownLatch(2);
    List<PrefetchStatusUpdatedParameters> events = new ArrayList<>();

    speculationInspector.onPrefetchStatusUpdated(
        event -> {
          events.add(event);
          latch.countDown();
        });

    String testUrl = appServer.whereIs("/common/blank.html");
    driver.get(testUrl);

    String prefetchTarget = appServer.whereIs("/common/dummy.xml");
    String speculationRules =
        String.format(
            "{\"prefetch\": [{\"where\": {\"href_matches\": \"%s\"}, \"eagerness\":"
                + " \"immediate\"}]}",
            prefetchTarget);

    addSpeculationRulesAndLink(speculationRules, prefetchTarget, "Test Link", "prefetch-page");

    // Wait for pending and ready events
    latch.await(5, TimeUnit.SECONDS);

    assertThat(events).hasSizeGreaterThanOrEqualTo(2);
    assertThat(events.get(0).getStatus()).isEqualTo(PreloadingStatus.PENDING);
    assertThat(events.get(1).getStatus()).isEqualTo(PreloadingStatus.READY);

    // Set up for success event
    CompletableFuture<PrefetchStatusUpdatedParameters> successFuture = new CompletableFuture<>();
    speculationInspector.onPrefetchStatusUpdated(
        event -> {
          if (event.getStatus() == PreloadingStatus.SUCCESS) {
            successFuture.complete(event);
          }
        });

    // Navigate to the prefetched page by clicking the link
    script.callFunctionInBrowsingContext(
        driver.getWindowHandle(),
        "const link = document.getElementById('prefetch-page'); if (link) { link.click(); }",
        false,
        Optional.empty(),
        Optional.empty(),
        Optional.empty());

    // Wait for success event
    PrefetchStatusUpdatedParameters successEvent = successFuture.get(5, TimeUnit.SECONDS);
    assertThat(successEvent.getUrl()).isEqualTo(prefetchTarget);
    assertThat(successEvent.getStatus()).isEqualTo(PreloadingStatus.SUCCESS);
    assertThat(successEvent.getContext()).isEqualTo(driver.getWindowHandle());
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  void canListenToPrefetchStatusUpdatedWithFailureEvents() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(2);
    List<PrefetchStatusUpdatedParameters> events = new ArrayList<>();

    speculationInspector.onPrefetchStatusUpdated(
        event -> {
          events.add(event);
          latch.countDown();
        });

    String testUrl = appServer.whereIs("/common/blank.html");
    driver.get(testUrl);

    // Use a non-existent path that will return 404
    String failedTarget = appServer.whereIs("/nonexistent/path/that/will/404.xml");
    String speculationRules =
        String.format(
            "{\"prefetch\": [{\"where\": {\"href_matches\": \"%s\"}, \"eagerness\":"
                + " \"immediate\"}]}",
            failedTarget);

    addSpeculationRulesAndLink(speculationRules, failedTarget, "Test Link", "prefetch-page");

    // Wait for events (pending and failure)
    latch.await(5, TimeUnit.SECONDS);

    // Verify we got pending and failure events
    assertThat(events).hasSizeGreaterThanOrEqualTo(2);

    PrefetchStatusUpdatedParameters firstEvent = events.get(0);
    assertThat(firstEvent.getUrl()).isEqualTo(failedTarget);
    assertThat(firstEvent.getStatus()).isEqualTo(PreloadingStatus.PENDING);
    assertThat(firstEvent.getContext()).isEqualTo(driver.getWindowHandle());

    PrefetchStatusUpdatedParameters secondEvent = events.get(1);
    assertThat(secondEvent.getUrl()).isEqualTo(failedTarget);
    assertThat(secondEvent.getStatus()).isEqualTo(PreloadingStatus.FAILURE);
    assertThat(secondEvent.getContext()).isEqualTo(driver.getWindowHandle());
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  void canUnsubscribeFromPrefetchStatusUpdated() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(2);
    List<PrefetchStatusUpdatedParameters> events = new ArrayList<>();

    long subscriptionId =
        speculationInspector.onPrefetchStatusUpdated(
            event -> {
              events.add(event);
              latch.countDown();
            });

    String testUrl = appServer.whereIs("/common/blank.html");
    driver.get(testUrl);

    String prefetchTarget = appServer.whereIs("/common/dummy.xml");
    String speculationRules =
        String.format(
            "{\"prefetch\": [{\"where\": {\"href_matches\": \"%s\"}, \"eagerness\":"
                + " \"immediate\"}]}",
            prefetchTarget);

    addSpeculationRulesAndLink(speculationRules, prefetchTarget, "Test Link", "prefetch-page");

    // Wait for events to be emitted
    latch.await(5, TimeUnit.SECONDS);
    assertThat(events).hasSizeGreaterThanOrEqualTo(2);

    // Unsubscribe
    speculationInspector.removeListener(subscriptionId);

    // Clear events and reload
    events.clear();
    driver.get(testUrl);

    String prefetchTarget2 = appServer.whereIs("/common/square.png");
    String speculationRules2 =
        String.format(
            "{\"prefetch\": [{\"where\": {\"href_matches\": \"%s\"}, \"eagerness\":"
                + " \"immediate\"}]}",
            prefetchTarget2);

    addSpeculationRulesAndLink(
        speculationRules2, prefetchTarget2, "Test Link 2", "prefetch-page-2");

    // Verify no events are emitted after unsubscribing
    assertThat(events).isEmpty();
  }
}
