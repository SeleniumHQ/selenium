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
import static java.nio.charset.StandardCharsets.US_ASCII;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.openqa.selenium.By.id;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.openqa.selenium.build.InProject;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NeedsFreshDriver;
import org.openqa.selenium.testing.NotYetImplemented;

class ExecutingJavascriptTest extends JupiterTestBase {

  @BeforeEach
  public void setUp() {
    assumeTrue(driver instanceof JavascriptExecutor);
  }

  private Object executeScript(String script, Object... args) {
    return ((JavascriptExecutor) driver).executeScript(script, args);
  }

  @Test
  void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAString() {
    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return document.title;");

    assertThat(result).isInstanceOf(String.class).isEqualTo("XHTML Test Page");
  }

  @Test
  void testShouldBeAbleToExecuteSimpleJavascriptAndReturnALong() {
    driver.get(pages.nestedPage);

    Object result = executeScript("return document.getElementsByName('checky').length;");

    assertThat(result).isInstanceOf(Long.class);
    assertThat((Long) result).isGreaterThan(1);
  }

  @Test
  void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement() {
    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return document.getElementById('id1');");

    assertThat(result).isInstanceOf(WebElement.class);
    assertThat(((WebElement) result).getTagName()).isEqualToIgnoringCase("a");
  }

  @Test
  void testShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean() {
    driver.get(pages.xhtmlTestPage);

    Object result = executeScript("return true;");

    assertThat(result).isInstanceOf(Boolean.class);
    assertThat((Boolean) result).isTrue();
  }

  @SuppressWarnings("unchecked")
  @Test
  void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAStringsArray() {
    driver.get(pages.javascriptPage);

    Object result = ((JavascriptExecutor) driver).executeScript("return ['zero', 'one', 'two'];");

    assertThat(result).isInstanceOf(List.class);
    assertThat((List<?>) result).isEqualTo(ImmutableList.of("zero", "one", "two"));
  }

  @SuppressWarnings("unchecked")
  @Test
  void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnArray() {
    driver.get(pages.javascriptPage);
    List<Object> expectedResult = new ArrayList<>();
    expectedResult.add("zero");
    List<Object> subList = new ArrayList<>();
    subList.add(true);
    subList.add(false);
    expectedResult.add(subList);
    Object result = executeScript("return ['zero', [true, false]];");
    assertThat(result).isInstanceOf(List.class);
    assertThat((List<Object>) result).isEqualTo(expectedResult);
  }

  @SuppressWarnings("unchecked")
  @Test
  void testShouldBeAbleToExecuteJavascriptAndReturnABasicObjectLiteral() {
    driver.get(pages.javascriptPage);

    Object result = executeScript("return {abc: '123', tired: false};");
    assertThat(result).isInstanceOf(Map.class);
    Map<String, Object> map = (Map<String, Object>) result;

    Map<String, Object> expected = ImmutableMap.of("abc", "123", "tired", false);

    // Cannot do an exact match; Firefox 4 inserts a few extra keys in our object; this is OK, as
    // long as the expected keys are there.
    assertThat(map.size()).isGreaterThanOrEqualTo(expected.size());
    for (Map.Entry<String, Object> entry : expected.entrySet()) {
      assertThat(map.get(entry.getKey()))
          .as("Value by key %s, )", entry.getKey())
          .isEqualTo(entry.getValue());
    }
  }

  @SuppressWarnings("unchecked")
  @Test
  void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnObjectLiteral() {
    driver.get(pages.javascriptPage);

    Map<String, Object> expectedResult =
        ImmutableMap.of(
            "foo", "bar",
            "baz", Arrays.asList("a", "b", "c"),
            "person",
                ImmutableMap.of(
                    "first", "John",
                    "last", "Doe"));

    Object result =
        executeScript(
            "return {foo:'bar', baz: ['a', 'b', 'c'], " + "person: {first: 'John',last: 'Doe'}};");
    assertThat(result).isInstanceOf(Map.class);

    Map<String, Object> map = (Map<String, Object>) result;
    assertThat(map.size()).isGreaterThanOrEqualTo(3);
    assertThat(map.get("foo")).isEqualTo("bar");
    assertThat((List<?>) map.get("baz")).isEqualTo((List<?>) expectedResult.get("baz"));

    Map<String, String> person = (Map<String, String>) map.get("person");
    assertThat(person.size()).isGreaterThanOrEqualTo(2);
    assertThat(person.get("first")).isEqualTo("John");
    assertThat(person.get("last")).isEqualTo("Doe");
  }

