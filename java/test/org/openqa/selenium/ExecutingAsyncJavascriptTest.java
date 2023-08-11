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
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import java.time.Duration;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

class ExecutingAsyncJavascriptTest extends JupiterTestBase {

  private JavascriptExecutor executor;

  @BeforeEach
  public void setUp() {
    assumeTrue(driver instanceof JavascriptExecutor);
    executor = (JavascriptExecutor) driver;
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(5000));
  }

  @Test
  @NotYetImplemented(value = CHROME, reason = "Default to 5s")
  @NotYetImplemented(value = FIREFOX, reason = "Default to 5s")
  @NotYetImplemented(value = SAFARI, reason = "Default to 5s")
  public void shouldSetAndGetScriptTimeout() {
    Duration timeout = driver.manage().timeouts().getScriptTimeout();
    assertThat(timeout).hasMillis(30000);
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(3000));
    Duration timeout2 = driver.manage().timeouts().getScriptTimeout();
    assertThat(timeout2).hasMillis(3000);
  }

  @Test
  void shouldNotTimeoutIfCallbackInvokedImmediately() {
    driver.get(pages.ajaxyPage);
    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](123);");
    assertThat(result).isInstanceOf(Number.class);
    assertThat(((Number) result).intValue()).isEqualTo(123);
  }

  @Test
  void shouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NeitherNullNorUndefined() {
    driver.get(pages.ajaxyPage);
    assertThat(
            ((Number) executor.executeAsyncScript("arguments[arguments.length - 1](123);"))
                .longValue())
        .isEqualTo(123);
    assertThat(executor.executeAsyncScript("arguments[arguments.length - 1]('abc');"))
        .isEqualTo("abc");
    assertThat((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](false);"))
        .isFalse();
    assertThat((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](true);"))
        .isTrue();
  }

  @Test
  void shouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NullAndUndefined() {
    driver.get(pages.ajaxyPage);
    assertThat(executor.executeAsyncScript("arguments[arguments.length - 1](null)")).isNull();
    assertThat(executor.executeAsyncScript("arguments[arguments.length - 1]()")).isNull();
  }

  @Test
  void shouldBeAbleToReturnAnArrayLiteralFromAnAsyncScript() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1]([]);");
    assertThat(result).isNotNull().isInstanceOf(List.class);
    assertThat(((List<?>) result)).isEmpty();
  }

  @Test
  void shouldBeAbleToReturnAnArrayObjectFromAnAsyncScript() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](new Array());");
    assertThat(result).isNotNull().isInstanceOf(List.class);
    assertThat(((List<?>) result)).isEmpty();
  }

  @Test
  void shouldBeAbleToReturnArraysOfPrimitivesFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result =
        executor.executeAsyncScript(
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
  void shouldBeAbleToReturnWebElementsFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](document.body);");
    assertThat(result).isInstanceOf(WebElement.class);
    assertThat(((WebElement) result).getTagName()).isEqualToIgnoringCase("body");
  }

  @Test
  @Ignore(value = CHROME, reason = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=4525")
  void shouldBeAbleToReturnArraysOfWebElementsFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result =
        executor.executeAsyncScript(
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
  public void shouldTimeoutIfScriptDoesNotInvokeCallback() {
    driver.get(pages.ajaxyPage);
    // Script is expected to be async and explicitly callback, so this should timeout.
    assertThatExceptionOfType(ScriptTimeoutException.class)
        .isThrownBy(() -> executor.executeAsyncScript("return 1 + 2;"));
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void shouldTimeoutIfScriptDoesNotInvokeCallbackWithAZeroTimeout() {
    driver.get(pages.ajaxyPage);
    assertThatExceptionOfType(ScriptTimeoutException.class)
        .isThrownBy(() -> executor.executeAsyncScript("window.setTimeout(function() {}, 0);"));
  }

  @Test
  @Ignore(FIREFOX)
  public void shouldNotTimeoutIfScriptCallsbackInsideAZeroTimeout() {
    driver.get(pages.ajaxyPage);
    executor.executeAsyncScript(
        "var callback = arguments[arguments.length - 1];"
            + "window.setTimeout(function() { callback(123); }, 0)");
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void shouldTimeoutIfScriptDoesNotInvokeCallbackWithLongTimeout() {
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(500));
    driver.get(pages.ajaxyPage);
    assertThatExceptionOfType(ScriptTimeoutException.class)
        .isThrownBy(
            () ->
                executor.executeAsyncScript(
                    "var callback = arguments[arguments.length - 1];"
                        + "window.setTimeout(callback, 1500);"));
  }

  @Test
  @Ignore(IE)
  public void shouldDetectPageLoadsWhileWaitingOnAnAsyncScriptAndReturnAnError() {
    driver.get(pages.ajaxyPage);
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(100));
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(
            () -> executor.executeAsyncScript("window.location = '" + pages.dynamicPage + "';"));
  }

  @Test
  void shouldCatchErrorsWhenExecutingInitialScript() {
    driver.get(pages.ajaxyPage);
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> executor.executeAsyncScript("throw Error('you should catch this!');"));
  }

  @Test
  void shouldNotTimeoutWithMultipleCallsTheFirstOneBeingSynchronous() {
    driver.get(pages.ajaxyPage);
    assertThat((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](true);"))
        .isTrue();
    assertThat(
            (Boolean)
                executor.executeAsyncScript(
                    "var cb = arguments[arguments.length - 1];"
                        + " window.setTimeout(function(){cb(true);}, 9);"))
        .isTrue();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
  @Ignore(FIREFOX)
  @NotYetImplemented(HTMLUNIT)
  public void shouldCatchErrorsWithMessageAndStacktraceWhenExecutingInitialScript() {
    driver.get(pages.ajaxyPage);
    String js =
        "function functionB() { throw Error('errormessage'); };"
            + "function functionA() { functionB(); };"
            + "functionA();";
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> executor.executeAsyncScript(js))
        .withMessageContaining("errormessage")
        .satisfies(
            t -> {
              Throwable rootCause = getRootCause(t);
              assertThat(rootCause).hasMessageContaining("errormessage");
              assertThat(Arrays.asList(rootCause.getStackTrace()))
                  .extracting(StackTraceElement::getMethodName)
                  .contains("functionB");
            });
  }

  @Test
  void shouldBeAbleToExecuteAsynchronousScripts() {
    driver.get(pages.ajaxyPage);

    WebElement typer = driver.findElement(By.name("typer"));
    typer.sendKeys("bob");
    assertThat(typer.getAttribute("value")).isEqualTo("bob");

    driver.findElement(By.id("red")).click();
    driver.findElement(By.name("submit")).click();

    assertThat(getNumDivElements())
        .describedAs(
            "There should only be 1 DIV at this point, which is used for the butter message")
        .isEqualTo(1);

    driver.manage().timeouts().setScriptTimeout(Duration.ofSeconds(15));
    String text =
        (String)
            executor.executeAsyncScript(
                "var callback = arguments[arguments.length - 1];"
                    + "window.registerListener(arguments[arguments.length - 1]);");
    assertThat(text).isEqualTo("bob");
    assertThat(typer.getAttribute("value")).isEmpty();

    assertThat(getNumDivElements())
        .describedAs("There should be 1 DIV (for the butter message) + 1 DIV (for the new label)")
        .isEqualTo(2);
  }

  @Test
  void shouldBeAbleToPassMultipleArgumentsToAsyncScripts() {
    driver.get(pages.ajaxyPage);
    Number result =
        (Number)
            executor.executeAsyncScript(
                "arguments[arguments.length - 1](arguments[0] + arguments[1]);", 1, 2);
    assertThat(result.intValue()).isEqualTo(3);
  }

  @Test
  void shouldBeAbleToMakeXMLHttpRequestsAndWaitForTheResponse() {
    String script =
        "var url = arguments[0];"
            + "var callback = arguments[arguments.length - 1];"
            +
            // Adapted from http://www.quirksmode.org/js/xmlhttp.html
            "var XMLHttpFactories = ["
            + "  function () {return new XMLHttpRequest()},"
            + "  function () {return new ActiveXObject('Msxml2.XMLHTTP')},"
            + "  function () {return new ActiveXObject('Msxml3.XMLHTTP')},"
            + "  function () {return new ActiveXObject('Microsoft.XMLHTTP')}"
            + "];"
            + "var xhr = false;"
            + "while (!xhr && XMLHttpFactories.length) {"
            + "  try {"
            + "    xhr = XMLHttpFactories.shift().call();"
            + "  } catch (e) {}"
            + "}"
            + "if (!xhr) throw Error('unable to create XHR object');"
            + "xhr.open('GET', url, true);"
            + "xhr.onreadystatechange = function() {"
            + "  if (xhr.readyState == 4) callback(xhr.responseText);"
            + "};"
            + "xhr.send('');"; // empty string to stop firefox 3 from choking

    driver.get(pages.ajaxyPage);
    driver.manage().timeouts().setScriptTimeout(Duration.ofSeconds(3));
    String response = (String) executor.executeAsyncScript(script, pages.sleepingPage + "?time=2");
    assertThat(response.trim())
        .isEqualTo("<html><head><title>Done</title></head><body>Slept for 2s</body></html>");
  }

  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(IE)
  @Ignore(FIREFOX)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  public void throwsIfScriptTriggersAlert() {
    driver.get(pages.simpleTestPage);
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(5000));
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(
            () ->
                executor.executeAsyncScript(
                    "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('Look! An"
                        + " alert!'); }, 50);"));
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(IE)
  @Ignore(FIREFOX)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  public void throwsIfAlertHappensDuringScript() {
    driver.get(pages.slowLoadingAlertPage);
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(5000));
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> executor.executeAsyncScript("setTimeout(arguments[0], 1000);"));
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(IE)
  @Ignore(FIREFOX)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  public void throwsIfScriptTriggersAlertWhichTimesOut() {
    driver.get(pages.simpleTestPage);
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(5000));
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(
            () ->
                executor.executeAsyncScript(
                    "setTimeout(function() { window.alert('Look! An alert!'); }, 50);"));
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(IE)
  @Ignore(FIREFOX)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  public void throwsIfAlertHappensDuringScriptWhichTimesOut() {
    driver.get(pages.slowLoadingAlertPage);
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(5000));
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(() -> executor.executeAsyncScript(""));
    // Shouldn't throw
    driver.getTitle();
  }

  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(IE)
  @Ignore(FIREFOX)
  @Ignore(value = SAFARI, reason = "Does not support alerts yet")
  public void includesAlertTextInUnhandledAlertException() {
    driver.manage().timeouts().setScriptTimeout(Duration.ofMillis(5000));
    String alertText = "Look! An alert!";
    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(
            () ->
                executor.executeAsyncScript(
                    "setTimeout(arguments[0], 200) ; setTimeout(function() { window.alert('"
                        + alertText
                        + "'); }, 50);"))
        .satisfies(t -> assertThat(t.getAlertText()).isEqualTo(alertText));
  }

  private long getNumDivElements() {
    // Selenium does not support "findElements" yet, so we have to do this through a script.
    return (Long)
        ((JavascriptExecutor) driver)
            .executeScript("return document.getElementsByTagName('div').length;");
  }
}
