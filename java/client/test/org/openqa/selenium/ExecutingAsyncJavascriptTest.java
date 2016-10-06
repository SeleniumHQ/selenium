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

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NotYetImplemented;

import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;

import com.google.common.base.Throwables;

@Ignore(value = {PHANTOMJS})
public class ExecutingAsyncJavascriptTest extends JUnit4TestBase {

  private JavascriptExecutor executor;

  @Before
  public void setUp() throws Exception {
    assumeTrue(driver instanceof JavascriptExecutor);
    executor = (JavascriptExecutor) driver;
    driver.manage().timeouts().setScriptTimeout(0, TimeUnit.MILLISECONDS);
  }

  @JavascriptEnabled
  @Test
  public void shouldNotTimeoutIfCallbackInvokedImmediately() {
    driver.get(pages.ajaxyPage);
    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](123);");
    assertThat(result, instanceOf(Number.class));
    assertEquals(123, ((Number) result).intValue());
  }

  @JavascriptEnabled
  @Test
  public void shouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NeitherNullNorUndefined() {
    driver.get(pages.ajaxyPage);
    assertEquals(123, ((Number) executor.executeAsyncScript(
        "arguments[arguments.length - 1](123);")).longValue());
    assertEquals("abc", executor.executeAsyncScript("arguments[arguments.length - 1]('abc');"));
    assertFalse((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](false);"));
    assertTrue((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](true);"));
  }

  @JavascriptEnabled
  @Test
  public void shouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NullAndUndefined() {
    driver.get(pages.ajaxyPage);
    assertNull(executor.executeAsyncScript("arguments[arguments.length - 1](null)"));
    assertNull(executor.executeAsyncScript("arguments[arguments.length - 1]()"));
  }

  @JavascriptEnabled
  @Test
  public void shouldBeAbleToReturnAnArrayLiteralFromAnAsyncScript() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1]([]);");
    assertNotNull("Expected not to be null!", result);
    assertThat(result, instanceOf(List.class));
    assertTrue(((List<?>) result).isEmpty());
  }

  @JavascriptEnabled
  @Test
  public void shouldBeAbleToReturnAnArrayObjectFromAnAsyncScript() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](new Array());");
    assertNotNull("Expected not to be null!", result);
    assertThat(result, instanceOf(List.class));
    assertTrue(((List<?>) result).isEmpty());
  }

  @JavascriptEnabled
  @Test
  public void shouldBeAbleToReturnArraysOfPrimitivesFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript(
        "arguments[arguments.length - 1]([null, 123, 'abc', true, false]);");

    assertNotNull(result);
    assertThat(result, instanceOf(List.class));

    Iterator<?> results = ((List<?>) result).iterator();
    assertNull(results.next());
    assertEquals(123, ((Number) results.next()).longValue());
    assertEquals("abc", results.next());
    assertTrue((Boolean) results.next());
    assertFalse((Boolean) results.next());
    assertFalse(results.hasNext());
  }

  @JavascriptEnabled
  @Test
  public void shouldBeAbleToReturnWebElementsFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](document.body);");
    assertThat(result, instanceOf(WebElement.class));
    assertEquals("body", ((WebElement) result).getTagName().toLowerCase());
  }

  @JavascriptEnabled
  @Test
  public void shouldBeAbleToReturnArraysOfWebElementsFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript(
        "arguments[arguments.length - 1]([document.body, document.body]);");
    assertNotNull(result);
    assertThat(result, instanceOf(List.class));

    List<?> list = (List<?>) result;
    assertEquals(2, list.size());
    assertThat(list.get(0), instanceOf(WebElement.class));
    assertThat(list.get(1), instanceOf(WebElement.class));
    assertEquals("body", ((WebElement) list.get(0)).getTagName().toLowerCase());
    assertEquals(list.get(0), list.get(1));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {HTMLUNIT, MARIONETTE})
  public void shouldTimeoutIfScriptDoesNotInvokeCallback() {
    driver.get(pages.ajaxyPage);
    try {
      // Script is expected to be async and explicitly callback, so this should timeout.
      executor.executeAsyncScript("return 1 + 2;");
      fail("Should have thrown a TimeOutException!");
    } catch (ScriptTimeoutException exception) {
      // Do nothing.
    }
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {HTMLUNIT, MARIONETTE})
  public void shouldTimeoutIfScriptDoesNotInvokeCallbackWithAZeroTimeout() {
    driver.get(pages.ajaxyPage);
    try {
      executor.executeAsyncScript("window.setTimeout(function() {}, 0);");
      fail("Should have thrown a TimeOutException!");
    } catch (ScriptTimeoutException exception) {
      // Do nothing.
    }
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {MARIONETTE})
  public void shouldNotTimeoutIfScriptCallsbackInsideAZeroTimeout() {
    driver.get(pages.ajaxyPage);
    executor.executeAsyncScript(
        "var callback = arguments[arguments.length - 1];" +
        "window.setTimeout(function() { callback(123); }, 0)");
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {HTMLUNIT, MARIONETTE})
  public void shouldTimeoutIfScriptDoesNotInvokeCallbackWithLongTimeout() {
    driver.manage().timeouts().setScriptTimeout(500, TimeUnit.MILLISECONDS);
    driver.get(pages.ajaxyPage);
    try {
      executor.executeAsyncScript(
          "var callback = arguments[arguments.length - 1];" +
          "window.setTimeout(callback, 1500);");
      fail("Should have thrown a TimeOutException!");
    } catch (ScriptTimeoutException exception) {
      // Do nothing.
    }
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {IE})
  public void shouldDetectPageLoadsWhileWaitingOnAnAsyncScriptAndReturnAnError() {
    driver.get(pages.ajaxyPage);
    driver.manage().timeouts().setScriptTimeout(100, TimeUnit.MILLISECONDS);
    try {
      executor.executeAsyncScript("window.location = '" + pages.dynamicPage + "';");
      fail();
    } catch (WebDriverException expected) {
    }
  }

  @JavascriptEnabled
  @Test
  public void shouldCatchErrorsWhenExecutingInitialScript() {
    driver.get(pages.ajaxyPage);
    try {
      executor.executeAsyncScript("throw Error('you should catch this!');");
      fail();
    } catch (WebDriverException expected) {
    }
  }

  @JavascriptEnabled
  @Test
  public void shouldNotTimeoutWithMultipleCallsTheFirstOneBeingSynchronous() {
    driver.get(pages.ajaxyPage);
    driver.manage().timeouts().setScriptTimeout(10, TimeUnit.MILLISECONDS);
    assertTrue((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](true);"));
    assertTrue((Boolean) executor.executeAsyncScript(
        "var cb = arguments[arguments.length - 1]; window.setTimeout(function(){cb(true);}, 9);"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {CHROME, IE, PHANTOMJS, SAFARI, MARIONETTE})
  @NotYetImplemented(HTMLUNIT)
  public void shouldCatchErrorsWithMessageAndStacktraceWhenExecutingInitialScript() {
    driver.get(pages.ajaxyPage);
    String js = "function functionB() { throw Error('errormessage'); };"
                + "function functionA() { functionB(); };"
                + "functionA();";
    try {
      executor.executeAsyncScript(js);
      fail("Expected an exception");
    } catch (WebDriverException e) {
      assertThat(e.getMessage(), containsString("errormessage"));

      Throwable rootCause = Throwables.getRootCause(e);
      assertThat(rootCause.getMessage(), containsString("errormessage"));

      StackTraceElement [] st = rootCause.getStackTrace();
      boolean seen = false;
      for (StackTraceElement s: st) {
        if (s.getMethodName().equals("functionB")) {
          seen = true;
        }
      }
      assertTrue("Stacktrace has not js method info", seen);
    }
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {MARIONETTE})
  public void shouldBeAbleToExecuteAsynchronousScripts() {
    driver.get(pages.ajaxyPage);

    WebElement typer = driver.findElement(By.name("typer"));
    typer.sendKeys("bob");
    assertEquals("bob", typer.getAttribute("value"));

    driver.findElement(By.id("red")).click();
    driver.findElement(By.name("submit")).click();

    assertEquals("There should only be 1 DIV at this point, which is used for the butter message",
                 1, getNumDivElements());

    driver.manage().timeouts().setScriptTimeout(15, TimeUnit.SECONDS);
    String text = (String) executor.executeAsyncScript(
        "var callback = arguments[arguments.length - 1];"
        + "window.registerListener(arguments[arguments.length - 1]);");
    assertEquals("bob", text);
    assertEquals("", typer.getAttribute("value"));

    assertEquals("There should be 1 DIV (for the butter message) + 1 DIV (for the new label)",
                 2, getNumDivElements());
  }

  @JavascriptEnabled
  @Test
  public void shouldBeAbleToPassMultipleArgumentsToAsyncScripts() {
    driver.get(pages.ajaxyPage);
    Number result = (Number) ((JavascriptExecutor) driver)
        .executeAsyncScript("arguments[arguments.length - 1](arguments[0] + arguments[1]);", 1, 2);
    assertEquals(3, result.intValue());
  }

  @JavascriptEnabled
  @Test
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void shouldBeAbleToMakeXMLHttpRequestsAndWaitForTheResponse() {
    String script =
        "var url = arguments[0];" +
        "var callback = arguments[arguments.length - 1];" +
        // Adapted from http://www.quirksmode.org/js/xmlhttp.html
        "var XMLHttpFactories = [" +
        "  function () {return new XMLHttpRequest()}," +
        "  function () {return new ActiveXObject('Msxml2.XMLHTTP')}," +
        "  function () {return new ActiveXObject('Msxml3.XMLHTTP')}," +
        "  function () {return new ActiveXObject('Microsoft.XMLHTTP')}" +
        "];" +
        "var xhr = false;" +
        "while (!xhr && XMLHttpFactories.length) {" +
        "  try {" +
        "    xhr = XMLHttpFactories.shift().call();" +
        "  } catch (e) {}" +
        "}" +
        "if (!xhr) throw Error('unable to create XHR object');" +
        "xhr.open('GET', url, true);" +
        "xhr.onreadystatechange = function() {" +
        "  if (xhr.readyState == 4) callback(xhr.responseText);" +
        "};" +
        "xhr.send('');"; // empty string to stop firefox 3 from choking

    driver.get(pages.ajaxyPage);
    driver.manage().timeouts().setScriptTimeout(3, TimeUnit.SECONDS);
    String response = (String) ((JavascriptExecutor) driver)
        .executeAsyncScript(script, pages.sleepingPage + "?time=2");
    assertThat(response.trim(),
               equalTo("<html><head><title>Done</title></head><body>Slept for 2s</body></html>"));
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {CHROME, IE, MARIONETTE})
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void throwsIfScriptTriggersAlert() {
    driver.get(pages.simpleTestPage);
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    try {
      ((JavascriptExecutor) driver).executeAsyncScript(
          "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException expected) {
      // Expected exception
    }
    // Shouldn't throw
    driver.getTitle();
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {CHROME, IE, MARIONETTE})
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void throwsIfAlertHappensDuringScript() {
    driver.get(pages.slowLoadingAlertPage);
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    try {
      ((JavascriptExecutor) driver).executeAsyncScript("setTimeout(arguments[0], 1000);");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException expected) {
      //Expected exception
    }
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(value = {CHROME, IE, MARIONETTE})
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void throwsIfScriptTriggersAlertWhichTimesOut() {
    driver.get(pages.simpleTestPage);
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    try {
      ((JavascriptExecutor) driver)
          .executeAsyncScript("setTimeout(function() { window.alert('Look! An alert!'); }, 50);");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException expected) {
      // Expected exception
    }
    // Shouldn't throw
    driver.getTitle();
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {CHROME, IE, MARIONETTE})
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void throwsIfAlertHappensDuringScriptWhichTimesOut() {
    driver.get(pages.slowLoadingAlertPage);
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    try {
      ((JavascriptExecutor) driver).executeAsyncScript("");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException expected) {
      //Expected exception
    }
    // Shouldn't throw
    driver.getTitle();
  }

  @JavascriptEnabled
  @Test
  @Ignore(value = {CHROME, IE, MARIONETTE})
  @NotYetImplemented(HTMLUNIT)
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void includesAlertTextInUnhandledAlertException() {
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
    String alertText = "Look! An alert!";
    try {
      ((JavascriptExecutor) driver).executeAsyncScript(
          "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('" + alertText
          + "'); }, 50);");
      fail("Expected UnhandledAlertException");
    } catch (UnhandledAlertException e) {
      assertEquals(alertText, e.getAlertText());
    }
  }

  private long getNumDivElements() {
    // Selenium does not support "findElements" yet, so we have to do this through a script.
    return (Long) ((JavascriptExecutor) driver).executeScript(
        "return document.getElementsByTagName('div').length;");
  }

}
