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

import static com.google.common.base.Throwables.getRootCause;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsLocalEnvironment;
import org.openqa.selenium.testing.NotYetImplemented;

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class ExecutingAsyncJavascriptTest extends JUnit4TestBase {

  private JavascriptExecutor executor;

  @Before
  public void setUp() {
    assumeTrue(driver instanceof JavascriptExecutor);
    executor = (JavascriptExecutor) driver;
    driver.manage().timeouts().setScriptTimeout(5000, TimeUnit.MILLISECONDS);
  }

  @Test
  public void shouldNotTimeoutIfCallbackInvokedImmediately() {
    driver.get(pages.ajaxyPage);
    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](123);");
    assertThat(result).isInstanceOf(Number.class);
    assertThat(((Number) result).intValue()).isEqualTo(123);
  }

  @Test
  public void shouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NeitherNullNorUndefined() {
    driver.get(pages.ajaxyPage);
    assertThat(((Number) executor.executeAsyncScript(
        "arguments[arguments.length - 1](123);")).longValue()).isEqualTo(123);
    assertThat(executor.executeAsyncScript("arguments[arguments.length - 1]('abc');"))
        .isEqualTo("abc");
    assertThat((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](false);"))
        .isFalse();
    assertThat((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](true);"))
        .isTrue();
  }

  @Test
  public void shouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NullAndUndefined() {
    driver.get(pages.ajaxyPage);
    assertThat(executor.executeAsyncScript("arguments[arguments.length - 1](null)")).isNull();
    assertThat(executor.executeAsyncScript("arguments[arguments.length - 1]()")).isNull();
  }

  @Test
  public void shouldBeAbleToReturnAnArrayLiteralFromAnAsyncScript() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1]([]);");
    assertThat(result).isNotNull().isInstanceOf(List.class);
    assertThat(((List<?>) result)).isEmpty();
  }

  @Test
  public void shouldBeAbleToReturnAnArrayObjectFromAnAsyncScript() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](new Array());");
    assertThat(result).isNotNull().isInstanceOf(List.class);
    assertThat(((List<?>) result)).isEmpty();
  }

  @Test
  public void shouldBeAbleToReturnArraysOfPrimitivesFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript(
        "arguments[arguments.length - 1]([null, 123, 'abc', true, false]);");

    assertThat(result).isNotNull();
    assertThat(result).isInstanceOf(List.class);

    Iterator<?> results = ((List<?>) result).iterator();
    assertThat(results.next()).isNull();
    assertThat(((Number) results.next()).longValue()).isEqualTo(123);
    assertThat(results.next()).isEqualTo("abc");
    assertThat((Boolean) results.next()).isTrue();
    assertThat((Boolean) results.next()).isFalse();
    assertThat(results.hasNext()).isFalse();
  }

  @Test
  public void shouldBeAbleToReturnWebElementsFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](document.body);");
    assertThat(result).isInstanceOf(WebElement.class);
    assertThat(((WebElement) result).getTagName()).isEqualToIgnoringCase("body");
  }

  @Test
  public void shouldBeAbleToReturnArraysOfWebElementsFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript(
        "arguments[arguments.length - 1]([document.body, document.body]);");
    assertThat(result).isNotNull().isInstanceOf(List.class);

    List<?> list = (List<?>) result;
    assertThat(list).hasSize(2);
    assertThat(list.get(0)).isInstanceOf(WebElement.class);
    assertThat(list.get(1)).isInstanceOf(WebElement.class);
    assertThat(((WebElement) list.get(0)).getTagName()).isEqualToIgnoringCase("body");
    assertThat(list.get(1)).isEqualTo(list.get(0));
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void shouldTimeoutIfScriptDoesNotInvokeCallback() {
    driver.get(pages.ajaxyPage);
    // Script is expected to be async and explicitly callback, so this should timeout.
    assertThatExceptionOfType(ScriptTimeoutException.class)
        .isThrownBy(() -> executor.executeAsyncScript("return 1 + 2;"));
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void shouldTimeoutIfScriptDoesNotInvokeCallbackWithAZeroTimeout() {
    driver.get(pages.ajaxyPage);
    assertThatExceptionOfType(ScriptTimeoutException.class)
        .isThrownBy(() -> executor.executeAsyncScript("window.setTimeout(function() {}, 0);"));
  }

  @Test
  @Ignore(MARIONETTE)
  @NotYetImplemented(EDGE)
  public void shouldNotTimeoutIfScriptCallsbackInsideAZeroTimeout() {
    driver.get(pages.ajaxyPage);
    executor.executeAsyncScript(
        "var callback = arguments[arguments.length - 1];" +
        "window.setTimeout(function() { callback(123); }, 0)");
  }

  @Test
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(EDGE)
  public void shouldTimeoutIfScriptDoesNotInvokeCallbackWithLongTimeout() {
    driver.manage().timeouts().setScriptTimeout(500, MILLISECONDS);
    driver.get(pages.ajaxyPage);
    assertThatExceptionOfType(ScriptTimeoutException.class)
        .isThrownBy(() -> executor.executeAsyncScript(
            "var callback = arguments[arguments.length - 1];" +
            "window.setTimeout(callback, 1500);"));
  }

  @Test
  @Ignore(IE)
  public void shouldDetectPageLoadsWhileWaitingOnAnAsyncScriptAndReturnAnError() {
    driver.get(pages.ajaxyPage);
    driver.manage().timeouts().setScriptTimeout(100, MILLISECONDS);
    assertThatExceptionOfType(WebDriverException.class).isThrownBy(
        () -> executor.executeAsyncScript("window.location = '" + pages.dynamicPage + "';"));
  }

  @Test
  public void shouldCatchErrorsWhenExecutingInitialScript() {
    driver.get(pages.ajaxyPage);
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> executor.executeAsyncScript("throw Error('you should catch this!');"));
  }

  @Test
  public void shouldNotTimeoutWithMultipleCallsTheFirstOneBeingSynchronous() {
    driver.get(pages.ajaxyPage);
    assertThat((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](true);"))
        .isTrue();
    assertThat((Boolean) executor.executeAsyncScript(
        "var cb = arguments[arguments.length - 1]; window.setTimeout(function(){cb(true);}, 9);"))
        .isTrue();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
  @Ignore(MARIONETTE)
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(EDGE)
  public void shouldCatchErrorsWithMessageAndStacktraceWhenExecutingInitialScript() {
    driver.get(pages.ajaxyPage);
    String js = "function functionB() { throw Error('errormessage'); };"
              + "function functionA() { functionB(); };"
              + "functionA();";
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> executor.executeAsyncScript(js))
        .withMessageContaining("errormessage")
        .satisfies(t -> {
          Throwable rootCause = getRootCause(t);
          assertThat(rootCause).hasMessageContaining("errormessage");
          assertThat(Arrays.asList(rootCause.getStackTrace()))
              .extracting(StackTraceElement::getMethodName)
              .contains("functionB");
        });

  }

  @Test
  public void shouldBeAbleToExecuteAsynchronousScripts() {
    driver.get(pages.ajaxyPage);

    WebElement typer = driver.findElement(By.name("typer"));
    typer.sendKeys("bob");
    assertThat(typer.getAttribute("value")).isEqualTo("bob");

    driver.findElement(By.id("red")).click();
    driver.findElement(By.name("submit")).click();

    assertThat(getNumDivElements())
        .describedAs("There should only be 1 DIV at this point, which is used for the butter message")
        .isEqualTo(1);

    driver.manage().timeouts().setScriptTimeout(15, TimeUnit.SECONDS);
    String text = (String) executor.executeAsyncScript(
        "var callback = arguments[arguments.length - 1];"
        + "window.registerListener(arguments[arguments.length - 1]);");
    assertThat(text).isEqualTo("bob");
    assertThat(typer.getAttribute("value")).isEqualTo("");

    assertThat(getNumDivElements())
        .describedAs("There should be 1 DIV (for the butter message) + 1 DIV (for the new label)")
        .isEqualTo(2);
  }

  @Test
  public void shouldBeAbleToPassMultipleArgumentsToAsyncScripts() {
    driver.get(pages.ajaxyPage);
    Number result = (Number) executor.executeAsyncScript(
        "arguments[arguments.length - 1](arguments[0] + arguments[1]);", 1, 2);
    assertThat(result.intValue()).isEqualTo(3);
  }

  @Test
  @NeedsLocalEnvironment(reason = "Relies on timing")
  @NotYetImplemented(EDGE)
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
    String response = (String) executor.executeAsyncScript(script, pages.sleepingPage + "?time=2");
    assertThat(response.trim())
        .isEqualTo("<html><head><title>Done</title></head><body>Slept for 2s</body></html>");
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @Ignore(EDGE)
  @Ignore(MARIONETTE)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void throwsIfScriptTriggersAlert() {
    driver.get(pages.simpleTestPage);
    driver.manage().timeouts().setScriptTimeout(5000, MILLISECONDS);
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> executor.executeAsyncScript(
            "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('Look! An alert!'); }, 50);"));
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @Ignore(EDGE)
  @Ignore(MARIONETTE)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void throwsIfAlertHappensDuringScript() {
    driver.get(pages.slowLoadingAlertPage);
    driver.manage().timeouts().setScriptTimeout(5000, MILLISECONDS);
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> executor.executeAsyncScript("setTimeout(arguments[0], 1000);"));
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @Ignore(EDGE)
  @Ignore(MARIONETTE)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  @NotYetImplemented(EDGE)
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void throwsIfScriptTriggersAlertWhichTimesOut() {
    driver.get(pages.simpleTestPage);
    driver.manage().timeouts().setScriptTimeout(5000, MILLISECONDS);
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> executor.executeAsyncScript(
            "setTimeout(function() { window.alert('Look! An alert!'); }, 50);"));
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @Ignore(EDGE)
  @Ignore(MARIONETTE)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void throwsIfAlertHappensDuringScriptWhichTimesOut() {
    driver.get(pages.slowLoadingAlertPage);
    driver.manage().timeouts().setScriptTimeout(5000, MILLISECONDS);
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> executor.executeAsyncScript(""));
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(CHROMIUMEDGE)
  @Ignore(IE)
  @Ignore(MARIONETTE)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  @Ignore(EDGE)
  @NeedsLocalEnvironment(reason = "Relies on timing")
  public void includesAlertTextInUnhandledAlertException() {
    driver.manage().timeouts().setScriptTimeout(5000, MILLISECONDS);
    String alertText = "Look! An alert!";
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> executor.executeAsyncScript(
            "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('" + alertText
            + "'); }, 50);"))
        .satisfies(t -> assertThat(t.getAlertText()).isEqualTo(alertText));
  }

  private long getNumDivElements() {
    // Selenium does not support "findElements" yet, so we have to do this through a script.
    return (Long) ((JavascriptExecutor) driver).executeScript(
        "return document.getElementsByTagName('div').length;");
  }

}
