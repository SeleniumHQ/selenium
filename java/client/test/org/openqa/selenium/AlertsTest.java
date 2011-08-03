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

import java.util.concurrent.Callable;

import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_ALERTS;

import static org.openqa.selenium.TestWaiter.waitFor;

@Ignore({ANDROID, IPHONE, SELENESE})
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
  public void testShouldAllowUsersToAcceptAnAlertManually() {
    if (!isCapableOfHandlingAlerts(driver)) {
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
    if (!isCapableOfHandlingAlerts(driver)) {
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
    if (!isCapableOfHandlingAlerts(driver)) {
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
    if (!isCapableOfHandlingAlerts(driver)) {
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
    if (!isCapableOfHandlingAlerts(driver)) {
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
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.sendKeys("cheese");
    alert.accept();

    String result = driver.findElement(By.id("text")).getText();
    assertEquals("cheese", result);
  }
  
  @JavascriptEnabled
  public void testSettingTheValueOfAnAlertThrows() {
    if (!isCapableOfHandlingAlerts(driver)) {
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
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("cheese", value);
  }

  public void testAlertShouldNotAllowAdditionalCommandsIfDimissed() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    try {
      alert.getText();
    } catch (NoAlertPresentException expected) {}
  }

  @JavascriptEnabled
  public void testShouldAllowUsersToAcceptAnAlertInAFrame() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }
    driver.switchTo().frame("iframeWithAlert");

    driver.findElement(By.id("alertInFrame")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @Ignore
  public void testShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWith() {
    if (!isCapableOfHandlingAlerts(driver)) {
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
  
  public void testSwitchingToMissingAlertThrows() throws Exception {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }
    try {
      alertToBePresent(driver).call();
      fail("Expected exception");
    } catch (NoAlertPresentException expected) {
      //Expected
    }
  }
  
  private Callable<Alert> alertToBePresent(final WebDriver driver) {
    return new Callable<Alert>() {
      public Alert call() throws Exception {
        return driver.switchTo().alert();
      }
    };
  }

  public static boolean isCapableOfHandlingAlerts(WebDriver driver) {
    if (!(driver instanceof HasCapabilities)) {
      return false;
    }

    Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();
    return capabilities.is(SUPPORTS_ALERTS);
  }
}
