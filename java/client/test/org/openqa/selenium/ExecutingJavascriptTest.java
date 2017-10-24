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

import static java.nio.charset.StandardCharsets.US_ASCII;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeTrue;
import static org.openqa.selenium.testing.Driver.ALL;
import static org.openqa.selenium.testing.Driver.CHROME;
import static org.openqa.selenium.testing.Driver.FIREFOX;
import static org.openqa.selenium.testing.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Driver.IE;
import static org.openqa.selenium.testing.Driver.MARIONETTE;
import static org.openqa.selenium.testing.Driver.PHANTOMJS;
import static org.openqa.selenium.testing.Driver.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.InProject;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

public class ExecutingJavascriptTest extends JUnit4TestBase {

  @Before
  public void setUp() throws Exception {
    assumeTrue(driver instanceof JavascriptExecutor);
  }

  private Object executeScript(String script, Object... args) {
    return ((JavascriptExecutor) driver).executeScript(script, args);
  }

  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAString() {
    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return document.title;");

    assertTrue(result instanceof String);
    assertEquals("XHTML Test Page", result);
  }

  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnALong() {
    driver.get(pages.nestedPage);

    Object result = executeScript("return document.getElementsByName('checky').length;");

    assertTrue(result.getClass().getName(), result instanceof Long);
    assertTrue((Long) result > 1);
  }

  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement() {
    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return document.getElementById('id1');");

    assertNotNull(result);
    assertThat(result, instanceOf(WebElement.class));
    assertEquals("a", ((WebElement) result).getTagName().toLowerCase());
  }

  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean() {
    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return true;");

    assertNotNull(result);
    assertTrue(result instanceof Boolean);
    assertTrue((Boolean) result);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAStringsArray() {
    driver.get(pages.javascriptPage);
    List<Object> expectedResult = new ArrayList<>();
    expectedResult.add("zero");
    expectedResult.add("one");
    expectedResult.add("two");
    Object result = ((JavascriptExecutor) driver).executeScript(
        "return ['zero', 'one', 'two'];");

    ExecutingJavascriptTest.compareLists(expectedResult, (List<Object>) result);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnArray() {
    driver.get(pages.javascriptPage);
    List<Object> expectedResult = new ArrayList<>();
    expectedResult.add("zero");
    List<Object> subList = new ArrayList<>();
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
  @Test
  public void testShouldBeAbleToExecuteJavascriptAndReturnABasicObjectLiteral() {
    driver.get(pages.javascriptPage);

    Object result = executeScript("return {abc: '123', tired: false};");
    assertTrue("result was: " + result + " (" + result.getClass() + ")", result instanceof Map);
    Map<String, Object> map = (Map<String, Object>) result;

    Map<String, Object> expected = new HashMap<>();
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
  @Test
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnObjectLiteral() {
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
  @Test
  @Ignore(IE)
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAComplexObject() {
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

  @Test
  public void testPassingAndReturningALongShouldReturnAWholeNumber() {
    driver.get(pages.javascriptPage);
    Long expectedResult = 1L;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertTrue("Expected result to be an Integer or Long but was a " +
               result.getClass(), result instanceof Integer || result instanceof Long);
    assertEquals(expectedResult, result);
  }

  @Test
  public void testPassingAndReturningADoubleShouldReturnADecimal() {
    driver.get(pages.javascriptPage);
    Double expectedResult = 1.2;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertTrue("Expected result to be a Double or Float but was a " +
               result.getClass(), result instanceof Float || result instanceof Double);
    assertEquals(expectedResult, result);
  }

  @Test
  public void testShouldThrowAnExceptionWhenTheJavascriptIsBad() {
    driver.get(pages.xhtmlTestPage);

    Throwable t = catchThrowable(() -> executeScript("return squiggle();"));
    assertThat(t, instanceOf(WebDriverException.class));
    assertThat(t.getMessage(), not(startsWith("null ")));
  }

  @Test
  @Ignore(CHROME)
  @Ignore(IE)
  @Ignore(PHANTOMJS)
  @Ignore(SAFARI)
  @Ignore(MARIONETTE)
  @NotYetImplemented(HTMLUNIT)
  public void testShouldThrowAnExceptionWithMessageAndStacktraceWhenTheJavascriptIsBad() {
    driver.get(pages.xhtmlTestPage);

    String js = "function functionB() { throw Error('errormessage'); };"
                + "function functionA() { functionB(); };"
                + "functionA();";
    Throwable t = catchThrowable(() -> executeScript(js));
    assertThat(t, instanceOf(WebDriverException.class));
    assertThat(t.getMessage(), containsString("errormessage"));

    Throwable rootCause = Throwables.getRootCause(t);
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

  @Test
  public void testShouldBeAbleToCallFunctionsDefinedOnThePage() {
    driver.get(pages.javascriptPage);
    executeScript("displayMessage('I like cheese');");
    String text = driver.findElement(By.id("result")).getText();

    assertEquals("I like cheese", text.trim());
  }

  @Test
  public void testShouldBeAbleToPassAStringAnAsArgument() {
    driver.get(pages.javascriptPage);
    String value =
        (String) executeScript("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish");

    assertEquals("fish", value);
  }

  @Test
  public void testShouldBeAbleToPassABooleanAsArgument() {
    driver.get(pages.javascriptPage);
    boolean value = (Boolean) executeScript("return arguments[0] == true;", true);

    assertTrue(value);
  }

  @Test
  public void testShouldBeAbleToPassANumberAnAsArgument() {
    driver.get(pages.javascriptPage);
    boolean value = (Boolean) executeScript("return arguments[0] == 1 ? true : false;", 1);

    assertTrue(value);
  }

  @Test
  public void testShouldBeAbleToPassAWebElementAsArgument() {
    driver.get(pages.javascriptPage);
    WebElement button = driver.findElement(By.id("plainButton"));
    String value =
        (String) executeScript(
            "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];",
            button);

    assertEquals("plainButton", value);
  }

  @Test
  public void testPassingArrayAsOnlyArgumentFlattensArray() {
    driver.get(pages.javascriptPage);
    Object[] array = new Object[]{"zero", 1, true, 3.14159, false};
    String value = (String) executeScript("return arguments[0]", array);
    assertEquals(array[0], value);
  }

  @Test
  public void testShouldBeAbleToPassAnArrayAsAdditionalArgument() {
    driver.get(pages.javascriptPage);
    Object[] array = new Object[]{"zero", 1, true, 3.14159, false};
    long length = (Long) executeScript("return arguments[1].length", "string", array);
    assertEquals(array.length, length);
  }

  @Test
  public void testShouldBeAbleToPassACollectionAsArgument() {
    driver.get(pages.javascriptPage);
    Collection<Object> collection = new ArrayList<>();
    collection.add("Cheddar");
    collection.add("Brie");
    collection.add(7);
    long length = (Long) executeScript("return arguments[0].length", collection);
    assertEquals(collection.size(), length);

    collection = new HashSet<>();
    collection.add("Gouda");
    collection.add("Stilton");
    collection.add("Stilton");
    collection.add(true);
    length = (Long) executeScript("return arguments[0].length", collection);
    assertEquals(collection.size(), length);
  }

  @Test
  public void testShouldThrowAnExceptionIfAnArgumentIsNotValid() {
    driver.get(pages.javascriptPage);
    Throwable t = catchThrowable(() -> executeScript("return arguments[0];", driver));
    assertThat(t, instanceOf(IllegalArgumentException.class));
  }

  @Test
  public void testShouldBeAbleToPassInMoreThanOneArgument() {
    driver.get(pages.javascriptPage);
    String result = (String) executeScript("return arguments[0] + arguments[1];", "one", "two");

    assertEquals("onetwo", result);
  }

  @Test
  public void testShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo() {
    driver.get(pages.richTextPage);

    driver.switchTo().frame("editFrame");
    WebElement body = (WebElement) executeScript("return document.body");
    String text = body.getText();
    driver.switchTo().defaultContent();

    assertEquals("", text);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testShouldBeAbleToReturnAnArrayOfWebElements() {
    driver.get(pages.formPage);

    List<WebElement> items = (List<WebElement>) executeScript(
        "return document.getElementsByName('snack');");

    assertFalse(items.isEmpty());
  }

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

  @Test
  public void testShouldBeAbleToExecuteABigChunkOfJavascriptCode() throws IOException {
    driver.get(pages.javascriptPage);

    Path jqueryFile = InProject.locate("common/src/web/jquery-1.3.2.js");
    String jquery = new String(Files.readAllBytes(jqueryFile), US_ASCII);
    assertTrue("The javascript code should be at least 50 KB.", jquery.length() > 50000);
    // This should not throw an exception ...
    executeScript(jquery);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void testShouldBeAbleToExecuteScriptAndReturnElementsList() {
    driver.get(pages.formPage);
    String scriptToExec = "return document.getElementsByName('snack');";

    List<WebElement> resultsList = (List<WebElement>) executeScript(scriptToExec);

    assertFalse(resultsList.isEmpty());
  }

  @NeedsFreshDriver
  @NoDriverAfterTest
  @Test
  @Ignore(value = ALL, reason = "Failure indicates hang condition, which would break the" +
                                " test suite. Really needs a timeout set.")
  public void testShouldThrowExceptionIfExecutingOnNoPage() {
    Throwable t = catchThrowable(() -> executeScript("return 1;"));
    assertThat(t, instanceOf(WebDriverException.class));
  }

  @Test
  public void testShouldBeAbleToCreateAPersistentValue() {
    driver.get(pages.formPage);

    executeScript("document.alerts = []");
    executeScript("document.alerts.push('hello world');");
    String text = (String) executeScript("return document.alerts.shift()");

    assertEquals("hello world", text);
  }

  @Test
  public void testCanHandleAnArrayOfElementsAsAnObjectArray() {
    driver.get(pages.formPage);

    List<WebElement> forms = driver.findElements(By.tagName("form"));
    Object[] args = new Object[]{forms};

    String name = (String) ((JavascriptExecutor) driver).executeScript(
        "return arguments[0][0].tagName", args);

    assertEquals("form", name.toLowerCase());
  }

  @Test
  public void testCanPassAMapAsAParameter() {
    driver.get(pages.simpleTestPage);

    List<Integer> nums = ImmutableList.of(1, 2);
    Map<String, Object> args = ImmutableMap.of("bar", "test", "foo", nums);

    Object res = ((JavascriptExecutor) driver).executeScript("return arguments[0]['foo'][1]", args);

    assertEquals(2, ((Number) res).intValue());
  }

  @Test
  public void testShouldThrowAnExceptionWhenArgumentsWithStaleElementPassed() {
    driver.get(pages.simpleTestPage);

    final WebElement el = driver.findElement(By.id("oneline"));

    driver.get(pages.simpleTestPage);

    Map<String, Object> args = new HashMap<String, Object>() {
      {
        put("key", Arrays.asList("a", new Object[]{"zero", 1, true, 3.14159, false, el}, "c"));
      }
    };

    Throwable t = catchThrowable(() -> executeScript("return undefined;", args));
    assertThat(t, instanceOf(StaleElementReferenceException.class));
  }

  @Test
  @Ignore(CHROME)
  @Ignore(IE)
  @Ignore(PHANTOMJS)
  @Ignore(SAFARI)
  @Ignore(MARIONETTE)
  public void testShouldBeAbleToReturnADateObject() {
    driver.get(pages.simpleTestPage);

    String date = (String) executeScript("return new Date();");

    try {
      new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").parse(date);
    } catch (ParseException e) {
      fail();
    }
  }

  @Test(timeout = 10000)
  @Ignore(CHROME)
  @Ignore(IE)
  @Ignore(PHANTOMJS)
  @Ignore(SAFARI)
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/904")
  public void shouldReturnDocumentElementIfDocumentIsReturned() {
    driver.get(pages.simpleTestPage);

    Object value = executeScript("return document");

    assertTrue(value instanceof WebElement);
    assertTrue(((WebElement) value).getText().contains("A single line of text"));
  }

  @Test(timeout = 10000)
  @Ignore(value = IE, reason = "returns WebElement")
  @Ignore(PHANTOMJS)
  @Ignore(SAFARI)
  @Ignore(HTMLUNIT)
  public void shouldHandleObjectThatThatHaveToJSONMethod() {
    driver.get(pages.simpleTestPage);

    Object value = executeScript("return window.performance.timing");

    assertTrue(value instanceof Map);
  }

  @Test(timeout = 10000)
  @Ignore(CHROME)
  @Ignore(value = IE, issue = "540")
  @Ignore(PHANTOMJS)
  @Ignore(SAFARI)
  @Ignore(value = FIREFOX, issue = "540")
  @Ignore(HTMLUNIT)
  @Ignore(value = MARIONETTE, issue = "https://github.com/mozilla/geckodriver/issues/914")
  public void shouldHandleRecursiveStructures() {
    driver.get(pages.simpleTestPage);

    Object value = executeScript("var obj1 = {}; var obj2 = {}; obj1['obj2'] = obj2; obj2['obj1'] = obj1; return obj1");

    assertTrue(value instanceof Map);
  }
}
