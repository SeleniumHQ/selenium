/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.safari;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.UnhandledAlertException;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;

import java.util.concurrent.TimeUnit;

public class AlertTests extends SafariTestBase {

  @AfterClass
  public static void quitDriver() {
    SafariTestBase.quitDriver();
  }

  @Before
  public void setUp() throws Exception {
    driver.get(pages.alertsPage);
  }

  @Test
  public void testShouldBeAbleToOverrideTheWindowAlertMethod() {
    ((JavascriptExecutor) driver).executeScript(
        "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
    driver.findElement(By.id("alert")).click();
  }

  @Test
  public void testHandlesWhenNoAlertsArePresent() {
    try {
      driver.switchTo().alert();
    } catch (NoAlertPresentException expected) {
    }
  }

  @Test
  public void testCatchesAlertsOpenedWithinAnIFrame() {
    driver.switchTo().frame("iframeWithAlert");

    try {
      driver.findElement(By.id("alertInFrame")).click();
    } catch (UnhandledAlertException expected) {
    }

    // If we can perform any action, we're good to go
    assertEquals("Testing Alerts", driver.getTitle());
  }

  @Test
  public void throwsIfScriptTriggersAlert() {
    driver.get(pages.simpleTestPage);
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    try {
      ((JavascriptExecutor)driver).executeAsyncScript("setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException expected) {
      // Expected exception
    }
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  public void throwsIfAlertHappensDuringScript() {
    driver.get(pages.slowLoadingAlertPage);
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    try {
      ((JavascriptExecutor)driver).executeAsyncScript("setTimeout(arguments[0], 1000);");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException expected) {
      //Expected exception
    }
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  public void throwsIfScriptTriggersAlertWhichTimesOut() {
    driver.get(pages.simpleTestPage);
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    try {
      ((JavascriptExecutor)driver).executeAsyncScript("setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException expected) {
      // Expected exception
      expected.printStackTrace();
    }
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  public void throwsIfAlertHappensDuringScriptWhichTimesOut() {
    driver.get(pages.slowLoadingAlertPage);
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    try {
      ((JavascriptExecutor)driver).executeAsyncScript("");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException expected) {
      //Expected exception
    }
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  public void testIncludesAlertInUnhandledAlertException() {
    try {
      driver.findElement(By.id("alert")).click();
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException e) {
      Alert alert = e.getAlert();
      assertNotNull(alert);
      assertEquals("cheese", alert.getText());
    }
  }

  @Test
  public void shouldCatchAlertsOpenedBetweenCommandsAndReportThemOnTheNextCommand()
      throws InterruptedException {
    driver.get(pages.alertsPage);
    ((JavascriptExecutor)driver).executeScript(
        "setTimeout(function() { alert('hi'); }, 250);");
    Thread.sleep(1000);
    try {
      driver.getTitle();
    } catch (UnhandledAlertException expected) {
      assertEquals("hi", expected.getAlert().getText());
    }
    // Shouldn't throw
    driver.getTitle();
 }
}
