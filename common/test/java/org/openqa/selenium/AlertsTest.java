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

import java.lang.reflect.Method;

import static org.junit.Assert.assertEquals;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.Ignore.Driver.CHROME_NON_WINDOWS;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.environment.TestEnvironment;

public class AlertsTest extends AbstractDriverTestCase {

  private String alertPage;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    TestEnvironment environment = GlobalTestEnvironment.get();
    alertPage = environment.getAppServer().whereIs("alerts.html");
  }

  @JavascriptEnabled
  @Ignore({IE, IPHONE, SELENESE, CHROME_NON_WINDOWS})
  public void testShouldBeAbleToOverrideTheWindowAlertMethod() {
    driver.get(alertPage);

    ((JavascriptExecutor) driver).executeScript(
        "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
    driver.findElement(By.id("alert")).click();
  }

  @Ignore
  public void testShouldAllowUsersToDealWithAnAlertManually() {
    driver.get(alertPage);

    driver.findElement(By.id("alert")).click();

    Alert alert = switchToAlert(driver);
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @Ignore
  public void testShouldThrowAnExceptionIfAnAlertHasNotBeenDealtWith() {
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
}
