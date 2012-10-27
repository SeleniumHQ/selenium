/*
Copyright 2007-2009 Selenium committers

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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.Files;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA_MOBILE;

public class ExecutingJavascriptTest extends JUnit4TestBase {

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAString() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return document.title;");

    assertTrue(result instanceof String);
    assertEquals("XHTML Test Page", result);
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnALong() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.nestedPage);

    Object result = executeScript("return document.getElementsByName('checky').length;");

    assertTrue(result.getClass().getName(), result instanceof Long);
    assertTrue((Long) result > 1);
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return document.getElementById('id1');");

    assertNotNull(result);
    assertThat(result, instanceOf(WebElement.class));
    assertEquals("a", ((WebElement) result).getTagName().toLowerCase());
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return true;");

    assertNotNull(result);
    assertTrue(result instanceof Boolean);
    assertTrue((Boolean) result);
  }

  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAStringsArray() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    List<Object> expectedResult = new ArrayList<Object>();
    expectedResult.add("zero");
    expectedResult.add("one");
    expectedResult.add("two");
    Object result = ((JavascriptExecutor) driver).executeScript(
        "return ['zero', 'one', 'two'];");

    ExecutingJavascriptTest.compareLists(expectedResult, (List<Object>) result);
  }

  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnArray() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    List<Object> expectedResult = new ArrayList<Object>();
    expectedResult.add("zero");
    List<Object> subList = new ArrayList<Object>();
    subList.add(true);
    subList.add(false);
    expectedResult.add(subList);
    Object result = executeScript("return ['zero', [true, false]];");
    assertNotNull(result);
    assertTrue("result was: " + result + " (" + result.getClass() + ")", result instanceof List);
    List<Object> list = (List<Object>) result;
    assertTrue(compareLists(expectedResult, list));
  }


  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteJavascriptAndReturnABasicObjectLiteral() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);

    Object result = executeScript("return {abc: '123', tired: false};");
    assertTrue("result was: " + result + " (" + result.getClass() + ")", result instanceof Map);
    Map<String, Object> map = (Map<String, Object>) result;

    Map<String, Object> expected = new HashMap<String, Object>();
    expected.put("abc", "123");
    expected.put("tired", false);

    // Cannot do an exact match; Firefox 4 inserts a few extra keys in our object; this is OK, as
    // long as the expected keys are there.
    assertThat("Expected:<" + expected + ">, but was:<" + map + ">",
               map.size(), greaterThanOrEqualTo(expected.size()));
    for (Map.Entry<String, Object> entry : expected.entrySet()) {
      assertEquals("Difference at key:<" + entry.getKey() + ">",
                   entry.getValue(), map.get(entry.getKey()));
    }
  }

  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnObjectLiteral() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);

    Map<String, Object> expectedResult = new HashMap<String, Object>() {
      {
        put("foo", "bar");
        put("baz", Arrays.asList("a", "b", "c"));
        put("person", new HashMap<String, String>() {
          {
            put("first", "John");
            put("last", "Doe");
          }
        });
      }
    };

    Object result = executeScript(
        "return {foo:'bar', baz: ['a', 'b', 'c'], " +
        "person: {first: 'John',last: 'Doe'}};");
    assertTrue("result was: " + result + " (" + result.getClass() + ")", result instanceof Map);

    Map<String, Object> map = (Map<String, Object>) result;
    assertThat("Expected:<" + expectedResult + ">, but was:<" + map + ">",
               map.size(), greaterThanOrEqualTo(3));
    assertEquals("bar", map.get("foo"));
    assertTrue(compareLists((List<?>) expectedResult.get("baz"),
                            (List<?>) map.get("baz")));

    Map<String, String> person = (Map<String, String>) map.get("person");
    assertThat("Expected:<{first:John, last:Doe}>, but was:<" + person + ">",
               person.size(), greaterThanOrEqualTo(2));
    assertEquals("John", person.get("first"));
    assertEquals("Doe", person.get("last"));
  }

  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  @Ignore({IE, HTMLUNIT, OPERA, OPERA_MOBILE})
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAComplexObject() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);

    Object result = executeScript("return window.location;");

    assertTrue("result was: " + result + " (" + result.getClass() + ")", result instanceof Map);
    Map<String, Object> map = (Map<String, Object>) result;
    assertEquals("http:", map.get("protocol"));
    assertEquals(pages.javascriptPage, map.get("href"));
  }

  private static boolean compareLists(List<?> first, List<?> second) {
    if (first.size() != second.size()) {
      return false;
    }
    for (int i = 0; i < first.size(); ++i) {
      if (first.get(i) instanceof List<?>) {
        if (!compareLists((List<?>) first.get(i), (List<?>) second.get(i))) {
          return false;
        }
      } else {
        if (!first.get(i).equals(second.get(i))) {
          return false;
        }
      }
    }
    return true;
  }

  @JavascriptEnabled
  @Test
  public void testPassingAndReturningALongShouldReturnAWholeNumber() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    Long expectedResult = 1L;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertTrue("Expected result to be an Integer or Long but was a " +
               result.getClass(), result instanceof Integer || result instanceof Long);
    assertEquals(expectedResult.longValue(), result);
  }

  @JavascriptEnabled
  @Test
  public void testPassingAndReturningADoubleShouldReturnADecimal() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    Double expectedResult = 1.2;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertTrue("Expected result to be a Double or Float but was a " +
               result.getClass(), result instanceof Float || result instanceof Double);
    assertEquals(expectedResult.doubleValue(), result);
  }

  @JavascriptEnabled
  @Test
  public void testShouldThrowAnExceptionWhenTheJavascriptIsBad() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.xhtmlTestPage);

    try {
      executeScript("return squiggle();");
      fail("Expected an exception");
    } catch (Exception e) {
      // This is expected
      assertFalse(e.getMessage(), e.getMessage().startsWith("null "));
    }
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToCallFunctionsDefinedOnThePage() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    executeScript("displayMessage('I like cheese');");
    String text = driver.findElement(By.id("result")).getText();

    assertEquals("I like cheese", text.trim());
  }

  private Object executeScript(String script, Object... args) {
    return ((JavascriptExecutor) driver).executeScript(script, args);
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToPassAStringAnAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    String value =
        (String) executeScript("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish");

    assertEquals("fish", value);
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToPassABooleanAnAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    boolean value = (Boolean) executeScript("return arguments[0] == true;", true);

    assertTrue(value);
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToPassANumberAnAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    boolean value = (Boolean) executeScript("return arguments[0] == 1 ? true : false;", 1);

    assertTrue(value);
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToPassAWebElementAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    WebElement button = driver.findElement(By.id("plainButton"));
    String value =
        (String) executeScript(
            "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];",
            button);

    assertEquals("plainButton", value);
  }

  @JavascriptEnabled
  @Test
  public void testPassingArrayAsOnlyArgumentFlattensArray() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    Object[] array = new Object[]{"zero", 1, true, 3.14159, false};
    String value = (String) executeScript("return arguments[0]", array);
    assertEquals(array[0], value);
  }

  @JavascriptEnabled
  @Ignore({OPERA, OPERA_MOBILE})
  @Test
  public void testShouldBeAbleToPassAnArrayAsAdditionalArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    Object[] array = new Object[]{"zero", 1, true, 3.14159, false};
    long length = (Long) executeScript("return arguments[1].length", "string", array);
    assertEquals(array.length, length);
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToPassACollectionAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    Collection<Object> collection = new ArrayList<Object>();
    collection.add("Cheddar");
    collection.add("Brie");
    collection.add(7);
    long length = (Long) executeScript("return arguments[0].length", collection);
    assertEquals(collection.size(), length);

    collection = new HashSet<Object>();
    collection.add("Gouda");
    collection.add("Stilton");
    collection.add("Stilton");
    collection.add(true);
    length = (Long) executeScript("return arguments[0].length", collection);
    assertEquals(collection.size(), length);
  }

  @JavascriptEnabled
  @Test
  public void testShouldThrowAnExceptionIfAnArgumentIsNotValid() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    try {
      executeScript("return arguments[0];", driver);
      fail("Exception should have been thrown");
    } catch (IllegalArgumentException e) {
      // this is expected
    }
  }

  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToPassInMoreThanOneArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(pages.javascriptPage);
    String result = (String) executeScript("return arguments[0] + arguments[1];", "one", "two");

    assertEquals("onetwo", result);
  }

  @JavascriptEnabled
  @Test
  @Ignore({OPERA, OPERA_MOBILE})
  public void testShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo() {
    driver.get(pages.richTextPage);

    driver.switchTo().frame("editFrame");
    WebElement body =
        (WebElement) ((JavascriptExecutor) driver).executeScript("return document.body");
    String text = body.getText();
    driver.switchTo().defaultContent();

    assertEquals("", text);
  }

  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToReturnAnArrayOfWebElements() {
    driver.get(pages.formPage);

    List<WebElement> items = (List<WebElement>) ((JavascriptExecutor) driver)
        .executeScript("return document.getElementsByName('snack');");

    assertFalse(items.isEmpty());
  }

  @JavascriptEnabled
  @Test
  public void testJavascriptStringHandlingShouldWorkAsExpected() {
    driver.get(pages.javascriptPage);

    String value = (String) executeScript("return '';");
    assertEquals("", value);

    value = (String) executeScript("return undefined;");
    assertNull(value);

    value = (String) executeScript("return ' '");
    assertEquals(" ", value);
  }

  @JavascriptEnabled
  @Ignore(OPERA)
  @Test
  public void testShouldBeAbleToExecuteABigChunkOfJavascriptCode() throws IOException {
    driver.get(pages.javascriptPage);

    File jqueryFile = InProject.locate("common/src/web/jquery-1.3.2.js");
    String jquery = Files.toString(jqueryFile, Charset.forName("US-ASCII"));
    assertTrue("The javascript code should be at least 50 KB.", jquery.length() > 50000);
    // This should not throw an exception ...
    executeScript(jquery);
  }

  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  @Test
  public void testShouldBeAbleToExecuteScriptAndReturnElementsList() {
    driver.get(pages.formPage);
    String scriptToExec = "return document.getElementsByName('snack');";

    List<WebElement> resultsList = (List<WebElement>) ((JavascriptExecutor) driver)
        .executeScript(scriptToExec);

    assertFalse(resultsList.isEmpty());
  }

  @JavascriptEnabled
  @NeedsFreshDriver
  @NoDriverAfterTest
  @Ignore(reason = "Failure indicates hang condition, which would break the" +
      " test suite. Really needs a timeout set.")
  @Test
  public void testShouldThrowExceptionIfExecutingOnNoPage() {
    try {
      ((JavascriptExecutor) driver).executeScript("return 1;");
    } catch (WebDriverException e) {
      // Expected
      return;
    }
    fail("Expected exception to be thrown");
  }

  @JavascriptEnabled
  @Ignore(OPERA)
  @Test
  public void testShouldBeAbleToCreateAPersistentValue() {
    driver.get(pages.formPage);

    executeScript("document.alerts = []");
    executeScript("document.alerts.push('hello world');");
    String text = (String) executeScript("return document.alerts.shift()");

    assertEquals("hello world", text);
  }

  @JavascriptEnabled
  @Ignore(OPERA)
  @Test
  public void testCanHandleAnArrayOfElementsAsAnObjectArray() {
    driver.get(pages.formPage);

    List<WebElement> forms = driver.findElements(By.tagName("form"));
    Object[] args = new Object[]{forms};

    String name = (String) ((JavascriptExecutor) driver).executeScript(
        "return arguments[0][0].tagName", args);

    assertEquals("form", name.toLowerCase());
  }

  @JavascriptEnabled
  @Ignore(value = {ANDROID, HTMLUNIT, OPERA, OPERA_MOBILE},
          reason = "Opera and HtmlUnit obey the method contract. Android not tested")
  @Test
  public void testCanPassAMapAsAParameter() {
    driver.get(pages.simpleTestPage);

    List<Integer> nums = ImmutableList.of(1, 2);
    Map<String, Object> args = ImmutableMap.of("bar", "test", "foo", nums);

    Object res = ((JavascriptExecutor) driver).executeScript("return arguments[0]['foo'][1]", args);

    assertEquals(2, ((Number) res).intValue());
  }
}
