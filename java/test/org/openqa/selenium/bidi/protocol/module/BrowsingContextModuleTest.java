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
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.protocol.browsingcontext.CloseParameters;
import org.openqa.selenium.bidi.protocol.browsingcontext.CreateParameters;
import org.openqa.selenium.bidi.protocol.browsingcontext.CreateResult;
import org.openqa.selenium.bidi.protocol.browsingcontext.CreateType;
import org.openqa.selenium.bidi.protocol.browsingcontext.GetTreeParameters;
import org.openqa.selenium.bidi.protocol.browsingcontext.GetTreeResult;
import org.openqa.selenium.bidi.protocol.browsingcontext.Info;
import org.openqa.selenium.bidi.protocol.browsingcontext.NavigateParameters;
import org.openqa.selenium.bidi.protocol.browsingcontext.NavigateResult;
import org.openqa.selenium.bidi.protocol.browsingcontext.NavigationInfo;
import org.openqa.selenium.bidi.protocol.browsingcontext.ReadinessState;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

class BrowsingContextModuleTest extends JupiterTestBase {

  @Test
  @NeedsFreshDriver
  void canCreateAWindow() {
    BrowsingContext browsingContext = new BrowsingContext(driver);

    CreateResult result = browsingContext.create(new CreateParameters(CreateType.WINDOW));

    assertThat(result.getContext()).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canCreateATabWithAReferenceContext() {
    BrowsingContext browsingContext = new BrowsingContext(driver);

    CreateResult result =
        browsingContext.create(
            new CreateParameters(CreateType.TAB).setReferenceContext(driver.getWindowHandle()));

    assertThat(result.getContext()).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canNavigateToAUrl() {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    String url = appServer.whereIs("/bidi/logEntryAdded.html");

    NavigateResult result =
        browsingContext.navigate(
            new NavigateParameters(driver.getWindowHandle(), url).setWait(ReadinessState.COMPLETE));

    assertThat(result.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  @NeedsFreshDriver
  void canGetTreeWithAChild() {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    String referenceContextId = driver.getWindowHandle();
    String url = appServer.whereIs("iframes.html");

    browsingContext.navigate(
        new NavigateParameters(referenceContextId, url).setWait(ReadinessState.COMPLETE));

    GetTreeResult result = browsingContext.getTree(new GetTreeParameters());

    assertThat(result.getContexts()).hasSize(1);
    Info info = result.getContexts().get(0);
    assertThat(info.getChildren()).hasSize(1);
    assertThat(info.getContext()).isEqualTo(referenceContextId);
  }

  @Test
  @NeedsFreshDriver
  void canGetTreeWithDepthZeroOmitsChildren() {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    String referenceContextId = driver.getWindowHandle();
    String url = appServer.whereIs("iframes.html");

    browsingContext.navigate(
        new NavigateParameters(referenceContextId, url).setWait(ReadinessState.COMPLETE));

    GetTreeResult result = browsingContext.getTree(new GetTreeParameters().setMaxDepth(0L));

    Info info = result.getContexts().get(0);
    // Required + nullable (R4): the key is always present, but the browser sends an explicit
    // null here since depth 0 means "don't include children."
    assertThat(info.getChildren()).isNull();
    assertThat(info.getOriginalOpener()).isNull();
    assertThat(info.getUserContext()).isEqualTo("default");
  }

  @Test
  @NeedsFreshDriver
  void canGetAllTopLevelContexts() {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    browsingContext.create(new CreateParameters(CreateType.WINDOW));

    GetTreeResult result = browsingContext.getTree(new GetTreeParameters());

    assertThat(result.getContexts()).hasSize(2);
  }

  @Test
  @NeedsFreshDriver
  void canCloseAWindow() {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    CreateResult window = browsingContext.create(new CreateParameters(CreateType.WINDOW));

    browsingContext.close(new CloseParameters(window.getContext()));

    assertThatThrownBy(
            () -> browsingContext.getTree(new GetTreeParameters().setRoot(window.getContext())))
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("not found");
  }

  @Test
  @NeedsFreshDriver
  void canListenToWindowContextCreatedEvent() throws Exception {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    CompletableFuture<Info> future = new CompletableFuture<>();
    browsingContext.subscribe(BrowsingContext.CONTEXT_CREATED, future::complete);

    String windowHandle = driver.switchTo().newWindow(WindowType.WINDOW).getWindowHandle();

    Info info = future.get(5, TimeUnit.SECONDS);
    assertThat(info.getContext()).isEqualTo(windowHandle);
    assertThat(info.getUrl()).isEqualTo("about:blank");
    assertThat(info.getChildren()).isNull();
  }

  @Test
  @NeedsFreshDriver
  void canListenToBrowsingContextDestroyedEvent() throws Exception {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    String windowHandle = driver.switchTo().newWindow(WindowType.WINDOW).getWindowHandle();

    CompletableFuture<Info> future = new CompletableFuture<>();
    browsingContext.subscribe(BrowsingContext.CONTEXT_DESTROYED, future::complete);

    driver.close();

    Info info = future.get(5, TimeUnit.SECONDS);
    assertThat(info.getContext()).isEqualTo(windowHandle);
  }

  @Test
  @NeedsFreshDriver
  void canListenToDomContentLoadedEvent() throws Exception {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    CompletableFuture<NavigationInfo> future = new CompletableFuture<>();
    browsingContext.subscribe(BrowsingContext.DOM_CONTENT_LOADED, future::complete);

    String contextId = driver.getWindowHandle();
    browsingContext.navigate(
        new NavigateParameters(contextId, appServer.whereIs("/bidi/logEntryAdded.html"))
            .setWait(ReadinessState.COMPLETE));

    NavigationInfo navigationInfo = future.get(5, TimeUnit.SECONDS);
    assertThat(navigationInfo.getContext()).isEqualTo(contextId);
    assertThat(navigationInfo.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  @NeedsFreshDriver
  void canListenToNavigationStartedEvent() throws Exception {
    BrowsingContext browsingContext = new BrowsingContext(driver);
    CompletableFuture<NavigationInfo> future = new CompletableFuture<>();
    browsingContext.subscribe(BrowsingContext.NAVIGATION_STARTED, future::complete);

    String contextId = driver.getWindowHandle();
    browsingContext.navigate(
        new NavigateParameters(contextId, appServer.whereIs("/bidi/logEntryAdded.html"))
            .setWait(ReadinessState.COMPLETE));

    NavigationInfo navigationInfo = future.get(5, TimeUnit.SECONDS);
    assertThat(navigationInfo.getContext()).isEqualTo(contextId);
    assertThat(navigationInfo.getUrl()).contains("/bidi/logEntryAdded.html");
  }
}
