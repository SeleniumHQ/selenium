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
package org.openqa.selenium.devtools;

import static org.openqa.selenium.devtools.page.Page.addCompilationCache;
import static org.openqa.selenium.devtools.page.Page.addScriptToEvaluateOnNewDocument;
import static org.openqa.selenium.devtools.page.Page.bringToFront;
import static org.openqa.selenium.devtools.page.Page.captureScreenshot;
import static org.openqa.selenium.devtools.page.Page.captureSnapshot;
import static org.openqa.selenium.devtools.page.Page.clearCompilationCache;
import static org.openqa.selenium.devtools.page.Page.close;
import static org.openqa.selenium.devtools.page.Page.crash;
import static org.openqa.selenium.devtools.page.Page.disable;
import static org.openqa.selenium.devtools.page.Page.domContentEventFired;
import static org.openqa.selenium.devtools.page.Page.enable;
import static org.openqa.selenium.devtools.page.Page.frameAttached;
import static org.openqa.selenium.devtools.page.Page.frameClearedScheduledNavigation;
import static org.openqa.selenium.devtools.page.Page.frameDetached;
import static org.openqa.selenium.devtools.page.Page.frameNavigated;
import static org.openqa.selenium.devtools.page.Page.frameRequestedNavigation;
import static org.openqa.selenium.devtools.page.Page.frameScheduledNavigation;
import static org.openqa.selenium.devtools.page.Page.frameStartedLoading;
import static org.openqa.selenium.devtools.page.Page.frameStoppedLoading;
import static org.openqa.selenium.devtools.page.Page.generateTestReport;
import static org.openqa.selenium.devtools.page.Page.getFrameTree;
import static org.openqa.selenium.devtools.page.Page.getInstallabilityErrors;
import static org.openqa.selenium.devtools.page.Page.getLayoutMetrics;
import static org.openqa.selenium.devtools.page.Page.getNavigationHistory;
import static org.openqa.selenium.devtools.page.Page.getResourceTree;
import static org.openqa.selenium.devtools.page.Page.handleJavaScriptDialog;
import static org.openqa.selenium.devtools.page.Page.javascriptDialogClosed;
import static org.openqa.selenium.devtools.page.Page.javascriptDialogOpening;
import static org.openqa.selenium.devtools.page.Page.lifecycleEvent;
import static org.openqa.selenium.devtools.page.Page.loadEventFired;
import static org.openqa.selenium.devtools.page.Page.navigate;
import static org.openqa.selenium.devtools.page.Page.navigateToHistoryEntry;
import static org.openqa.selenium.devtools.page.Page.navigatedWithinDocument;
import static org.openqa.selenium.devtools.page.Page.reload;
import static org.openqa.selenium.devtools.page.Page.resetNavigationHistory;
import static org.openqa.selenium.devtools.page.Page.screencastFrame;
import static org.openqa.selenium.devtools.page.Page.screencastFrameAck;
import static org.openqa.selenium.devtools.page.Page.screencastVisibilityChanged;
import static org.openqa.selenium.devtools.page.Page.setAdBlockingEnabled;
import static org.openqa.selenium.devtools.page.Page.setBypassCSP;
import static org.openqa.selenium.devtools.page.Page.setFontFamilies;
import static org.openqa.selenium.devtools.page.Page.setFontSizes;
import static org.openqa.selenium.devtools.page.Page.setGeolocationOverride;
import static org.openqa.selenium.devtools.page.Page.setProduceCompilationCache;
import static org.openqa.selenium.devtools.page.Page.setWebLifecycleState;
import static org.openqa.selenium.devtools.page.Page.startScreencast;
import static org.openqa.selenium.devtools.page.Page.stopLoading;
import static org.openqa.selenium.devtools.page.Page.stopScreencast;
import static org.openqa.selenium.devtools.page.Page.windowOpen;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.devtools.page.model.FontFamilies;
import org.openqa.selenium.devtools.page.model.FontSizes;
import org.openqa.selenium.devtools.page.model.FrameTree;
import org.openqa.selenium.devtools.page.model.LayoutMetric;
import org.openqa.selenium.devtools.page.model.NavigateEntry;
import org.openqa.selenium.devtools.page.model.NavigationHistory;
import org.openqa.selenium.devtools.page.model.ScriptIdentifier;

import java.util.List;
import java.util.Optional;

public class ChromeDevToolsPageTest extends DevToolsTestBase {

