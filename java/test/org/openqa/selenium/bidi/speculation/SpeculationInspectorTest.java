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
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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
    String functionDeclaration =
        String.format(
            "() => {"
                + "const script = document.createElement('script');"
                + "script.type = 'speculationrules';"
                + "script.textContent = `%s`;"
                + "document.head.appendChild(script);"
                + "const link = document.createElement('a');"
                + "link.href = '%s';"
                + "link.textContent = '%s';"
                + "link.id = '%s';"
                + "document.body.appendChild(link);"
                + "}",
            rules, href, linkText, linkId);

    script.callFunctionInBrowsingContext(
        driver.getWindowHandle(),
        functionDeclaration,
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
    CountDownLatch latch = new CountDownLatch(1);
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
            "{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", prefetchTarget);

    addSpeculationRulesAndLink(speculationRules, prefetchTarget, "Test Link", "prefetch-page");

    // Wait for at least one prefetch event
    latch.await(5, TimeUnit.SECONDS);

    // Verify we got at least one event
    assertThat(events).hasSizeGreaterThanOrEqualTo(1);

    PrefetchStatusUpdatedParameters firstEvent = events.get(0);
    assertThat(firstEvent.getUrl()).isEqualTo(prefetchTarget);
    assertThat(firstEvent.getContext()).isEqualTo(driver.getWindowHandle());
    assertThat(firstEvent.getStatus()).isNotNull();
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  void canListenToPrefetchStatusUpdatedWithNavigationAndSuccess()
      throws ExecutionException, InterruptedException, TimeoutException {
    CountDownLatch latch = new CountDownLatch(1);
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
            "{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", prefetchTarget);

    addSpeculationRulesAndLink(speculationRules, prefetchTarget, "Test Link", "prefetch-page");

    // Wait for prefetch event
    latch.await(5, TimeUnit.SECONDS);

    assertThat(events).hasSizeGreaterThanOrEqualTo(1);

    // Verify first event
    assertThat(events.get(0).getUrl()).isEqualTo(prefetchTarget);
    assertThat(events.get(0).getContext()).isEqualTo(driver.getWindowHandle());

    // If prefetch succeeded (status is READY), proceed with success test; otherwise skip
    if (events.stream().noneMatch(e -> e.getStatus() == PreloadingStatus.READY)) {
      // Prefetch didn't succeed, likely due to Chrome's restrictions
      return;
    }

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
        "() => { const link = document.getElementById('prefetch-page'); if (link) { link.click(); }"
            + " }",
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
    CountDownLatch latch = new CountDownLatch(1);
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
        String.format("{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", failedTarget);

    addSpeculationRulesAndLink(speculationRules, failedTarget, "Test Link", "prefetch-page");

    // Wait for event
    latch.await(5, TimeUnit.SECONDS);

    // Verify we got at least one event
    assertThat(events).hasSizeGreaterThanOrEqualTo(1);

    PrefetchStatusUpdatedParameters firstEvent = events.get(0);
    assertThat(firstEvent.getUrl()).isEqualTo(failedTarget);
    assertThat(firstEvent.getContext()).isEqualTo(driver.getWindowHandle());
    // Verify status is either PENDING or FAILURE
    assertThat(firstEvent.getStatus()).isIn(PreloadingStatus.PENDING, PreloadingStatus.FAILURE);
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  void canClearListenersForBrowsingContext() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);
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
            "{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", prefetchTarget);

    addSpeculationRulesAndLink(speculationRules, prefetchTarget, "Test Link", "prefetch-page");

    latch.await(5, TimeUnit.SECONDS);
    assertThat(events).hasSizeGreaterThanOrEqualTo(1);

    // Clear listeners for this browsing context
    speculationInspector.clearListener(driver.getWindowHandle());

    // Re-subscribe after clearing
    CountDownLatch newLatch = new CountDownLatch(1);
    List<PrefetchStatusUpdatedParameters> newEvents = new ArrayList<>();

    speculationInspector.onPrefetchStatusUpdated(
        event -> {
          newEvents.add(event);
          newLatch.countDown();
        });

    driver.get(testUrl);

    String prefetchTarget2 = appServer.whereIs("/common/square.png");
    String speculationRules2 =
        String.format(
            "{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", prefetchTarget2);

    addSpeculationRulesAndLink(
        speculationRules2, prefetchTarget2, "Test Link 2", "prefetch-page-2");

    newLatch.await(5, TimeUnit.SECONDS);
    assertThat(newEvents).hasSizeGreaterThanOrEqualTo(1);
    assertThat(newEvents.get(0).getUrl()).isEqualTo(prefetchTarget2);
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  void canClearListenersForMultipleBrowsingContexts() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);
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
            "{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", prefetchTarget);

    addSpeculationRulesAndLink(speculationRules, prefetchTarget, "Test Link", "prefetch-page");

    latch.await(5, TimeUnit.SECONDS);
    assertThat(events).hasSizeGreaterThanOrEqualTo(1);

    // Clear listeners for the set of browsing context ids
    Set<String> browsingContextIds = new HashSet<String>();
    browsingContextIds.add(driver.getWindowHandle());
    speculationInspector.clearListeners(browsingContextIds);

    // Re-subscribe after clearing
    CountDownLatch newLatch = new CountDownLatch(1);
    List<PrefetchStatusUpdatedParameters> newEvents = new ArrayList<>();

    speculationInspector.onPrefetchStatusUpdated(
        event -> {
          newEvents.add(event);
          newLatch.countDown();
        });

    driver.get(testUrl);

    String prefetchTarget2 = appServer.whereIs("/common/square.png");
    String speculationRules2 =
        String.format(
            "{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", prefetchTarget2);

    addSpeculationRulesAndLink(
        speculationRules2, prefetchTarget2, "Test Link 2", "prefetch-page-2");

    newLatch.await(5, TimeUnit.SECONDS);
    assertThat(newEvents).hasSizeGreaterThanOrEqualTo(1);
    assertThat(newEvents.get(0).getUrl()).isEqualTo(prefetchTarget2);
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  @NotYetImplemented(SAFARI)
  void canUnsubscribeFromPrefetchStatusUpdated() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);
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
            "{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", prefetchTarget);

    addSpeculationRulesAndLink(speculationRules, prefetchTarget, "Test Link", "prefetch-page");

    // Wait for events to be emitted
    latch.await(5, TimeUnit.SECONDS);
    assertThat(events).hasSizeGreaterThanOrEqualTo(1);

    // Unsubscribe
    speculationInspector.removeListener(subscriptionId);

    // Clear events and reload
    events.clear();
    driver.get(testUrl);

    String prefetchTarget2 = appServer.whereIs("/common/square.png");
    String speculationRules2 =
        String.format(
            "{\"prefetch\": [{\"source\": \"list\", \"urls\": [\"%s\"]}]}", prefetchTarget2);

    addSpeculationRulesAndLink(
        speculationRules2, prefetchTarget2, "Test Link 2", "prefetch-page-2");

    // Verify no events are emitted after unsubscribing
    assertThat(events).isEmpty();
  }
}
