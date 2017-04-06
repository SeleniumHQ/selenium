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

package org.openqa.selenium;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.WaitingConditions.newWindowIsOpened;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;
import static org.openqa.selenium.testing.TestUtilities.getFirefoxVersion;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

import java.util.Set;

@Ignore(value = CHROME, reason = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=1500")
@Ignore(PHANTOMJS)
@Ignore(SAFARI)
public class AlertsTest extends JUnit4TestBase {

  @Before
  public void setUp() throws Exception {
    driver.get(pages.alertsPage);
  }

  @JavascriptEnabled
  @NoDriverAfterTest
  @Test
  public void testShouldBeAbleToOverrideTheWindowAlertMethod() {
    ((JavascriptExecutor) driver).executeScript(
        "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
    driver.findElement(By.id("alert")).click();
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowUsersToAcceptAnAlertManually() {
    driver.findElement(By.id("alert")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowUsersToAcceptAnAlertWithNoTextManually() {
    driver.findElement(By.id("empty-alert")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @NeedsLocalEnvironment(reason = "Carefully timing based")
  @Test
  @Ignore(CHROME)
  @Ignore(MARIONETTE)
  @NotYetImplemented(HTMLUNIT)
  public void testShouldGetTextOfAlertOpenedInSetTimeout() throws Exception {
    driver.findElement(By.id("slow-alert")).click();

    // DO NOT WAIT OR SLEEP HERE.
    // This is a regression test for a bug where only the first switchTo call would throw,
    // and only if it happens before the alert actually loads.
    Alert alert = driver.switchTo().alert();
    try {
      assertEquals("Slow", alert.getText());
    } finally {
      alert.accept();
    }
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowUsersToDismissAnAlertManually() {
    wait.until(presenceOfElementLocated(By.id("alert"))).click();

    Alert alert =  wait.until(alertIsPresent());
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  @NotYetImplemented(value = HTMLUNIT,
      reason = "HtmlUnit: click()/prompt need to run in different threads.")
  public void testShouldAllowAUserToAcceptAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  @NotYetImplemented(value = HTMLUNIT,
    reason = "HtmlUnit: click()/prompt need to run in different threads.")
  public void testShouldAllowAUserToDismissAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  @NotYetImplemented(value = {HTMLUNIT},
    reason = "HtmlUnit: click()/prompt need to run in different threads")
  public void testShouldAllowAUserToSetTheValueOfAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.sendKeys("cheese");
    alert.accept();

    wait.until(textInElementLocated(By.id("text"), "cheese"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(CHROME)
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/274")
  public void testSettingTheValueOfAnAlertThrows() {
    driver.findElement(By.id("alert")).click();

    Alert alert = wait.until(alertIsPresent());
    try {
      Throwable t = catchThrowable(() -> alert.sendKeys("cheese"));
      assertThat(t, instanceOf(ElementNotInteractableException.class));
    } finally {
      alert.accept();
    }
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowTheUserToGetTheTextOfAnAlert() {
    driver.findElement(By.id("alert")).click();

    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertEquals("cheese", value);
  }

  @Test
  @NotYetImplemented(value = HTMLUNIT,
    reason = "HtmlUnit: click()/prompt need to run in different threads.")
  public void testShouldAllowTheUserToGetTheTextOfAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertEquals("Enter something", value);
  }

  @JavascriptEnabled
  @Test
  public void testAlertShouldNotAllowAdditionalCommandsIfDismissed() {
    driver.findElement(By.id("alert")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    Throwable t = catchThrowable(alert::getText);
    assertThat(t, instanceOf(NoAlertPresentException.class));
  }

  @JavascriptEnabled
  @SwitchToTopAfterTest
  @Test
  @Ignore(MARIONETTE)
  public void testShouldAllowUsersToAcceptAnAlertInAFrame() {
    driver.switchTo().frame("iframeWithAlert");

    driver.findElement(By.id("alertInFrame")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @SwitchToTopAfterTest
  @Test
  @Ignore(MARIONETTE)
  public void testShouldAllowUsersToAcceptAnAlertInANestedFrame() {
    driver.switchTo().frame("iframeWithIframe").switchTo().frame("iframeWithAlert");

    driver.findElement(By.id("alertInFrame")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  public void testSwitchingToMissingAlertThrows() throws Exception {
    Throwable t = catchThrowable(() -> driver.switchTo().alert());
    assertThat(t, instanceOf(NoAlertPresentException.class));
  }

  @JavascriptEnabled
  @Test
  public void testSwitchingToMissingAlertInAClosedWindowThrows() throws Exception {
    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-new-window")).click();
      wait.until(windowCountIs(2));
      wait.until(ableToSwitchToWindow("newwindow"));
      driver.close();

      Throwable t = catchThrowable(() -> driver.switchTo().alert());
      assertThat(t, instanceOf(NoSuchWindowException.class));

    } finally {
      driver.switchTo().window(mainWindow);
      wait.until(textInElementLocated(By.id("open-new-window"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Test
  @NotYetImplemented(value = HTMLUNIT,
    reason = "HtmlUnit: runs on the same test thread.")
  public void testPromptShouldUseDefaultValueIfNoKeysSent() {
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    wait.until(textInElementLocated(By.id("text"), "This is a default value"));
  }

  @JavascriptEnabled
  @Test
  @NotYetImplemented(value = HTMLUNIT,
    reason = "HtmlUnit: click()/prompt need to run in different threads.")
  public void testPromptShouldHaveNullValueIfDismissed() {
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.dismiss();

    wait.until(textInElementLocated(By.id("text"), "null"));
  }

  @JavascriptEnabled
  @Test
  @NotYetImplemented(value = HTMLUNIT,
    reason = "HtmlUnit: click()/prompt need to run in different threads.")
  public void testHandlesTwoAlertsFromOneInteraction() {
    wait.until(presenceOfElementLocated(By.id("double-prompt"))).click();

    Alert alert1 = wait.until(alertIsPresent());
    alert1.sendKeys("brie");
    alert1.accept();

    Alert alert2 = wait.until(alertIsPresent());
    alert2.sendKeys("cheddar");
    alert2.accept();

    wait.until(textInElementLocated(By.id("text1"), "brie"));
    wait.until(textInElementLocated(By.id("text2"), "cheddar"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(CHROME)
  public void testShouldHandleAlertOnPageLoad() {
    driver.findElement(By.id("open-page-with-onload-alert")).click();

    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertEquals("onload", value);
    wait.until(textInElementLocated(By.tagName("p"), "Page with onload event handler"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(CHROME)
  public void testShouldHandleAlertOnPageLoadUsingGet() {
    driver.get(appServer.whereIs("pageWithOnLoad.html"));

    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertEquals("onload", value);
    wait.until(textInElementLocated(By.tagName("p"), "Page with onload event handler"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(CHROME)
  @Ignore(FIREFOX)
  @Ignore(value = IE, reason = "Fails in versions 6 and 7")
  @Ignore(MARIONETTE)
  public void testShouldNotHandleAlertInAnotherWindow() {
    String mainWindow = driver.getWindowHandle();
    Set<String> currentWindowHandles = driver.getWindowHandles();
    String onloadWindow = null;
    try {
      driver.findElement(By.id("open-window-with-onload-alert")).click();
      onloadWindow = wait.until(newWindowIsOpened(currentWindowHandles));

      Throwable t = catchThrowable(() -> wait.until(alertIsPresent()));
      assertThat(t, instanceOf(TimeoutException.class));

    } finally {
      driver.switchTo().window(onloadWindow);
      wait.until(alertIsPresent()).dismiss();
      driver.close();
      driver.switchTo().window(mainWindow);
      wait.until(textInElementLocated(By.id("open-window-with-onload-alert"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = CHROME, reason = "Chrome does not trigger alerts on unload")
  @NotYetImplemented(HTMLUNIT)
  public void testShouldHandleAlertOnPageUnload() {
    assumeFalse("Firefox 27 does not trigger alerts on unload",
        isFirefox(driver) && getFirefoxVersion(driver) >= 27);
    driver.findElement(By.id("open-page-with-onunload-alert")).click();
    driver.navigate().back();

    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertEquals("onunload", value);
    wait.until(textInElementLocated(By.id("open-page-with-onunload-alert"), "open new page"));
  }

  @JavascriptEnabled
  @Test
  @NotYetImplemented(value = HTMLUNIT,
    reason = "HtmlUnit: runs on the same test thread, and .click() already changs the current window.")
  public void testShouldHandleAlertOnPageBeforeUnload() {
    driver.get(appServer.whereIs("pageWithOnBeforeUnloadMessage.html"));

    WebElement element = driver.findElement(By.id("navigate"));
    element.click();

    Alert alert = wait.until(alertIsPresent());
    alert.dismiss();
    assertThat(driver.getCurrentUrl(), containsString("pageWithOnBeforeUnloadMessage.html"));

    element.click();
    alert = wait.until(alertIsPresent());
    alert.accept();
    wait.until(titleIs("Testing Alerts"));
  }

  @NoDriverAfterTest
  @Test
  @NotYetImplemented(value = HTMLUNIT,
    reason = "HtmlUnit: runs on the same test thread.")
  public void testShouldHandleAlertOnPageBeforeUnloadAtQuit() {
    driver.get(appServer.whereIs("pageWithOnBeforeUnloadMessage.html"));

    WebElement element = driver.findElement(By.id("navigate"));
    element.click();

    wait.until(alertIsPresent());

    driver.quit();
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = CHROME, reason = "Chrome does not trigger alerts on unload")
  @NotYetImplemented(HTMLUNIT)
  public void testShouldHandleAlertOnWindowClose() {
    assumeFalse("Firefox 27 does not trigger alerts on unload",
        isFirefox(driver) && getFirefoxVersion(driver) >= 27);
    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-window-with-onclose-alert")).click();
      wait.until(windowCountIs(2));
      wait.until(ableToSwitchToWindow("onclose"));
      driver.close();

      Alert alert = wait.until(alertIsPresent());
      String value = alert.getText();
      alert.accept();

      assertEquals("onunload", value);

    } finally {
      driver.switchTo().window(mainWindow);
      wait.until(textInElementLocated(By.id("open-window-with-onclose-alert"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Test
  @Ignore(CHROME)
  @NotYetImplemented(value = MARIONETTE,
      reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1279211")
  public void testIncludesAlertTextInUnhandledAlertException() {
    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    Throwable t = catchThrowable(driver::getTitle);
    assertThat(t, instanceOf(UnhandledAlertException.class));
    assertThat(((UnhandledAlertException) t).getAlertText(), is("cheese"));
    assertThat(t.getMessage(), containsString("cheese"));
  }

  @NoDriverAfterTest
  @Test
  @Ignore(HTMLUNIT)
  public void testCanQuitWhenAnAlertIsPresent() {
    driver.get(pages.alertsPage);
    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    driver.quit();
  }

  private static ExpectedCondition<Boolean> textInElementLocated(
      final By locator, final String text) {
    return driver -> text.equals(driver.findElement(locator).getText());
  }

  private static ExpectedCondition<Boolean> windowCountIs(final int count) {
    return driver -> driver.getWindowHandles().size() == count;
  }

  private static ExpectedCondition<WebDriver> ableToSwitchToWindow(final String name) {
    return driver -> driver.switchTo().window(name);
  }

}