  @Test
  public void pageLifeCycle() {
    devTools.addListener(lifecycleEvent(), Assert::assertNotNull);
    devTools.addListener(frameAttached(), Assert::assertNotNull);
    devTools.addListener(frameDetached(), Assert::assertNotNull);
    devTools.addListener(domContentEventFired(), Assert::assertNotNull);
    devTools.addListener(frameStartedLoading(), Assert::assertNotNull);
    devTools.addListener(frameNavigated(), Assert::assertNotNull);
    devTools.addListener(frameStoppedLoading(), Assert::assertNotNull);
    devTools.addListener(loadEventFired(), Assert::assertNotNull);
    devTools.addListener(javascriptDialogOpening(), Assert::assertNotNull);
    devTools.addListener(javascriptDialogClosed(), Assert::assertNotNull);
    devTools.addListener(windowOpen(), Assert::assertNotNull);
    devTools.addListener(navigatedWithinDocument(), Assert::assertNotNull);
    devTools.addListener(frameScheduledNavigation(), Assert::assertNotNull);
    devTools.addListener(frameRequestedNavigation(), Assert::assertNotNull);
    devTools.addListener(frameClearedScheduledNavigation(), Assert::assertNotNull);

    devTools.send(enable());
    devTools.send(setGeolocationOverride(12.1, 11.0, 11.1));
    devTools.send(
        setFontFamilies(new FontFamilies("Times New Roman", "", "Times, serif", "", "", "", "")));
    devTools.send(setFontSizes(new FontSizes(1000, 300)));
    driver.get(appServer.whereIs("simpleTest.html"));
    devTools.send(bringToFront());
    devTools.send(clearCompilationCache());
    driver.navigate().to(appServer.whereIs("styledPage.html"));
    driver.findElement(By.name("searchBox")).sendKeys("test");
    ScriptIdentifier
        out =
        devTools.send(addScriptToEvaluateOnNewDocument("localhost", Optional.empty()));
    Assert.assertNotNull(out);
    LayoutMetric metric = devTools.send(getLayoutMetrics());
    Assert.assertNotNull(metric);
    driver.findElement(By.name("btn")).click();
    driver.navigate().to(appServer.whereIs("iframes.html"));

    NavigateEntry
        navigate = devTools.send(
        navigate(appServer.whereIs("rectangles.html"), Optional.empty(), Optional.empty(),
                 Optional.empty()));
    Assert.assertNotNull(navigate);

    devTools.send(navigateToHistoryEntry(1));
    devTools.send(screencastFrameAck(1));
    NavigationHistory history = devTools.send(getNavigationHistory());
    Assert.assertNotNull(history);
    devTools.send(resetNavigationHistory());
    FrameTree tree = devTools.send(getFrameTree());
    devTools.send(reload(Optional.of(false), Optional.empty()));

    devTools.send(stopLoading());
    devTools.send(reload(Optional.of(true), Optional.empty()));
    Assert.assertNotNull(tree);

    devTools.send(disable());

  }

  @Test(expected = TimeoutException.class)
  public void freezePage() {
    devTools.send(setWebLifecycleState("Active"));
  }

  @Test(expected = TimeoutException.class)
  public void pageCrash() {
    devTools.addListener(frameStartedLoading(), Assert::assertNotNull);
    devTools.addListener(frameNavigated(), Assert::assertNotNull);
    devTools.addListener(frameStoppedLoading(), Assert::assertNotNull);
    devTools.send(enable());
    driver.get(appServer.whereIs("googleChromeDevTooslPageDomain.html"));
    devTools.send(disable());

    devTools.send(crash());

  }

  @Test
  public void takeScreenShoots() {
    devTools.addListener(screencastFrame(), Assert::assertNotNull);
    devTools.addListener(screencastVisibilityChanged(), Assert::assertNotNull);
    devTools.send(enable());

    driver.get(appServer.whereIs("googleChromeDevTooslPageDomain.html"));
    devTools.send(setAdBlockingEnabled(true));
    devTools.send(
        startScreencast(Optional.empty(), Optional.empty(), Optional.empty(), Optional.empty(),
                        Optional.empty()));
    String image = devTools.send(captureSnapshot(Optional.empty()));
    Assert.assertNotNull(image);
    devTools.send(stopScreencast());
    String image2 = devTools.send(
        captureScreenshot(Optional.of("jpeg"), Optional.of(100), Optional.empty(),
                          Optional.of(false)));

    Assert.assertNotNull(image2);

    devTools.send(resetNavigationHistory());
    devTools.send(disable());
    devTools.send(close());
  }

  @Test
  public void testAlerts() {
    devTools.addListener(javascriptDialogOpening(), Assert::assertNotNull);
    devTools.addListener(javascriptDialogClosed(), Assert::assertNotNull);
    devTools.send(enable());
    devTools.send(setAdBlockingEnabled(true));
    devTools.send(setBypassCSP(true));

    driver.get(appServer.whereIs("alerts.html"));
    driver.findElement(By.id("alert")).click();
    devTools.send(handleJavaScriptDialog(true, Optional.empty()));
    devTools.send(disable());
  }

  @Test
  public void createReport() {
    devTools.send(enable());
    List<String> erorrs = devTools.send(getInstallabilityErrors());
    Assert.assertNotNull(erorrs);
    Assert.assertEquals(2, erorrs.size());
    driver.get(appServer.whereIs("googleChromeDevTooslPageDomain.html"));
    devTools.send(generateTestReport("page", Optional.empty()));
    devTools.send(disable());
  }

  @Test
  public void cacheTest() {
    devTools.addListener(frameScheduledNavigation(), Assert::assertNotNull);
    devTools.send(enable());
    driver.get(appServer.whereIs("googleChromeDevTooslPageDomain.html"));
    devTools.send(
        addCompilationCache("data", appServer.whereIs("googleChromeDevTooslPageDomain.html")));
    devTools.send(setProduceCompilationCache(true));
    driver.get(appServer.whereIs("googleChromeDevTooslPageDomain.html"));
    devTools.send(getResourceTree());
    devTools.send(disable());


  }

}
