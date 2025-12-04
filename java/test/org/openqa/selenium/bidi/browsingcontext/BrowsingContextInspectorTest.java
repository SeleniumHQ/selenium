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

package org.openqa.selenium.bidi.browsingcontext;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.module.BrowsingContextInspector;
import org.openqa.selenium.bidi.module.Script;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

class BrowsingContextInspectorTest extends JupiterTestBase {

  @Test
  @NeedsFreshDriver
  void canListenToWindowBrowsingContextCreatedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<BrowsingContextInfo> future = new CompletableFuture<>();

      inspector.onBrowsingContextCreated(future::complete);

      String windowHandle = driver.switchTo().newWindow(WindowType.WINDOW).getWindowHandle();

      BrowsingContextInfo browsingContextInfo = future.get(5, TimeUnit.SECONDS);

      assertThat(browsingContextInfo.getId()).isEqualTo(windowHandle);
      assertThat("about:blank").isEqualTo(browsingContextInfo.getUrl());
      assertThat(browsingContextInfo.getId()).isEqualTo(windowHandle);
      assertThat(browsingContextInfo.getChildren()).isEqualTo(null);
      assertThat(browsingContextInfo.getParentBrowsingContext()).isEqualTo(null);
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToBrowsingContextDestroyedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<BrowsingContextInfo> future = new CompletableFuture<>();

      inspector.onBrowsingContextDestroyed(future::complete);

      String windowHandle = driver.switchTo().newWindow(WindowType.WINDOW).getWindowHandle();

      driver.close();

      BrowsingContextInfo browsingContextInfo = future.get(5, TimeUnit.SECONDS);

      assertThat(browsingContextInfo.getId()).isEqualTo(windowHandle);
      assertThat("about:blank").isEqualTo(browsingContextInfo.getUrl());
      assertThat(browsingContextInfo.getChildren()).isIn(null, List.of());
      assertThat(browsingContextInfo.getParentBrowsingContext()).isEqualTo(null);
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToTabBrowsingContextCreatedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<BrowsingContextInfo> future = new CompletableFuture<>();
      inspector.onBrowsingContextCreated(future::complete);

      String windowHandle = driver.switchTo().newWindow(WindowType.TAB).getWindowHandle();

      BrowsingContextInfo browsingContextInfo = future.get(5, TimeUnit.SECONDS);

      assertThat(browsingContextInfo.getId()).isEqualTo(windowHandle);
      assertThat("about:blank").isEqualTo(browsingContextInfo.getUrl());
      assertThat(browsingContextInfo.getId()).isEqualTo(windowHandle);
      assertThat(browsingContextInfo.getChildren()).isEqualTo(null);
      assertThat(browsingContextInfo.getParentBrowsingContext()).isEqualTo(null);
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToDomContentLoadedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<NavigationInfo> future = new CompletableFuture<>();
      inspector.onDomContentLoaded(future::complete);

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      context.navigate(appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);