  @SuppressWarnings("unchecked")
  @Test
  @Ignore(IE)
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAComplexObject() {
    driver.get(pages.javascriptPage);

    Object result = executeScript("return window.location;");

    assertThat(result).isInstanceOf(Map.class);
    Map<String, Object> map = (Map<String, Object>) result;
    assertThat(map.get("protocol")).isEqualTo("http:");
    assertThat(map.get("href")).isEqualTo(pages.javascriptPage);
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
  void testPassingAndReturningALongShouldReturnAWholeNumber() {
    driver.get(pages.javascriptPage);
    Long expectedResult = 1L;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertThat(result).isInstanceOfAny(Integer.class, Long.class).isEqualTo(expectedResult);
  }

  @Test
  void testReturningOverflownLongShouldReturnADouble() {
    driver.get(pages.javascriptPage);
    Double expectedResult = 6.02214129e+23;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertThat(result).isInstanceOf(Double.class).isEqualTo(expectedResult);
  }

  @Test
  void testPassingAndReturningADoubleShouldReturnADecimal() {
    driver.get(pages.javascriptPage);
    Double expectedResult = 1.2;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertThat(result).isInstanceOfAny(Float.class, Double.class).isEqualTo(expectedResult);
  }

  @Test
  void testShouldThrowAnExceptionWhenTheJavascriptIsBad() {
    driver.get(pages.xhtmlTestPage);

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> executeScript("return squiggle();"))
        .satisfies(t -> assertThat(t.getMessage()).doesNotStartWith("null "));
  }

  @Test
  @Ignore(CHROME)
  @Ignore(EDGE)
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
  @Ignore(FIREFOX)
  @NotYetImplemented(HTMLUNIT)
  public void testShouldThrowAnExceptionWithMessageAndStacktraceWhenTheJavascriptIsBad() {
    driver.get(pages.xhtmlTestPage);

    String js =
        "function functionB() { throw Error('errormessage'); };"
            + "function functionA() { functionB(); };"
            + "functionA();";
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> executeScript(js))
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
  void testShouldBeAbleToCallFunctionsDefinedOnThePage() {
    driver.get(pages.javascriptPage);
    executeScript("displayMessage('I like cheese');");
    String text = driver.findElement(By.id("result")).getText();

    assertThat(text.trim()).isEqualTo("I like cheese");
  }

  @Test
  void testShouldBeAbleToPassAStringAnAsArgument() {
    driver.get(pages.javascriptPage);
    String value =
        (String) executeScript("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish");

    assertThat(value).isEqualTo("fish");
  }

  @Test
  void testShouldBeAbleToPassABooleanAsArgument() {
    driver.get(pages.javascriptPage);
    boolean value = (Boolean) executeScript("return arguments[0] == true;", true);
    assertThat(value).isTrue();
  }

  @Test
  void testShouldBeAbleToPassANumberAnAsArgument() {
    driver.get(pages.javascriptPage);
    boolean value = (Boolean) executeScript("return arguments[0] == 1 ? true : false;", 1);
    assertThat(value).isTrue();
  }

  @Test
  void testShouldBeAbleToPassAWebElementAsArgument() {
    driver.get(pages.javascriptPage);
    WebElement button = driver.findElement(By.id("plainButton"));
    String value =
        (String)
            executeScript(
                "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return"
                    + " arguments[0]['flibble'];",
                button);

    assertThat(value).isEqualTo("plainButton");
  }

