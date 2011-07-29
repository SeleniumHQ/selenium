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

import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_ALERTS;

import java.lang.reflect.Method;

@Ignore(value = CHROME, reason = "Not implemented yet")
public class AlertsTest extends AbstractDriverTestCase {

  private String alertPage;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    alertPage = environment.getAppServer().whereIs("alerts.html");
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IE, IPHONE, SELENESE})
  public void testShouldBeAbleToOverrideTheWindowAlertMethod() {
    driver.get(alertPage);

    ((JavascriptExecutor) driver).executeScript(
        "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
    driver.findElement(By.id("alert")).click();
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IE, IPHONE, SELENESE})
  public void testShouldAllowUsersToAcceptAnAlertManually() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);

    driver.findElement(By.id("alert")).click();

    Alert alert = switchToAlert(driver);
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IE, IPHONE, SELENESE})
  public void testShouldAllowUsersToDismissAnAlertManually() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);

    driver.findElement(By.id("alert")).click();

    Alert alert = switchToAlert(driver);
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Ignore({ ANDROID, HTMLUNIT, IE, IPHONE, SELENESE })
  public void testShouldAllowAUserToAcceptAPrompt() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);

    driver.findElement(By.id("prompt")).click();

    Alert alert = switchToAlert(driver);
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IE, IPHONE, SELENESE})
  public void testShouldAllowAUserToDismissAPrompt() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);

    driver.findElement(By.id("prompt")).click();

    Alert alert = switchToAlert(driver);
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IE, IPHONE, SELENESE})
  public void testShouldAllowAUserToSetTheValueOfAPrompt() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);

    driver.findElement(By.id("prompt")).click();

    Alert alert = switchToAlert(driver);
    alert.sendKeys("cheese");
    alert.accept();

    String result = driver.findElement(By.id("text")).getText();
    assertEquals("cheese", result);
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IE, IPHONE, SELENESE})
  public void testShouldAllowTheUserToGetTheTextOfAnAlert() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);

    driver.findElement(By.id("alert")).click();

    Alert alert = switchToAlert(driver);
    String value = alert.getText();
    alert.accept();

    assertEquals("cheese", value);
  }

  @Ignore
  public void testAlertShouldNotAllowAdditionalCommandsIfDimissed() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);

    driver.findElement(By.id("alert")).click();

    Alert alert = switchToAlert(driver);
    alert.dismiss();

    try {
      alert.getText();
    } catch (NoAlertPresentException expected) {}
  }

  @JavascriptEnabled
  @Ignore({ANDROID, HTMLUNIT, IE, IPHONE, SELENESE})
  public void testShouldAllowUsersToAcceptAnAlertInAFrame() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);
    driver.switchTo().frame("iframeWithAlert");

    driver.findElement(By.id("alertInFrame")).click();

    Alert alert = switchToAlert(driver);
    alert.accept();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @Ignore
  public void testShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWith() {
    if (!isCapableOfHandlingAlerts(driver)) {
      return;
    }

    driver.get(alertPage);

    driver.findElement(By.id("alert")).click();
    try {
      driver.getTitle();
    } catch (UnhandledAlertException e) {
      // this is expected
    }

    // But the next call should be good.
    assertEquals("Testing Alerts", driver.getTitle());
  }

  private Alert switchToAlert(WebDriver driver) {
    WebDriver.TargetLocator locator = driver.switchTo();

    try {
      Method alertMethod = locator.getClass().getMethod("alert");
      alertMethod.setAccessible(true);
      return (Alert) alertMethod.invoke(locator);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  private boolean isCapableOfHandlingAlerts(WebDriver driver) {
    if (!(driver instanceof HasCapabilities)) {
      return false;
    }

    Capabilities capabilities = ((HasCapabilities) driver).getCapabilities();
    return capabilities.is(SUPPORTS_ALERTS);
  }
}
