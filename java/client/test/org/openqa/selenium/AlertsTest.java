/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import static org.openqa.selenium.Ignore.Driver.ALL;
import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.WaitingConditions.windowHandleCountToBe;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

@Ignore({CHROME, HTMLUNIT, IPHONE, OPERA, SELENESE})
public class AlertsTest extends AbstractDriverTestCase {

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    driver.get(pages.alertsPage);
  }

  @JavascriptEnabled
  public void testShouldBeAbleToOverrideTheWindowAlertMethod() {
    ((JavascriptExecutor) driver).executeScript(
        "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
    driver.findElement(By.id("alert")).click();
  }

  @JavascriptEnabled
  @Ignore(ALL)
  public void testShouldDismissAlertOnException() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("alert")).click();

    try {
      driver.getTitle();
      fail("Expected exception");
    } catch (NoAlertPresentException expected) {
    }
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowUsersToAcceptAnAlertManually() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowUsersToAcceptAnAlertWithNoTextManually() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("empty-alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowUsersToDismissAnAlertManually() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowAUserToAcceptAPrompt() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowAUserToDismissAPrompt() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowAUserToSetTheValueOfAPrompt() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.sendKeys("cheese");
    alert.accept();

    waitFor(elementTextToEqual(driver, By.id("text"), "cheese"));
  }

  @JavascriptEnabled
  public void testSettingTheValueOfAnAlertThrows() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
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
  public void testShouldAllowTheUserToGetTheTextOfAnAlert() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("cheese", value);
  }

  @JavascriptEnabled
  public void testAlertShouldNotAllowAdditionalCommandsIfDimissed() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    try {
      alert.getText();
    } catch (NoAlertPresentException expected) {
    }
  }

  @Ignore(ANDROID)
  @JavascriptEnabled
  public void testShouldAllowUsersToAcceptAnAlertInAFrame() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.switchTo().frame("iframeWithAlert");

    driver.findElement(By.id("alertInFrame")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @Ignore({ANDROID, CHROME, FIREFOX, HTMLUNIT, IE})
  public void testShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWith() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("alert")).click();
    try {
      driver.getTitle();
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException e) {
      // this is expected
    } finally {
      driver.switchTo().alert().dismiss();
    }

    // But the next call should be good.
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testSwitchingToMissingAlertThrows() throws Exception {
    try {
      alertToBePresent(driver).call();
      fail("Expected exception");
    } catch (NoAlertPresentException expected) {
      // Expected
    }
  }

  @JavascriptEnabled
  @Ignore(value = {ALL}, issues = {2764, 2834})
  public void testSwitchingToMissingAlertInAClosedWindowThrows() throws Exception {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-new-window")).click();
      waitFor(windowHandleCountToBe(driver, 2));
      driver.switchTo().window("newwindow").close();

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
  public void testPromptShouldUseDefaultValueIfNoKeysSent() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    waitFor(elementTextToEqual(driver, By.id("text"), "This is a default value"));
  }

  @JavascriptEnabled
  @Ignore(ANDROID)
  public void testPromptShouldHaveNullValueIfDismissed() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    waitFor(elementTextToEqual(driver, By.id("text"), "null"));
  }

  @JavascriptEnabled
  public void testHandlesTwoAlertsFromOneInteraction() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
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
  public void testShouldHandleAlertOnPageLoad() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("open-page-with-onload-alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("onload", value);
    waitFor(elementTextToEqual(driver, By.tagName("p"), "Page with onload event handler"));
  }

  @JavascriptEnabled
  @Ignore(value = {FIREFOX, ANDROID, IE}, reason = "FF waits too long, may be hangs out." +
      "Android currently does not store the source of the alert. IE8: Not confirmed working.")
  public void testShouldNotHandleAlertInAnotherWindow() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-window-with-onload-alert")).click();
  
      try {
        waitFor(alertToBePresent(driver), 5, TimeUnit.SECONDS);
        fail("Expected exception");
      } catch (NoAlertPresentException expected) {
        // Expected
      }

    } finally {
      driver.switchTo().window("onload");
      waitFor(alertToBePresent(driver)).dismiss();
      driver.close();
      driver.switchTo().window(mainWindow);
      waitFor(elementTextToEqual(driver, By.id("open-window-with-onload-alert"), "open new window"));
    }
  }

  @JavascriptEnabled
  @Ignore(value = {IE}, reason = "IE crashes")
  public void testShouldHandleAlertOnPageUnload() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    driver.findElement(By.id("open-page-with-onunload-alert")).click();
    driver.navigate().back();

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("onunload", value);
    waitFor(elementTextToEqual(driver, By.id("open-page-with-onunload-alert"), "open new page"));
  }

  @JavascriptEnabled
  @Ignore(value = {IE}, reason = "IE crashes")
  public void testShouldHandleAlertOnWindowClose() {
    if (cannotTestAlerts()) {
      System.out.println("Ignoring IE alerts tests on Sauce");
      return;
    }
    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-window-with-onclose-alert")).click();
      waitFor(windowHandleCountToBe(driver, 2));
      driver.switchTo().window("onclose").close();

      Alert alert = waitFor(alertToBePresent(driver));
      String value = alert.getText();
      alert.accept();
  
      assertEquals("onunload", value);

    } finally {
      driver.switchTo().window(mainWindow);
      waitFor(elementTextToEqual(driver, By.id("open-window-with-onclose-alert"), "open new window"));
    }
  }

  private boolean cannotTestAlerts() {
    return
        SauceDriver.shouldUseSauce() &&
        TestUtilities.getEffectivePlatform().equals(Platform.XP) &&
        TestUtilities.isInternetExplorer(driver);
  }

  private Callable<Alert> alertToBePresent(final WebDriver driver) {
    return new Callable<Alert>() {
      public Alert call() throws Exception {
        return driver.switchTo().alert();
      }
    };
  }

}