  @Test
  void testPassingArrayAsOnlyArgumentFlattensArray() {
    driver.get(pages.javascriptPage);
    Object[] array = new Object[] {"zero", 1, true, 42.4242, false};
    String value = (String) executeScript("return arguments[0]", array);
    assertThat(value).isEqualTo(array[0]);
  }

  @Test
  void testShouldBeAbleToPassAnArrayAsAdditionalArgument() {
    driver.get(pages.javascriptPage);
    Object[] array = new Object[] {"zero", 1, true, 42.4242, false};
    long length = (Long) executeScript("return arguments[1].length", "string", array);
    assertThat(length).isEqualTo(array.length);
  }

  @Test
  void testShouldBeAbleToPassACollectionAsArgument() {
    driver.get(pages.javascriptPage);
    Collection<Object> collection = new ArrayList<>();
    collection.add("Cheddar");
    collection.add("Brie");
    collection.add(7);
    long length = (Long) executeScript("return arguments[0].length", collection);
    assertThat(length).isEqualTo(collection.size());

    collection = new HashSet<>();
    collection.add("Gouda");
    collection.add("Stilton");
    collection.add("Stilton");
    collection.add(true);
    length = (Long) executeScript("return arguments[0].length", collection);
    assertThat(length).isEqualTo(collection.size());
  }

