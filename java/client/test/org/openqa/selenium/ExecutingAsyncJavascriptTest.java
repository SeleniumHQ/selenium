package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.instanceOf;
import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import org.junit.Test;

import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Ignore(value = {IE, OPERA},
    reason = "IE: Every test appears to be failing. Opera: not implemented yet")
public class ExecutingAsyncJavascriptTest extends AbstractDriverTestCase {

  private JavascriptExecutor executor;

  @Override
  protected void setUp() throws Exception {
    super.setUp();
    if (driver instanceof JavascriptExecutor) {
      executor = (JavascriptExecutor) driver;
    }
    driver.manage().timeouts().setScriptTimeout(0, TimeUnit.MILLISECONDS);
  }

  @JavascriptEnabled @Test
  public void shouldNotTimeoutIfCallbackInvokedImmediately() {
    driver.get(pages.ajaxyPage);
    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](123);");
    assertThat(result, instanceOf(Number.class));
    assertEquals(123, ((Number) result).intValue());
  }

  @JavascriptEnabled @Test
  public void shouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NeitherNullNorUndefined() {
    driver.get(pages.ajaxyPage);
    assertEquals(123, ((Number) executor.executeAsyncScript(
        "arguments[arguments.length - 1](123);")).longValue());
    assertEquals("abc", executor.executeAsyncScript("arguments[arguments.length - 1]('abc');"));
    assertFalse((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](false);"));
    assertTrue((Boolean) executor.executeAsyncScript("arguments[arguments.length - 1](true);"));
  }

  @JavascriptEnabled @Test
  @Ignore(value = {SELENESE}, reason = "SeleniumRC cannot return null values.")
  public void shouldBeAbleToReturnJavascriptPrimitivesFromAsyncScripts_NullAndUndefined() {
    driver.get(pages.ajaxyPage);
    assertNull(executor.executeAsyncScript("arguments[arguments.length - 1](null)"));
    assertNull(executor.executeAsyncScript("arguments[arguments.length - 1]()"));
  }

  @JavascriptEnabled @Test
  @Ignore(value = {SELENESE}, reason = "Selenium cannot return arrays")
  public void shouldBeAbleToReturnAnArrayLiteralFromAnAsyncScript() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1]([]);");
    assertNotNull("Expected not to be null!", result);
    assertThat(result, instanceOf(List.class));
    assertTrue(((List) result).isEmpty());
  }

  @JavascriptEnabled @Test
  @Ignore(value = {SELENESE}, reason = "Selenium cannot return arrays")
  public void shouldBeAbleToReturnAnArrayObjectFromAnAsyncScript() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](new Array());");
    assertNotNull("Expected not to be null!", result);
    assertThat(result, instanceOf(List.class));
    assertTrue(((List) result).isEmpty());
  }

  @JavascriptEnabled @Test
  @Ignore(value = {ANDROID, SELENESE},
      reason = "Android does not properly handle arrays; Selenium cannot return arrays")
  public void shouldBeAbleToReturnArraysOfPrimitivesFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript(
        "arguments[arguments.length - 1]([null, 123, 'abc', true, false]);");

    assertNotNull(result);
    assertThat(result, instanceOf(List.class));

    Iterator results = ((List) result).iterator();
    assertNull(results.next());
    assertEquals(123, ((Number) results.next()).longValue());
    assertEquals("abc", results.next());
    assertTrue((Boolean) results.next());
    assertFalse((Boolean) results.next());
    assertFalse(results.hasNext());
  }

  @JavascriptEnabled @Test
  @Ignore(value = SELENESE, reason = "Selenium cannot return elements from scripts")
  public void shouldBeAbleToReturnWebElementsFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript("arguments[arguments.length - 1](document.body);");
    assertThat(result, instanceOf(WebElement.class));
    assertEquals("body", ((WebElement) result).getTagName().toLowerCase());
  }

  @JavascriptEnabled @Test
  @Ignore(value = {ANDROID, SELENESE},
      reason = "Android does not properly handle arrays; Selenium cannot return elements")
  public void shouldBeAbleToReturnArraysOfWebElementsFromAsyncScripts() {
    driver.get(pages.ajaxyPage);

    Object result = executor.executeAsyncScript(
        "arguments[arguments.length - 1]([document.body, document.body]);");
    assertNotNull(result);
    assertThat(result, instanceOf(List.class));

    List list = (List) result;
    assertEquals(2, list.size());
    assertThat(list.get(0), instanceOf(WebElement.class));
    assertThat(list.get(1), instanceOf(WebElement.class));
    assertEquals("body", ((WebElement) list.get(0)).getTagName().toLowerCase());
    assertEquals(list.get(0), list.get(1));
  }

  @JavascriptEnabled @Test
  public void shouldTimeoutIfScriptDoesNotInvokeCallback() {
    driver.get(pages.ajaxyPage);
    try {
      // Script is expected to be async and explicitly callback, so this should timeout.
      executor.executeAsyncScript("return 1 + 2;");
      fail("Should have thrown a TimeOutException!");
    } catch (TimeoutException exception) {
      // Do nothing.
    }
  }

  @JavascriptEnabled @Test
  public void shouldTimeoutIfScriptDoesNotInvokeCallbackWithAZeroTimeout() {
    driver.get(pages.ajaxyPage);
    try {
      executor.executeAsyncScript("window.setTimeout(function() {}, 0);");
      fail("Should have thrown a TimeOutException!");
    } catch (TimeoutException exception) {
      // Do nothing.
    }
  }

  @JavascriptEnabled @Test
  public void shouldNotTimeoutIfScriptCallsbackInsideAZeroTimeout() {
    driver.get(pages.ajaxyPage);
    executor.executeAsyncScript(
        "var callback = arguments[arguments.length - 1];" +
        "window.setTimeout(function() { callback(123); }, 0)");
  }

  @JavascriptEnabled @Test
  public void shouldTimeoutIfScriptDoesNotInvokeCallbackWithLongTimeout() {
    driver.manage().timeouts().setScriptTimeout(500, TimeUnit.MILLISECONDS);
    driver.get(pages.ajaxyPage);
    try {
      executor.executeAsyncScript(
          "var callback = arguments[arguments.length - 1];" +
          "window.setTimeout(callback, 1500);");
      fail("Should have thrown a TimeOutException!");
    } catch (TimeoutException exception) {
      // Do nothing.
    }
  }

  @JavascriptEnabled @Test
  public void shouldDetectPageLoadsWhileWaitingOnAnAsyncScriptAndReturnAnError() {
    driver.get(pages.ajaxyPage);
    driver.manage().timeouts().setScriptTimeout(100, TimeUnit.MILLISECONDS);
    try {
      executor.executeAsyncScript("window.location = '" + pages.dynamicPage + "';");
      fail();
    } catch (WebDriverException expected) {
    }
  }

  @JavascriptEnabled @Test
  public void shouldCatchErrorsWhenExecutingInitialScript() {
    driver.get(pages.ajaxyPage);
    try {
      executor.executeAsyncScript("throw Error('you should catch this!');");
      fail();
    } catch (WebDriverException expected) {
    }
  }

  @Ignore(value = {ANDROID},
      reason = "Android: Emulator is too slow and latency causes test to fall out of sync with app;")
  @JavascriptEnabled @Test
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

  @JavascriptEnabled @Test
  public void shouldBeAbleToPassMultipleArgumentsToAsyncScripts() {
    driver.get(pages.ajaxyPage);
    Number result = (Number) ((JavascriptExecutor) driver)
        .executeAsyncScript("arguments[arguments.length - 1](arguments[0] + arguments[1]);", 1, 2);
    assertEquals(3, result.intValue());
  }

  @JavascriptEnabled @Test
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

  private long getNumDivElements() {
    // Selenium does not support "findElements" yet, so we have to do this through a script.
    return (Long) ((JavascriptExecutor) driver).executeScript(
          "return document.getElementsByTagName('div').length;");
  }

}