      NavigationInfo navigationInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(navigationInfo.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(navigationInfo.getUrl()).contains("/bidi/logEntryAdded.html");
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToBrowsingContextLoadedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<NavigationInfo> future = new CompletableFuture<>();
      inspector.onBrowsingContextLoaded(future::complete);

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      context.navigate(appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);

      NavigationInfo navigationInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(navigationInfo.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(navigationInfo.getUrl()).contains("/bidi/logEntryAdded.html");
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToNavigationStartedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<NavigationInfo> future = new CompletableFuture<>();
      inspector.onNavigationStarted(future::complete);

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      context.navigate(appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);

      NavigationInfo navigationInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(navigationInfo.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(navigationInfo.getUrl()).contains("/bidi/logEntryAdded.html");
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToFragmentNavigatedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<NavigationInfo> future = new CompletableFuture<>();

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      context.navigate(appServer.whereIs("/linked_image.html"), ReadinessState.COMPLETE);

      inspector.onFragmentNavigated(future::complete);

      context.navigate(
          appServer.whereIs("/linked_image.html#linkToAnchorOnThisPage"), ReadinessState.COMPLETE);

      NavigationInfo navigationInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(navigationInfo.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(navigationInfo.getUrl()).contains("linkToAnchorOnThisPage");
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToUserPromptOpenedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<UserPromptOpened> future = new CompletableFuture<>();

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      inspector.onUserPromptOpened(future::complete);

      driver.get(appServer.whereIs("/alerts.html"));

      driver.findElement(By.id("alert")).click();

      UserPromptOpened userPromptOpened = future.get(5, TimeUnit.SECONDS);
      assertThat(userPromptOpened.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(userPromptOpened.getType()).isEqualTo(UserPromptType.ALERT);
    }
  }

  @Test
  @NeedsFreshDriver
  // TODO: This test is flaky for comparing the browsing context id for Chrome and Edge. Fix flaky
  // test.
  void canListenToUserPromptClosedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<UserPromptClosed> future = new CompletableFuture<>();

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      inspector.onUserPromptClosed(future::complete);

      driver.get(appServer.whereIs("/alerts.html"));

      driver.findElement(By.id("prompt")).click();

      context.handleUserPrompt(true, "selenium");

      UserPromptClosed userPromptClosed = future.get(5, TimeUnit.SECONDS);
      assertThat(userPromptClosed.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(userPromptClosed.getUserText().isPresent()).isTrue();
      assertThat(userPromptClosed.getUserText().get()).isEqualTo("selenium");
      assertThat(userPromptClosed.getAccepted()).isTrue();
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToNavigationCommittedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<NavigationInfo> future = new CompletableFuture<>();

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      inspector.onNavigationCommitted(future::complete);
      context.navigate(appServer.whereIs("/bidi/logEntryAdded.html"), ReadinessState.COMPLETE);

      NavigationInfo navigationInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(navigationInfo.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(navigationInfo.getUrl()).contains("/bidi/logEntryAdded.html");
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToDownloadWillBeginEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<DownloadInfo> future = new CompletableFuture<>();

      inspector.onDownloadWillBegin(future::complete);

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      context.navigate(appServer.whereIs("/downloads/download.html"), ReadinessState.COMPLETE);

      driver.findElement(By.id("file-1")).click();

      DownloadInfo downloadInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(downloadInfo.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(downloadInfo.getUrl()).contains("/downloads/file_1.txt");
      // actual filename depends on no. of downloads tried - file_1.txt, file_1(1).txt, etc
      assertThat(downloadInfo.getSuggestedFilename()).contains("file_1");
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToDownloadEnd() throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<DownloadEnded> future = new CompletableFuture<>();

      inspector.onDownloadEnd(future::complete);

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      context.navigate(appServer.whereIs("/downloads/download.html"), ReadinessState.COMPLETE);

      driver.findElement(By.id("file-1")).click();

      DownloadEnded downloadEnded = future.get(5, TimeUnit.SECONDS);
      assertThat(downloadEnded.getDownloadParams().getBrowsingContextId())
          .isEqualTo(context.getId());
      assertThat(downloadEnded.isCompleted()).isTrue();
      assertThat(downloadEnded.getDownloadParams().getUrl()).contains("/downloads/file_1.txt");
    }
  }

  @Test
  @NeedsFreshDriver
  @NotYetImplemented(FIREFOX)
  void canListenToNavigationFailedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver)) {
      CompletableFuture<NavigationInfo> future = new CompletableFuture<>();

      inspector.onNavigationFailed(future::complete);

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      try {
        context.navigate(
            "http://invalid-domain-that-does-not-exist.test/", ReadinessState.COMPLETE);
      } catch (Exception e) {
        // Expect an exception due to navigation failure
      }

      NavigationInfo navigationInfo = future.get(5, TimeUnit.SECONDS);
      assertThat(navigationInfo.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(navigationInfo.getUrl())
          .isEqualTo("http://invalid-domain-that-does-not-exist.test/");
    }
  }

  @Test
  @NeedsFreshDriver
  void canListenToHistoryUpdatedEvent()
      throws ExecutionException, InterruptedException, TimeoutException {
    try (BrowsingContextInspector inspector = new BrowsingContextInspector(driver);
        Script script = new Script(driver)) {
      CompletableFuture<HistoryUpdated> future = new CompletableFuture<>();

      BrowsingContext context = new BrowsingContext(driver, driver.getWindowHandle());
      context.navigate(appServer.whereIs("/simpleTest.html"), ReadinessState.COMPLETE);

      inspector.onHistoryUpdated(future::complete);

      // Use history.pushState to trigger history updated event
      script.evaluateFunctionInBrowsingContext(
          context.getId(), "history.pushState({}, '', '/new-path')", false, Optional.empty());

      HistoryUpdated historyUpdated = future.get(5, TimeUnit.SECONDS);
      assertThat(historyUpdated.getBrowsingContextId()).isEqualTo(context.getId());
      assertThat(historyUpdated.getUrl()).contains("/new-path");
    }
  }
}
