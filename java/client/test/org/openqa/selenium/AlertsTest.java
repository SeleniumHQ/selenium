/*
Copyright 2012 Software Freedom Conservancy
Copyright 2007-2012 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium;

import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Ignore.Driver.SAFARI;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;
import static org.openqa.selenium.testing.TestUtilities.isNativeEventsEnabled;
import static org.openqa.selenium.testing.TestUtilities.getEffectivePlatform;
import static org.openqa.selenium.testing.TestUtilities.getFirefoxVersion;

import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

import org.junit.Before;
import org.junit.Test;

import java.util.Set;

@Ignore({ANDROID, HTMLUNIT, IPHONE, OPERA, PHANTOMJS, SAFARI, OPERA_MOBILE, MARIONETTE})
public class AlertsTest extends JUnit4TestBase {

  private WebDriverWait wait;

  @Before
  public void setUp() throws Exception {
    wait = new WebDriverWait(driver, 5);
    driver.get(pages.alertsPage);
  }

  @JavascriptEnabled
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

  @Ignore(CHROME)
  @JavascriptEnabled
  @NeedsLocalEnvironment(reason = "Carefully timing based")
  @Test
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
  public void testShouldAllowAUserToAcceptAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowAUserToDismissAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowAUserToSetTheValueOfAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.sendKeys("cheese");
    alert.accept();

    wait.until(textInElementLocated(By.id("text"), "cheese"));
  }

  @Ignore(CHROME)
  @JavascriptEnabled
  @Test
  public void testSettingTheValueOfAnAlertThrows() {
    driver.findElement(By.id("alert")).click();

    Alert alert = wait.until(alertIsPresent());
    try {
      alert.sendKeys("cheese");
      fail("Expected exception");
    } catch (ElementNotVisibleException expected) {
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
    alert.dismiss();

    try {
      alert.getText();
    } catch (NoAlertPresentException expected) {
      return;
    }
    fail("Expected NoAlertPresentException");
  }

  @Ignore(ANDROID)
  @JavascriptEnabled
  @Test
  public void testShouldAllowUsersToAcceptAnAlertInAFrame() {
    driver.switchTo().frame("iframeWithAlert");

    driver.findElement(By.id("alertInFrame")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @Ignore(ANDROID)
  @JavascriptEnabled
  @Test
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
    try {
      driver.switchTo().alert();
      fail("Expected exception");
    } catch (NoAlertPresentException expected) {
      // Expected
    }
  }

  @JavascriptEnabled
  @Test
  public void testSwitchingToMissingAlertInAClosedWindowThrows() throws Exception {
    assumeFalse("This test does not fail on itself, but it causes the subsequent tests to fail",
                isFirefox(driver) &&
                isNativeEventsEnabled(driver) &&
                getEffectivePlatform().is(Platform.LINUX));

    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-new-window")).click();
      wait.until(windowCountIs(2));
      wait.until(ableToSwitchToWindow("newwindow"));
      driver.close();

      try {
        driver.switchTo().alert();
        fail("Expected exception");
      } catch (NoSuchWindowException expected) {
        // Expected
      }

    } finally {
      driver.switchTo().window(mainWindow);
      wait.until(textInElementLocated(By.id("open-new-window"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Test
  public void testPromptShouldUseDefaultValueIfNoKeysSent() {
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    wait.until(textInElementLocated(By.id("text"), "This is a default value"));
  }

  @JavascriptEnabled
  @Ignore(ANDROID)
  @Test
  public void testPromptShouldHaveNullValueIfDismissed() {
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = wait.until(alertIsPresent());
    alert.dismiss();

    wait.until(textInElementLocated(By.id("text"), "null"));
  }

  @JavascriptEnabled
  @Test
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
  @Ignore(value = {CHROME, FIREFOX, IE}, reason = "IE: fails in versions 6 and 7")
  @Test
  public void testShouldNotHandleAlertInAnotherWindow() {
    String mainWindow = driver.getWindowHandle();
    Set<String> currentWindowHandles = driver.getWindowHandles();
    String onloadWindow = null;
    try {
      driver.findElement(By.id("open-window-with-onload-alert")).click();
      onloadWindow = wait.until(newWindowIsOpened(currentWindowHandles));

      boolean gotException = false;
      try {
        wait.until(alertIsPresent());
      } catch (AssertionError expected) {
        // Expected
        gotException = true;
      }
      assertTrue(gotException);

    } finally {
      driver.switchTo().window(onloadWindow);
      wait.until(alertIsPresent()).dismiss();
      driver.close();
      driver.switchTo().window(mainWindow);
      wait.until(textInElementLocated(By.id("open-window-with-onload-alert"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME})
  @Test
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
  public void testShouldHandleAlertOnPageBeforeUnloadAtQuit() {
    driver.get(appServer.whereIs("pageWithOnBeforeUnloadMessage.html"));

    WebElement element = driver.findElement(By.id("navigate"));
    element.click();

    wait.until(alertIsPresent());

    driver.quit();
  }

  @JavascriptEnabled
  @Ignore(value = {ANDROID, CHROME}, reason = "On Android, alerts do not pop up" +
      " when a window is closed.")
  @Test
  public void testShouldHandleAlertOnWindowClose() {
    if (isFirefox(driver) &&
        isNativeEventsEnabled(driver) &&
        getEffectivePlatform().is(Platform.LINUX)) {
      System.err.println("x_ignore_nofocus can cause a firefox crash here. Ignoring test. See issue 2987.");
      assumeTrue(false);
    }
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
  @Ignore(value = {ANDROID, CHROME, HTMLUNIT, IPHONE, OPERA})
  @Test
  public void testIncludesAlertTextInUnhandledAlertException() {
    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());
    try {
      driver.getTitle();
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException e) {
      assertEquals("cheese", e.getAlertText());
      assertThat(e.getMessage(), containsString("cheese"));
    }
  }

  @NoDriverAfterTest
  @Test
  public void testCanQuitWhenAnAlertIsPresent() {
    driver.get(pages.alertsPage);
    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    driver.quit();
  }

  private static ExpectedCondition<Boolean> textInElementLocated(
      final By locator, final String text) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        return text.equals(driver.findElement(locator).getText());
      }
    };
  }

  private static ExpectedCondition<Boolean> windowCountIs(final int count) {
    return new ExpectedCondition<Boolean>() {
      @Override
      public Boolean apply(WebDriver driver) {
        return driver.getWindowHandles().size() == count;
      }
    };
  }

  private static ExpectedCondition<WebDriver> ableToSwitchToWindow(final String name) {
    return new ExpectedCondition<WebDriver>() {
      @Override
      public WebDriver apply(WebDriver driver) {
        return driver.switchTo().window(name);
      }
    };
  }

  private static ExpectedCondition<String> newWindowIsOpened(final Set<String> originalHandles) {
    return new ExpectedCondition<String>() {
      @Override
      public String apply(WebDriver driver) {
        Set<String> currentWindowHandles = driver.getWindowHandles();
        currentWindowHandles.removeAll(originalHandles);
        return currentWindowHandles.isEmpty() ? null : currentWindowHandles.iterator().next();
      }
    };
  }
}
