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

import static java.nio.charset.StandardCharsets.US_ASCII;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.data.Offset.offset;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import javax.imageio.ImageIO;
import org.assertj.core.data.Offset;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.print.PrintOptions;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;

class BrowsingContextTest extends JupiterTestBase {

  @Test
  @NeedsFreshDriver
  void canCreateABrowsingContextForGivenId() {
    String id = driver.getWindowHandle();
    BrowsingContext browsingContext = new BrowsingContext(driver, id);
    assertThat(browsingContext.getId()).isEqualTo(id);
  }

  @Test
  @NeedsFreshDriver
  void canCreateAWindow() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.WINDOW);
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canCreateAWindowWithAReferenceContext() {
    BrowsingContext browsingContext =
        new BrowsingContext(
            driver,
            new CreateContextParameters(WindowType.WINDOW)
                .referenceContext(driver.getWindowHandle()));
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canCreateATab() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canCreateATabWithAReferenceContext() {
    BrowsingContext browsingContext =
        new BrowsingContext(
            driver,
            new CreateContextParameters(WindowType.TAB).referenceContext(driver.getWindowHandle()));
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canCreateAContextWithAllParameters() {
    Browser browser = new Browser(driver);
    String userContextId = browser.createUserContext();

    CreateContextParameters parameters = new CreateContextParameters(WindowType.WINDOW);
    parameters
        .referenceContext(driver.getWindowHandle())
        .userContext(userContextId)
        .background(true);

    BrowsingContext browsingContext = new BrowsingContext(driver, parameters);
    assertThat(browsingContext.getId()).isNotEmpty();
    assertThat(browsingContext.getId()).isNotEqualTo(driver.getWindowHandle());
  }

  @Test
  @NeedsFreshDriver
  void canNavigateToAUrl() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = appServer.whereIs("/bidi/logEntryAdded.html");
    NavigationResult info = browsingContext.navigate(url);

    assertThat(browsingContext.getId()).isNotEmpty();
    assertThat(info.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  @NeedsFreshDriver
  void canNavigateToAUrlWithReadinessState() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = appServer.whereIs("/bidi/logEntryAdded.html");
    NavigationResult info = browsingContext.navigate(url, ReadinessState.COMPLETE);

    assertThat(browsingContext.getId()).isNotEmpty();
    assertThat(info.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  @NeedsFreshDriver
  void canGetTreeWithAChild() {
    String referenceContextId = driver.getWindowHandle();
    BrowsingContext parentWindow = new BrowsingContext(driver, referenceContextId);

    String url = appServer.whereIs("iframes.html");

    parentWindow.navigate(url, ReadinessState.COMPLETE);

    List<BrowsingContextInfo> contextInfoList = parentWindow.getTree();

    assertThat(contextInfoList).hasSize(1);
    BrowsingContextInfo info = contextInfoList.get(0);
    assertThat(info.getChildren()).hasSize(1);
    assertThat(info.getId()).isEqualTo(referenceContextId);
    assertThat(info.getChildren().get(0).getUrl()).contains("formPage.html");
  }

  @Test
  @NeedsFreshDriver
  void canGetTreeWithDepth() {
    String referenceContextId = driver.getWindowHandle();
    BrowsingContext parentWindow = new BrowsingContext(driver, referenceContextId);

    String url = appServer.whereIs("iframes.html");

    parentWindow.navigate(url, ReadinessState.COMPLETE);

    List<BrowsingContextInfo> contextInfoList = parentWindow.getTree(0);

    assertThat(contextInfoList).hasSize(1);
    BrowsingContextInfo info = contextInfoList.get(0);
    assertThat(info.getChildren()).isNull(); // since depth is 0
    assertThat(info.getId()).isEqualTo(referenceContextId);
    assertThat(info.getOriginalOpener()).isNull();
    assertThat(info.getClientWindow()).isNotNull();
    assertThat(info.getUserContext()).isEqualTo("default");
  }

  @Test
  @NeedsFreshDriver
  void canGetTreeWithRootAndDepth() {
    String referenceContextId = driver.getWindowHandle();
    BrowsingContext parentWindow = new BrowsingContext(driver, referenceContextId);

    String url = appServer.whereIs("iframes.html");

    parentWindow.navigate(url, ReadinessState.COMPLETE);

    List<BrowsingContextInfo> contextInfoList = parentWindow.getTree(referenceContextId, 1);

    assertThat(contextInfoList).hasSize(1);
    BrowsingContextInfo info = contextInfoList.get(0);
    assertThat(info.getChildren()).isNotNull(); // since depth is 1
    assertThat(info.getId()).isEqualTo(referenceContextId);
    assertThat(info.getOriginalOpener()).isNull();
    assertThat(info.getClientWindow()).isNotNull();
    assertThat(info.getUserContext()).isEqualTo("default");
  }

  @Test
  @NeedsFreshDriver
  void canGetTreeWithRoot() {
    String referenceContextId = driver.getWindowHandle();
    BrowsingContext parentWindow = new BrowsingContext(driver, referenceContextId);

    String url = appServer.whereIs("iframes.html");

    parentWindow.navigate(url, ReadinessState.COMPLETE);

    BrowsingContext tab = new BrowsingContext(driver, WindowType.TAB);

    List<BrowsingContextInfo> contextInfoList = parentWindow.getTree(tab.getId());

    assertThat(contextInfoList).hasSize(1);
    BrowsingContextInfo info = contextInfoList.get(0);
    assertThat(info.getId()).isEqualTo(tab.getId());
    assertThat(info.getOriginalOpener()).isNull();
    assertThat(info.getClientWindow()).isNotNull();
    assertThat(info.getUserContext()).isEqualTo("default");
  }

  @Test
  @NeedsFreshDriver
  void canGetAllTopLevelContexts() {
    BrowsingContext window1 = new BrowsingContext(driver, driver.getWindowHandle());
    BrowsingContext window2 = new BrowsingContext(driver, WindowType.WINDOW);

    List<BrowsingContextInfo> contextInfoList = window1.getTopLevelContexts();

    assertThat(contextInfoList).hasSize(2);
  }

  @Test
  @NeedsFreshDriver
  void canCloseAWindow() {
    BrowsingContext window1 = new BrowsingContext(driver, WindowType.WINDOW);
    BrowsingContext window2 = new BrowsingContext(driver, WindowType.WINDOW);

    window2.close();

    assertThatThrownBy(window2::getTree)
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("not found");
  }

  @Test
  @NeedsFreshDriver
  void canCloseATab() {
    BrowsingContext tab1 = new BrowsingContext(driver, WindowType.TAB);
    BrowsingContext tab2 = new BrowsingContext(driver, WindowType.TAB);

    tab2.close();

    assertThatThrownBy(tab2::getTree)
        .isInstanceOf(BiDiException.class)
        .hasMessageContaining("not found");
  }

  @Test
  @NeedsFreshDriver
  void canActivateABrowsingContext() {
    BrowsingContext window1 = new BrowsingContext(driver, driver.getWindowHandle());
    // 2nd window is focused
    BrowsingContext window2 = new BrowsingContext(driver, WindowType.WINDOW);

    // We did not switch the driver, so we are running the script to check focus on 1st window
    assertThat(isDocumentFocused()).isFalse();

    window1.activate();

    assertThat(isDocumentFocused()).isTrue();
  }

  // TODO: Add a test for closing the last tab once the behavior is finalized
  // Refer: https://github.com/w3c/webdriver-bidi/issues/187

  @Test
  @NeedsFreshDriver
  void canReloadABrowsingContext() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = appServer.whereIs("/bidi/logEntryAdded.html");
    browsingContext.navigate(url, ReadinessState.COMPLETE);

    NavigationResult reloadInfo = browsingContext.reload();

    assertThat(reloadInfo.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  @NeedsFreshDriver
  void canReloadWithReadinessState() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = appServer.whereIs("/bidi/logEntryAdded.html");
    browsingContext.navigate(url, ReadinessState.COMPLETE);

    NavigationResult reloadInfo = browsingContext.reload(ReadinessState.COMPLETE);

    assertThat(reloadInfo.getNavigationId()).isNotNull();
    assertThat(reloadInfo.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  @NeedsFreshDriver
  void canHandleUserPrompt() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(alertPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    browsingContext.handleUserPrompt();

    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  @NeedsFreshDriver
  void canAcceptUserPrompt() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(alertPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    browsingContext.handleUserPrompt(true);

    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  @NeedsFreshDriver
  void canDismissUserPrompt() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(alertPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    browsingContext.handleUserPrompt(false);

    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  @NeedsFreshDriver
  void canPassUserTextToUserPrompt() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(promptPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    String userText = "Selenium automates browsers";

    browsingContext.handleUserPrompt(userText);

    assertThat(driver.getPageSource()).contains(userText);
  }

  @Test
  @NeedsFreshDriver
  void canAcceptUserPromptWithUserText() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(promptPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    String userText = "Selenium automates browsers";

    browsingContext.handleUserPrompt(true, userText);

    assertThat(driver.getPageSource()).contains(userText);
  }

  @Test
  @NeedsFreshDriver
  void canDismissUserPromptWithUserText() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(promptPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    String userText = "Selenium automates browsers";

    browsingContext.handleUserPrompt(false, userText);

    assertThat(driver.getPageSource()).doesNotContain(userText);
  }

  // The resulting screenshot should be checked for expected image.
  // Since, sending wrong command parameters (for viewport or element screenshot), defaults to
  // capture screenshot functionality.
  // So it can lead to a false positive if underlying implementation is not doing the right thing.
  // However, comparing images is a hard problem. Especially when they are different sizes.
  // TODO: A potential solution can be replicating classic WebDriver screenshot tests.
  // Meanwhile, trusting the browsers to do the right thing.
  @Test
  @NeedsFreshDriver
  void canCaptureScreenshot() throws IOException {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(pages.simpleTestPage);

    String screenshot = browsingContext.captureScreenshot();

    verifyScreenshot(screenshot);
  }

  private void verifyScreenshot(String screenshotBase64) throws IOException {
    byte[] screenshotBytes = Base64.getDecoder().decode(screenshotBase64);
    BufferedImage screenshot = ImageIO.read(new ByteArrayInputStream(screenshotBytes));
    Dimension expectedSize = getViewportSize();

    assertLength(screenshot.getWidth(), expectedSize.getWidth());
    assertLength(screenshot.getHeight(), expectedSize.getHeight());
  }

  private void assertLength(int length, int expected) {
    int expectedLength = (int) (expected * getDevicePixelRatio());
    Offset<Integer> tolerance = offset(20);
    assertThat(length).isCloseTo(expectedLength, tolerance);
  }

  @Test
  @NeedsFreshDriver
  void canCaptureScreenshotWithAllParameters() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(appServer.whereIs("coordinates_tests/simple_page.html"));
    WebElement element = driver.findElement(By.id("box"));

    Rectangle elementRectangle = element.getRect();

    ClipRectangle clipRectangle =
        new BoxClipRectangle(elementRectangle.getX(), elementRectangle.getY(), 5, 5);

    CaptureScreenshotParameters parameters = new CaptureScreenshotParameters();
    // TODO: Add test to test the type and quality
    // parameters.imageFormat("image/png", 0.5);

    String screenshot =
        browsingContext.captureScreenshot(
            parameters
                .origin(CaptureScreenshotParameters.Origin.DOCUMENT)
                .clipRectangle(clipRectangle));

    assertThat(screenshot).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canCaptureScreenshotOfViewport() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(appServer.whereIs("coordinates_tests/simple_page.html"));
    WebElement element = driver.findElement(By.id("box"));

    Rectangle elementRectangle = element.getRect();

    String screenshot =
        browsingContext.captureBoxScreenshot(
            elementRectangle.getX(), elementRectangle.getY(), 5, 5);

    assertThat(screenshot).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canCaptureElementScreenshot() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(appServer.whereIs("formPage.html"));

    WebElement element = driver.findElement(By.id("checky"));

    String screenshot =
        browsingContext.captureElementScreenshot(((RemoteWebElement) element).getId());

    assertThat(screenshot).isNotEmpty();
  }

  @Test
  @NeedsFreshDriver
  void canSetViewport() {
    Dimension initialViewportSize = getViewportSize();

    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    driver.get(appServer.whereIs("formPage.html"));

    browsingContext.setViewport(250, 300);
    assertThat(getViewportSize()).isEqualTo(new Dimension(250, 300));

    browsingContext.setViewport(null, null);
    assertThat(getViewportSize()).isEqualTo(initialViewportSize);
  }

  @Test
  @NeedsFreshDriver
  void canSetViewportWithDevicePixelRatio() {
    Dimension initialViewportSize = getViewportSize();
    double initialPixelRation = getDevicePixelRatio();

    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    driver.get(appServer.whereIs("formPage.html"));

    browsingContext.setViewport(250, 300, 5.5);

    assertThat(getViewportSize()).isEqualTo(new Dimension(250, 300));
    assertThat(getDevicePixelRatio()).isEqualTo(5.5);

    browsingContext.setViewport(null, null, null);
    assertThat(getViewportSize()).isEqualTo(initialViewportSize);
    assertThat(getDevicePixelRatio()).isEqualTo(initialPixelRation);
  }

  @Test
  @NeedsFreshDriver
  void canPrintPage() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    driver.get(appServer.whereIs("formPage.html"));

    String printPage = browsingContext.print(new PrintOptions());

    assertThat(printPage).isNotEmpty();
    // Comparing expected PDF is a hard problem.
    // As long as we are sending the parameters correctly it should be fine.
    // Trusting the browsers to do the right thing.
    // Hence, just checking if the response is base64 encoded string looking like PDF.
    assertThat(printPage).contains("JVBER");
    byte[] pdf = Base64.getDecoder().decode(printPage);
    assertThat(pdf)
        .containsSequence("%PDF-".getBytes(US_ASCII))
        .containsSequence("%%EOF".getBytes(US_ASCII));
  }

  @Test
  @NeedsFreshDriver
  void canNavigateBackInTheBrowserHistory() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    browsingContext.navigate(pages.formPage, ReadinessState.COMPLETE);

    wait.until(visibilityOfElementLocated(By.id("imageButton"))).submit();
    wait.until(titleIs("We Arrive Here"));

    browsingContext.back();
    wait.until(titleIs("We Leave From Here"));
  }

  @Test
  @NeedsFreshDriver
  void canNavigateForwardInTheBrowserHistory() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    browsingContext.navigate(pages.formPage, ReadinessState.COMPLETE);

    wait.until(visibilityOfElementLocated(By.id("imageButton"))).submit();
    wait.until(titleIs("We Arrive Here"));

    browsingContext.back();
    wait.until(titleIs("We Leave From Here"));

    browsingContext.forward();
    wait.until(titleIs("We Arrive Here"));
  }

  private String alertPage() {
    return appServer.create(
        new Page()
            .withTitle("Testing Alerts")
            .withBody("<a href='#' id='alert' onclick='alert(\"works\");'>click me</a>"));
  }

  private String promptPage() {
    return appServer.create(
        new Page()
            .withTitle("Testing Alerts")
            .withScripts(
                "function myFunction() {",
                "  let message = prompt('Please enter a message');",
                "  if (message != null) {",
                "    document.getElementById('result').innerHTML =",
                "    'Message: ' + message ;",
                "  }",
                "}")
            .withBody(
                "<button id='alert' onclick='myFunction()'>Try it</button>",
                "<p id=\"result\"></p>"));
  }

  private boolean isDocumentFocused() {
    return executeJavaScript("return document.hasFocus();");
  }

  private Dimension getViewportSize() {
    List<Number> dimensions = executeJavaScript("return [window.innerWidth, window.innerHeight];");
    return new Dimension(dimensions.get(0).intValue(), dimensions.get(1).intValue());
  }

  private double getDevicePixelRatio() {
    return ((Number) executeJavaScript("return window.devicePixelRatio")).doubleValue();
  }
}
