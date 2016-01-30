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

package org.openqa.selenium.safari;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import com.google.common.base.Joiner;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.UnhandledAlertException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;

import java.util.concurrent.TimeUnit;

@NeedsLocalEnvironment(reason = "Requires local browser launching environment")
public class AlertsTest extends JUnit4TestBase {

  @AfterClass
  public static void quitDriver() {
    JUnit4TestBase.removeDriver();
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
      assertAlertText("cheese", e);
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
      assertAlertText("hi", expected);
    }
    // Shouldn't throw
    driver.getTitle();
 }

  @Test
  public void onBeforeUnloadWithNoReturnValueShouldNotTriggerUnexpectedAlertErrors() {
   driver.get(pages.alertsPage);

   JavascriptExecutor executor = (JavascriptExecutor) driver;
   assertEquals(0L,
       executor.executeScript("localStorage.clear(); return localStorage.length"));

   executor.executeScript(
       "window.onbeforeunload = function() {\n" +
       "  localStorage.setItem('foo', 'bar');\n" +
       "};");

    driver.navigate().refresh();
    assertEquals("onbeforeunload did not run!",
        "bar", executor.executeScript("return localStorage.getItem('foo');"));
  }

  @Test
  public void
  onBeforeUnloadWithNoReturnValueShouldNotTriggerUnexpectedAlertErrors_firedBetweenCommands()
      throws InterruptedException {
   driver.get(pages.alertsPage);

   JavascriptExecutor executor = (JavascriptExecutor) driver;
   assertEquals(0L,
       executor.executeScript("localStorage.clear(); return localStorage.length"));

   executor.executeScript(
       Joiner.on("\n").join(
           "window.onbeforeunload = function() {",
           "  localStorage.setItem('foo', 'bar');",
           "};",
           "var newUrl = arguments[0];",
           "window.setTimeout(function() {",
           "  window.location.href = newUrl;",
           "}, 500);"),
       pages.iframePage);

    // Yes, we need to use a dirty sleep here. We want to ensure the page
    // reloads and triggers onbeforeunload without any WebDriver commands.
    Thread.sleep(1500);

    assertEquals(pages.iframePage, driver.getCurrentUrl());
    assertEquals("onbeforeunload did not run!",
        "bar", executor.executeScript("return localStorage.getItem('foo');"));
  }

  @Test
  public void onBeforeUnloadWithNullReturnDoesNotTriggerAlertError() {
    driver.get(pages.alertsPage);

    JavascriptExecutor executor = (JavascriptExecutor) driver;
    assertEquals(0L,
        executor.executeScript("localStorage.clear(); return localStorage.length"));

    executor.executeScript(
        "window.onbeforeunload = function() {\n" +
        "  localStorage.setItem('foo', 'bar');\n" +
        "  return null;\n" +
        "};");

    driver.navigate().refresh();
    assertEquals("onbeforeunload did not run!",
        "bar", executor.executeScript("return localStorage.getItem('foo');"));
  }

  @Test
  public void onBeforeUnloadFromPageLoadShouldTriggerUnexpectedAlertErrors() {
    driver.get(pages.alertsPage);

    setSimpleOnBeforeUnload("one two three");
    try {
      driver.get(pages.alertsPage);
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException e) {
      assertAlertText("one two three", e);
    }
  }

  @Test
  public void onBeforeUnloadFromPageRefreshShouldTriggerUnexpectedAlertErrors() {
    driver.get(pages.alertsPage);

    setSimpleOnBeforeUnload("one two three");
    try {
      driver.navigate().refresh();
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException e) {
      assertAlertText("one two three", e);
    }
  }

  @Test
  public void
  onBeforeUnloadWithReturnValuesShouldTriggerUnexpectedAlertErrors_uiAction() {
    driver.get(pages.alertsPage);

    JavascriptExecutor executor = (JavascriptExecutor) driver;
    WebElement body = (WebElement) executor.executeScript(
        "var newPage = arguments[0];" +
        "window.onbeforeunload = function() { return 'one two three'; };" +
        "document.body.onclick = function() { window.location.href = newPage; };" +
        "return document.body;",
        pages.simpleTestPage);

    body.click();
    try {
      driver.getTitle();
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException e) {
      assertAlertText("one two three", e);
    }
  }

  @Test
  public void
  onBeforeUnloadWithReturnValuesShouldTriggerUnexpectedAlertErrors_asyncScript() {
    driver.get(pages.alertsPage);

    setSimpleOnBeforeUnload("one two three");
    try {
      ((JavascriptExecutor) driver).executeAsyncScript(
          "window.location = arguments[0]", pages.alertsPage);
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException e) {
      assertAlertText("one two three", e);
    }
  }

  private static void assertAlertText(String expectedText, UnhandledAlertException e) {
    assertEquals(expectedText, e.getAlertText());
  }

  private void setSimpleOnBeforeUnload(Object returnValue) {
    ((JavascriptExecutor) driver).executeScript(
        "var retVal = arguments[0]; window.onbeforeunload = function() { return retVal; }",
        returnValue);
  }
}
