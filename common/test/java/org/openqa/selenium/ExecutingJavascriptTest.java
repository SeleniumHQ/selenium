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

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;

public class ExecutingJavascriptTest extends AbstractDriverTestCase {

  @JavascriptEnabled
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAString() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(xhtmlTestPage);

    Object result = executeScript("return document.title;");

    assertTrue(result instanceof String);
    assertEquals("XHTML Test Page", result);
  }

  @JavascriptEnabled
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnALong() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(nestedPage);

    Object result = executeScript("return document.getElementsByName('checky').length;");

    assertTrue(result.getClass().getName(), result instanceof Long);
    assertTrue((Long) result > 1);
  }

  @JavascriptEnabled
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(xhtmlTestPage);

    Object result = executeScript("return document.getElementById('id1');");

    assertNotNull(result);
    assertTrue("Expected WebElement, got: " + result.getClass(), result instanceof WebElement);
  }

  @JavascriptEnabled
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(xhtmlTestPage);

    Object result = executeScript("return true;");

    assertNotNull(result);
    assertTrue(result instanceof Boolean);
    assertTrue((Boolean) result);
  }
  
  @SuppressWarnings("unchecked")
  @JavascriptEnabled
  @Ignore(IE)
  public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAnArray() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    List<Object> expectedResult = new ArrayList<Object>();
    expectedResult.add("zero");
    List<Object> subList = new ArrayList<Object>();
    subList.add(true);
    subList.add(false);
    expectedResult.add(subList);
    Object result = executeScript("return ['zero', [true, false]];");
    assertTrue("result was: " + result + " (" + result.getClass() + ")", result instanceof List);
    List<Object> list = (List<Object>)result;
    assertTrue(compareLists(expectedResult, list));
  }
  
  private boolean compareLists(List<?> first, List<?> second) {
    if (first.size() != second.size()) {
      return false;
    }
    for (int i = 0; i < first.size(); ++i) {
      if (first.get(i) instanceof List<?>) {
        if (!(second instanceof List<?>)) {
          return false;
        } else {
          if (!compareLists((List<?>)first.get(i), (List<?>)second.get(i))) {
            return false;
          }
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
  public void testPassingAndReturningALongShouldReturnAWholeNumber() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    Long expectedResult = 1L;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertTrue("Expected result to be an Integer or Long but was a " +
        result.getClass(), result instanceof Integer || result instanceof Long);
    assertEquals(expectedResult.longValue(), result);
  }
  
  @Ignore(value = {HTMLUNIT, FIREFOX, IE}, reason = "HtmlUnit converts doubles into longs when passing")
  @JavascriptEnabled
  public void testPassingAndReturningADoubleShouldReturnADecimal() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    Double expectedResult = 1.2;
    Object result = executeScript("return arguments[0];", expectedResult);
    assertTrue("Expected result to be a Double or Float but was a " +
        result.getClass(), result instanceof Float || result instanceof Double);
    assertEquals(expectedResult.doubleValue(), result);
  }

  @JavascriptEnabled
  public void testShouldThrowAnExceptionWhenTheJavascriptIsBad() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(xhtmlTestPage);

    try {
      executeScript("return squiggle();");
      fail("Expected an exception");
    } catch (Exception e) {
      // This is expected
    }
  }

  @JavascriptEnabled
  public void testShouldBeAbleToCallFunctionsDefinedOnThePage() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    executeScript("displayMessage('I like cheese');");
    String text = driver.findElement(By.id("result")).getText();

    assertEquals("I like cheese", text.trim());
  }

  private Object executeScript(String script, Object... args) {
    return ((JavascriptExecutor) driver).executeScript(script, args);
  }

  @JavascriptEnabled
  public void testShouldBeAbleToPassAStringAnAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    String
        value =
        (String) executeScript("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish");

    assertEquals("fish", value);
  }

  @JavascriptEnabled
  public void testShouldBeAbleToPassABooleanAnAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    boolean value = (Boolean) executeScript("return arguments[0] == true;", true);

    assertTrue(value);
  }

  @JavascriptEnabled
  public void testShouldBeAbleToPassANumberAnAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    long value = (Long) executeScript("return arguments[0] == 1 ? 1 : 0;", 1);

    assertEquals(1, value);
  }

  @JavascriptEnabled
  public void testShouldBeAbleToPassAWebElementAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    WebElement button = driver.findElement(By.id("plainButton"));
    String
        value =
        (String) executeScript(
            "arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];",
            button);

    assertEquals("plainButton", value);
  }
  
  @JavascriptEnabled
  @Ignore(IE)
  public void testShouldBeAbleToPassAnArrayAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    Object[] array = new Object[] { "zero", 1, true, 3.14159 };
    long length = (Long)executeScript("return arguments[0].length", array);
    assertEquals(array.length, length);
  }
  
  @JavascriptEnabled
  @Ignore(IE)
  public void testShouldBeAbleToPassACollectionAsArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    Collection<Object> collection = new ArrayList<Object>();
    collection.add("Cheddar");
    collection.add("Brie");
    collection.add(7);
    long length = (Long)executeScript("return arguments[0].length", collection);
    assertEquals(collection.size(), length);
    
    collection = new HashSet<Object>();
    collection.add("Gouda");
    collection.add("Stilton");
    collection.add("Stilton");
    collection.add(true);
    length = (Long)executeScript("return arguments[0].length", collection);
    assertEquals(collection.size(), length);
    
    
  }

  @JavascriptEnabled
  public void testShouldThrowAnExceptionIfAnArgumentIsNotValid() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    try {
      executeScript("return arguments[0];", driver);
      fail("Exception should have been thrown");
    } catch (IllegalArgumentException e) {
      // this is expected
    }
  }

  @JavascriptEnabled
  public void testShouldBeAbleToPassInMoreThanOneArgument() {
    if (!(driver instanceof JavascriptExecutor)) {
      return;
    }

    driver.get(javascriptPage);
    String result = (String) executeScript("return arguments[0] + arguments[1];", "one", "two");

    assertEquals("onetwo", result);
  }

  @Ignore(value = CHROME, reason = "Can't execute script in iframe, track crbug 20773")
  @JavascriptEnabled
  public void testShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo() {
    driver.get(richTextPage);

    driver.switchTo().frame("editFrame");
    WebElement
        body =
        (WebElement) ((JavascriptExecutor) driver).executeScript("return document.body");

    assertEquals("", body.getText());
  }

  @JavascriptEnabled
  public void testJavascriptStringHandlingShouldWorkAsExpected() {
    driver.get(javascriptPage);

    String value = (String) executeScript("return '';");
    assertEquals("", value);

    value = (String) executeScript("return undefined;");
    assertNull(value);

    value = (String) executeScript("return ' '");
    assertEquals(" ", value);
  }
}
