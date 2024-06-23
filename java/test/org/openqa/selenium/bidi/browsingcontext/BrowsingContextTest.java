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
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOfElementLocated;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.BiDiException;
import org.openqa.selenium.bidi.module.Browser;
import org.openqa.selenium.environment.webserver.AppServer;
import org.openqa.selenium.environment.webserver.NettyAppServer;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.print.PrintOptions;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.testing.JupiterTestBase;

class BrowsingContextTest extends JupiterTestBase {

  private AppServer server;

  @BeforeEach
  public void setUp() {
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
    BrowsingContext browsingContext =
        new BrowsingContext(
            driver,
            new CreateContextParameters(WindowType.WINDOW)
                .referenceContext(driver.getWindowHandle()));
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  void canCreateATab() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
  void canCreateATabWithAReferenceContext() {
    BrowsingContext browsingContext =
        new BrowsingContext(
            driver,
            new CreateContextParameters(WindowType.TAB).referenceContext(driver.getWindowHandle()));
    assertThat(browsingContext.getId()).isNotEmpty();
  }

  @Test
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
  void canNavigateToAUrl() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = server.whereIs("/bidi/logEntryAdded.html");
    NavigationResult info = browsingContext.navigate(url);

    assertThat(browsingContext.getId()).isNotEmpty();
    assertThat(info.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  void canNavigateToAUrlWithReadinessState() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = server.whereIs("/bidi/logEntryAdded.html");
    NavigationResult info = browsingContext.navigate(url, ReadinessState.COMPLETE);

    assertThat(browsingContext.getId()).isNotEmpty();
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

  @Test
  void canActivateABrowsingContext() {
    BrowsingContext window1 = new BrowsingContext(driver, driver.getWindowHandle());
    // 2nd window is focused
    BrowsingContext window2 = new BrowsingContext(driver, WindowType.WINDOW);

    // We did not switch the driver, so we are running the script to check focus on 1st window
    assertThat(getDocumentFocus()).isFalse();

    window1.activate();

    assertThat(getDocumentFocus()).isTrue();
  }

  // TODO: Add a test for closing the last tab once the behavior is finalized
  // Refer: https://github.com/w3c/webdriver-bidi/issues/187

  @Test
  void canReloadABrowsingContext() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = server.whereIs("/bidi/logEntryAdded.html");
    browsingContext.navigate(url, ReadinessState.COMPLETE);

    NavigationResult reloadInfo = browsingContext.reload();

    assertThat(reloadInfo.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  void canReloadWithReadinessState() {
    BrowsingContext browsingContext = new BrowsingContext(driver, WindowType.TAB);

    String url = server.whereIs("/bidi/logEntryAdded.html");
    browsingContext.navigate(url, ReadinessState.COMPLETE);

    NavigationResult reloadInfo = browsingContext.reload(ReadinessState.COMPLETE);

    assertThat(reloadInfo.getNavigationId()).isNotNull();
    assertThat(reloadInfo.getUrl()).contains("/bidi/logEntryAdded.html");
  }

  @Test
  void canHandleUserPrompt() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(alertPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    browsingContext.handleUserPrompt();

    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  void canAcceptUserPrompt() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(alertPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    browsingContext.handleUserPrompt(true);

    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  void canDismissUserPrompt() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(alertPage());

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    browsingContext.handleUserPrompt(false);

    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
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
  void canCaptureScreenshot() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(pages.simpleTestPage);

    String screenshot = browsingContext.captureScreenshot();

    assertThat(screenshot.length()).isPositive();
  }

  @Test
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

    assertThat(screenshot.length()).isPositive();
  }

  @Test
  void canCaptureScreenshotOfViewport() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(appServer.whereIs("coordinates_tests/simple_page.html"));
    WebElement element = driver.findElement(By.id("box"));

    Rectangle elementRectangle = element.getRect();

    String screenshot =
        browsingContext.captureBoxScreenshot(
            elementRectangle.getX(), elementRectangle.getY(), 5, 5);

    assertThat(screenshot.length()).isPositive();
  }

  @Test
  void canCaptureElementScreenshot() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(appServer.whereIs("formPage.html"));

    WebElement element = driver.findElement(By.id("checky"));

    String screenshot =
        browsingContext.captureElementScreenshot(((RemoteWebElement) element).getId());

    assertThat(screenshot.length()).isPositive();
  }

  @Test
  void canSetViewport() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    driver.get(appServer.whereIs("formPage.html"));

    browsingContext.setViewport(250, 300);

    List<Long> newViewportSize =
        (List<Long>)
            ((JavascriptExecutor) driver)
                .executeScript("return [window.innerWidth, window.innerHeight];");

    assertThat(newViewportSize.get(0)).isEqualTo(250);
    assertThat(newViewportSize.get(1)).isEqualTo(300);
  }

  @Test
  void canSetViewportWithDevicePixelRatio() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    driver.get(appServer.whereIs("formPage.html"));

    browsingContext.setViewport(250, 300, 5);

    List<Long> newViewportSize =
        (List<Long>)
            ((JavascriptExecutor) driver)
                .executeScript("return [window.innerWidth, window.innerHeight];");

    assertThat(newViewportSize.get(0)).isEqualTo(250);
    assertThat(newViewportSize.get(1)).isEqualTo(300);

    Long newDevicePixelRatio =
        (Long) ((JavascriptExecutor) driver).executeScript("return window.devicePixelRatio");

    assertThat(newDevicePixelRatio).isEqualTo(5);
  }

  @Test
  void canPrintPage() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());

    driver.get(appServer.whereIs("formPage.html"));
    PrintOptions printOptions = new PrintOptions();

    String printPage = browsingContext.print(printOptions);

    assertThat(printPage.length()).isPositive();
    // Comparing expected PDF is a hard problem.
    // As long as we are sending the parameters correctly it should be fine.
    // Trusting the browsers to do the right thing.
    // Hence, just checking if the response is base64 encoded string.
    assertThat(printPage).contains("JVBER");
  }

  @Test
  void canNavigateBackInTheBrowserHistory() {
    BrowsingContext browsingContext = new BrowsingContext(driver, driver.getWindowHandle());
    browsingContext.navigate(pages.formPage, ReadinessState.COMPLETE);

    wait.until(visibilityOfElementLocated(By.id("imageButton"))).submit();
    wait.until(titleIs("We Arrive Here"));

    browsingContext.back();
    wait.until(titleIs("We Leave From Here"));
  }

  @Test
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

  private boolean getDocumentFocus() {
    return (boolean) ((JavascriptExecutor) driver).executeScript("return document.hasFocus();");
  }

  @AfterEach
  public void quitDriver() {
    if (driver != null) {
      driver.quit();
    }
    safelyCall(server::stop);
  }
}