  @Test
  void testShouldThrowAnExceptionIfAnArgumentIsNotValid() {
    driver.get(pages.javascriptPage);
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> executeScript("return arguments[0];", driver));
  }

  @Test
  void testShouldBeAbleToPassInMoreThanOneArgument() {
    driver.get(pages.javascriptPage);
    String result = (String) executeScript("return arguments[0] + arguments[1];", "one", "two");
    assertThat(result).isEqualTo("onetwo");
  }

  @Test
  void testShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo() {
    driver.get(pages.richTextPage);

    driver.switchTo().frame("editFrame");
    WebElement body = (WebElement) executeScript("return document.body");
    String text = body.getText();
    driver.switchTo().defaultContent();

    assertThat(text).isEmpty();
  }

  @SuppressWarnings("unchecked")
  @Test
  void testShouldBeAbleToReturnAnArrayOfWebElements() {
    driver.get(pages.formPage);

    List<WebElement> items =
        (List<WebElement>) executeScript("return document.getElementsByName('snack');");

    assertThat(items).isNotEmpty();
  }

  @Test
  void testJavascriptStringHandlingShouldWorkAsExpected() {
    driver.get(pages.javascriptPage);

    String value = (String) executeScript("return '';");
    assertThat(value).isEmpty();

    value = (String) executeScript("return undefined;");
    assertThat(value).isNull();

    value = (String) executeScript("return ' '");
    assertThat(value).isEqualTo(" ");
  }

  @Test
  void testShouldBeAbleToExecuteABigChunkOfJavascriptCode() throws IOException {
    driver.get(pages.javascriptPage);

    Path jqueryFile = InProject.locate("common/src/web/js/jquery-3.5.1.min.js");
    String jquery = new String(Files.readAllBytes(jqueryFile), US_ASCII);
    assertThat(jquery.length())
        .describedAs("The javascript code should be at least 50 KB.")
        .isGreaterThan(50000);
    // This should not throw an exception ...
    executeScript(jquery);
  }

  @SuppressWarnings("unchecked")
  @Test
  void testShouldBeAbleToExecuteScriptAndReturnElementsList() {
    driver.get(pages.formPage);
    String scriptToExec = "return document.getElementsByName('snack');";

    List<WebElement> resultsList = (List<WebElement>) executeScript(scriptToExec);

    assertThat(resultsList).isNotEmpty();
  }

  @NeedsFreshDriver
  @Test
  @NotYetImplemented(
      value = HTMLUNIT,
      reason = "HtmlUnit: can't execute JavaScript before a page is loaded")
  @Ignore(SAFARI)
  public void testShouldBeAbleToExecuteScriptOnNoPage() {
    String text = (String) executeScript("return 'test';");
    assertThat(text).isEqualTo("test");
  }

  @Test
  void testShouldBeAbleToCreateAPersistentValue() {
    driver.get(pages.formPage);

    executeScript("document.alerts = []");
    executeScript("document.alerts.push('hello world');");
    String text = (String) executeScript("return document.alerts.shift()");

    assertThat(text).isEqualTo("hello world");
  }

  @Test
  void testCanHandleAnArrayOfElementsAsAnObjectArray() {
    driver.get(pages.formPage);

    List<WebElement> forms = driver.findElements(By.tagName("form"));
    Object[] args = new Object[] {forms};

    String name =
        (String)
            ((JavascriptExecutor) driver).executeScript("return arguments[0][0].tagName", args);

    assertThat(name).isEqualToIgnoringCase("form");
  }

  @Test
  void testCanPassAMapAsAParameter() {
    driver.get(pages.simpleTestPage);

    List<Integer> nums = Arrays.asList(1, 2);
    Map<String, Object> args = ImmutableMap.of("bar", "test", "foo", nums);

    Object res = ((JavascriptExecutor) driver).executeScript("return arguments[0]['foo'][1]", args);

    assertThat(((Number) res).intValue()).isEqualTo(2);
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldThrowAnExceptionWhenArgumentsWithStaleElementPassed() {
    driver.get(pages.simpleTestPage);

    final WebElement el = driver.findElement(id("oneline"));

    driver.get(pages.simpleTestPage);

    Map<String, Object> args =
        ImmutableMap.of(
            "key", Arrays.asList("a", new Object[] {"zero", 1, true, 42.4242, false, el}, "c"));

    assertThatExceptionOfType(StaleElementReferenceException.class)
        .isThrownBy(() -> executeScript("return undefined;", args));
  }

  @Test
  @Ignore(IE)
  @Ignore(value = CHROME, reason = "https://bugs.chromium.org/p/chromedriver/issues/detail?id=4395")
  public void testShouldBeAbleToReturnADateObject() throws ParseException {
    driver.get(pages.simpleTestPage);

    String date = (String) executeScript("return new Date();");

    new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").parse(date);
  }

  @Test
  @Timeout(10)
  @NotYetImplemented(CHROME)
  @NotYetImplemented(EDGE)
  @Ignore(IE)
  @NotYetImplemented(SAFARI)
  @NotYetImplemented(
      value = FIREFOX,
      reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1502656")
  public void shouldReturnDocumentElementIfDocumentIsReturned() {
    driver.get(pages.simpleTestPage);

    Object value = executeScript("return document");

    assertThat(value).isInstanceOf(WebElement.class);
    assertThat(((WebElement) value).getText()).contains("A single line of text");
  }

  @Test
  @Timeout(10)
  @Ignore(value = IE, reason = "returns WebElement")
  @Ignore(HTMLUNIT)
  public void shouldHandleObjectThatThatHaveToJSONMethod() {
    driver.get(pages.simpleTestPage);

    Object value = executeScript("return window.performance.timing");

    assertThat(value).isInstanceOf(Map.class);
  }

  @Test
  @Timeout(10)
  @Ignore(HTMLUNIT)
  public void shouldHandleRecursiveStructures() {
    driver.get(pages.simpleTestPage);

    assertThatExceptionOfType(JavascriptException.class)
        .isThrownBy(
            () ->
                executeScript(
                    "var obj1 = {}; var obj2 = {}; obj1['obj2'] = obj2; obj2['obj1'] = obj1; return"
                        + " obj1"));
  }

  @Test
  void shouldUnwrapDeeplyNestedWebElementsAsArguments() {
    driver.get(pages.simpleTestPage);

    WebElement expected = driver.findElement(id("oneline"));

    Object args =
        ImmutableMap.of(
            "top", ImmutableMap.of("key", singletonList(ImmutableMap.of("subkey", expected))));
    WebElement seen = (WebElement) executeScript("return arguments[0].top.key[0].subkey", args);

    assertThat(seen).isEqualTo(expected);
  }
}
