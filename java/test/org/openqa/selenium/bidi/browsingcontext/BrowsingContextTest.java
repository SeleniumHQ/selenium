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
import static org.assertj.core.api.AssertionsForClassTypes.assertThatExceptionOfType;
import static org.openqa.selenium.testing.Safely.safelyCall;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import java.io.IOException;
import java.util.List;

class BrowsingContextTest {

  private AppServer server;
  private FirefoxDriver driver;

  @BeforeEach
  public void setUp() {
    FirefoxOptions options = new FirefoxOptions();
    options.setCapability("webSocketUrl", true);

    driver = new FirefoxDriver(options);

    server = new NettyAppServer();
    server.start();
  }

  @Test
  void canCreateABrowsingContextForGivenId() {
    String id = driver.getWindowHandle();
    BrowsingContext browsingContext = new BrowsingContext(driver, id);
    assertThat(browsingContext.getId()).isEqualTo(id);
  }

  @Test
  void canCreateAWindow() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.WINDOW);
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  void canCreateAWindowWithAReferenceContext() {
    BrowsingContext
      browsingContext =
      new BrowsingContext(driver, WindowType.WINDOW, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  void canCreateATab() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  void canCreateATabWithAReferenceContext() {
    BrowsingContext
      browsingContext =
      new BrowsingContext(driver, WindowType.TAB, driver.getWindowHandle());
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  void canNavigateToAUrl() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = server.whereIs("/bidi/logEntryAdded.html");
    NavigationResult info = browsingContext.navigate(url);

    assertThat(browsingContext.getId()).isNotEmpty();
    assertThat(info.getNavigationId()).isNull();
    assertThat(info.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  void canNavigateToAUrlWithReadinessState() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = server.whereIs("/bidi/logEntryAdded.html");
    NavigationResult info = browsingContext.navigate(url, ReadinessState.COMPLETE);

    assertThat(browsingContext.getId()).isNotEmpty();
    assertThat(info.getNavigationId()).isNull();
    assertThat(info.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  void canGetTreeWithAChild() {
    String referenceContextId = driver.getWindowHandle();
    BrowsingContext parentWindow = new BrowsingContext(driver, referenceContextId);

    String url = server.whereIs("iframes.html");

    parentWindow.navigate(url, ReadinessState.COMPLETE);

    List<BrowsingContextInfo> contextInfoList = parentWindow.getTree();

    assertThat(contextInfoList.size()).isEqualTo(1);
    BrowsingContextInfo info = contextInfoList.get(0);
    assertThat(info.getChildren().size()).isEqualTo(1);
    assertThat(info.getId()).isEqualTo(referenceContextId);
    assertThat(info.getChildren().get(0).getUrl()).contains("formPage.html");
  }

  @Test
  void canGetTreeWithDepth() {
    String referenceContextId = driver.getWindowHandle();
    BrowsingContext parentWindow = new BrowsingContext(driver, referenceContextId);

    String url = server.whereIs("iframes.html");

    parentWindow.navigate(url, ReadinessState.COMPLETE);

    List<BrowsingContextInfo> contextInfoList = parentWindow.getTree(0);

    assertThat(contextInfoList.size()).isEqualTo(1);
    BrowsingContextInfo info = contextInfoList.get(0);
    assertThat(info.getChildren()).isNull(); // since depth is 0
    assertThat(info.getId()).isEqualTo(referenceContextId);
  }

  @Test
  void canGetAllTopLevelContexts() {
    BrowsingContext window1 = new BrowsingContext(driver, driver.getWindowHandle());
    BrowsingContext window2 = new BrowsingContext(driver, WindowType.WINDOW);

    List<BrowsingContextInfo> contextInfoList = window1.getTopLevelContexts();

    assertThat(contextInfoList.size()).isEqualTo(2);
  }

  @Test
  void canCloseAWindow() {
    BrowsingContext window1 = new BrowsingContext(driver, WindowType.WINDOW);
    BrowsingContext window2 = new BrowsingContext(driver, WindowType.WINDOW);

    window2.close();

    assertThatExceptionOfType(BiDiException.class).isThrownBy(window2::getTree);
  }

  @Test
  void canCloseATab() {
    BrowsingContext tab1 = new BrowsingContext(driver, WindowType.TAB);
    BrowsingContext tab2 = new BrowsingContext(driver, WindowType.TAB);

    tab2.close();

    assertThatExceptionOfType(BiDiException.class).isThrownBy(tab2::getTree);
  }

  // TODO: Add a test for closing the last tab once the behavior is finalized
  // Refer: https://github.com/w3c/webdriver-bidi/issues/187

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
