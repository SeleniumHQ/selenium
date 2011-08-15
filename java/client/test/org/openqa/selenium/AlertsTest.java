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

import static org.openqa.selenium.WaitingConditions.elementTextToEqual;
import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import static org.openqa.selenium.TestWaiter.waitFor;

@Ignore({CHROME, HTMLUNIT, IPHONE, SELENESE})
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
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }
  
  @JavascriptEnabled
  public void testShouldAllowUsersToAcceptAnAlertWithNoTextManually() {
    driver.findElement(By.id("empty-alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowUsersToDismissAnAlertManually() {
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowAUserToAcceptAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowAUserToDismissAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  public void testShouldAllowAUserToSetTheValueOfAPrompt() {
    driver.findElement(By.id("prompt")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.sendKeys("cheese");
    alert.accept();

    waitFor(elementTextToEqual(driver, By.id("text"), "cheese"));
  }
  
  @JavascriptEnabled
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
  public void testShouldAllowTheUserToGetTheTextOfAnAlert() {
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    String value = alert.getText();
    alert.accept();

    assertEquals("cheese", value);
  }

  @JavascriptEnabled
  public void testAlertShouldNotAllowAdditionalCommandsIfDimissed() {
    driver.findElement(By.id("alert")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    try {
      alert.getText();
    } catch (NoAlertPresentException expected) {}
  }

  @Ignore(ANDROID)
  @JavascriptEnabled
  public void testShouldAllowUsersToAcceptAnAlertInAFrame() {
    driver.switchTo().frame("iframeWithAlert");

    driver.findElement(By.id("alertInFrame")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @Ignore({ANDROID, CHROME, FIREFOX, HTMLUNIT, IE})
  public void testShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWith() {
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
      //Expected
    }
  }
  
  @JavascriptEnabled
  public void testPromptShouldUseDefaultValueIfNoKeysSent() {
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.accept();

    waitFor(elementTextToEqual(driver, By.id("text"), "This is a default value"));
  }
  
  @JavascriptEnabled
  public void testPromptShouldHaveNullValueIfDismissed() {
    driver.findElement(By.id("prompt-with-default")).click();

    Alert alert = waitFor(alertToBePresent(driver));
    alert.dismiss();

    waitFor(elementTextToEqual(driver, By.id("text"), "null"));
  }
  
  @JavascriptEnabled
  public void handlesTwoAlertsFromOneInteraction() {
    driver.findElement(By.id("double-prompt")).click();
    
    Alert alert1 = waitFor(alertToBePresent(driver));
    alert1.sendKeys("brie");
    
    Alert alert2 = waitFor(alertToBePresent(driver));
    alert2.sendKeys("cheddar");
    
    waitFor(elementTextToEqual(driver, By.id("text1"), "brie"));
    waitFor(elementTextToEqual(driver, By.id("text2"), "cheddar"));
  }
  
  private Callable<Alert> alertToBePresent(final WebDriver driver) {
    return new Callable<Alert>() {
      public Alert call() throws Exception {
        return driver.switchTo().alert();
      }
    };
  }
}
