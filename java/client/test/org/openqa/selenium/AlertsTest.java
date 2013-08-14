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
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.alertToBePresent;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.newWindowIsOpened;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBe;
import static org.openqa.selenium.WaitingConditions.windowToBeSwitchedToWithName;
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

import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.TestUtilities;

import org.junit.Before;
import org.junit.Test;

import java.util.Set;

@Ignore({ANDROID, HTMLUNIT, IPHONE, OPERA, PHANTOMJS, SAFARI, OPERA_MOBILE, MARIONETTE})
public class AlertsTest extends JUnit4TestBase {

  @Before
  public void setUp() throws Exception {
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

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowUsersToAcceptAnAlertWithNoTextManually() {
    driver.findElement(By.id("empty-alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
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
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowAUserToAcceptAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowAUserToDismissAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Test
  public void testShouldAllowAUserToSetTheValueOfAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.sendKeys("cheese");
    alert.accept();

    waitFor(elementTextToEqual(driver, By.id("text"), "cheese"));
  }

  @Ignore(CHROME)
  @JavascriptEnabled
  @Test
  public void testSettingTheValueOfAnAlertThrows() {
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
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

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("cheese", value);
  }

  @Test
  public void testShouldAllowTheUserToGetTheTextOfAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("Enter something", value);
  }

  @JavascriptEnabled
  @Test
  public void testAlertShouldNotAllowAdditionalCommandsIfDismissed() {
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
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

    Alert alert = waitFor(alertToBePresent(driver));
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

    Alert alert = waitFor(alertToBePresent(driver));
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
  @Ignore(value = {CHROME}, issues = {2764})
  @Test
  public void testSwitchingToMissingAlertInAClosedWindowThrows() throws Exception {
    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-new-window")).click();
      waitFor(windowHandleCountToBe(driver, 2));
      waitFor(windowToBeSwitchedToWithName(driver, "newwindow"));
      driver.close();

      try {
        alertToBePresent(driver).call();
        fail("Expected exception");
      } catch (NoSuchWindowException expected) {
        // Expected
      }

    } finally {
      driver.switchTo().window(mainWindow);
      waitFor(elementTextToEqual(driver, By.id("open-new-window"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Test
  public void testPromptShouldUseDefaultValueIfNoKeysSent() {
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    waitFor(elementTextToEqual(driver, By.id("text"), "This is a default value"));
  }

  @JavascriptEnabled
  @Ignore(ANDROID)
  @Test
  public void testPromptShouldHaveNullValueIfDismissed() {
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    waitFor(elementTextToEqual(driver, By.id("text"), "null"));
  }

  @JavascriptEnabled
  @Test
  public void testHandlesTwoAlertsFromOneInteraction() {
    driver.findElement(By.id("double-prompt")).click();

    Alert alert1 = waitFor(alertToBePresent(driver));
    alert1.sendKeys("brie");
    alert1.accept();

    Alert alert2 = waitFor(alertToBePresent(driver));
    alert2.sendKeys("cheddar");
    alert2.accept();

    waitFor(elementTextToEqual(driver, By.id("text1"), "brie"));
    waitFor(elementTextToEqual(driver, By.id("text2"), "cheddar"));
  }

  @JavascriptEnabled
  @Test
  public void testShouldHandleAlertOnPageLoad() {
    driver.findElement(By.id("open-page-with-onload-alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("onload", value);
    waitFor(elementTextToEqual(driver, By.tagName("p"), "Page with onload event handler"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(CHROME)
  public void testShouldHandleAlertOnPageLoadUsingGet() {
    driver.get(appServer.whereIs("pageWithOnLoad.html"));

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("onload", value);
    waitFor(elementTextToEqual(driver, By.tagName("p"), "Page with onload event handler"));
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
      onloadWindow = waitFor(newWindowIsOpened(driver, currentWindowHandles));

      boolean gotException = false;
      try {
        waitFor(alertToBePresent(driver));
      } catch (AssertionError expected) {
        // Expected
        gotException = true;
      }
      assertTrue(gotException);

    } finally {
      driver.switchTo().window(onloadWindow);
      waitFor(alertToBePresent(driver)).dismiss();
      driver.close();
      driver.switchTo().window(mainWindow);
      waitFor(elementTextToEqual(driver, By.id("open-window-with-onload-alert"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Ignore(value = {CHROME})
  @Test
  public void testShouldHandleAlertOnPageUnload() {
    driver.findElement(By.id("open-page-with-onunload-alert")).click();
    driver.navigate().back();

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("onunload", value);
    waitFor(elementTextToEqual(driver, By.id("open-page-with-onunload-alert"), "open new page"));
  }

  @JavascriptEnabled
  @Ignore(value = {ANDROID, CHROME}, reason = "On Android, alerts do not pop up" +
      " when a window is closed.")
  @Test
  public void testShouldHandleAlertOnWindowClose() {
    if (TestUtilities.isFirefox(driver) &&
        TestUtilities.isNativeEventsEnabled(driver) &&
        TestUtilities.getEffectivePlatform().is(Platform.LINUX)) {
      System.err.println("x_ignore_nofocus can cause a firefox crash here. Ignoring test. See issue 2987.");
      assumeTrue(false);
    }
    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-window-with-onclose-alert")).click();
      waitFor(windowHandleCountToBe(driver, 2));
      waitFor(windowToBeSwitchedToWithName(driver, "onclose"));
      driver.close();

      Alert alert = waitFor(alertToBePresent(driver));
      String value = alert.getText();
      alert.accept();

      assertEquals("onunload", value);

    } finally {
      driver.switchTo().window(mainWindow);
      waitFor(elementTextToEqual(driver, By.id("open-window-with-onclose-alert"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Ignore(value = {ANDROID, CHROME, HTMLUNIT, IPHONE, OPERA})
  @Test
  public void testIncludesAlertTextInUnhandledAlertException() {
    driver.findElement(By.id("alert")).click();
    waitFor(alertToBePresent(driver));
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
    waitFor(alertToBePresent(driver));

    driver.quit();
  }

}