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

import static org.openqa.selenium.Ignore.Driver.SAFARI;

import java.util.ArrayList;

public class ExecutingJavascriptTest extends AbstractDriverTestCase {
    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAString() {
        if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(xhtmlTestPage);

        Object result = executeScript("return document.title;");

        assertTrue(result instanceof String);
        assertEquals("XHTML Test Page", result);
    }

    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnALong() {
        if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(nestedPage);

        Object result = executeScript("return document.getElementsByName('checky').length;");

        assertTrue(result.getClass().getName(), result instanceof Long);
        assertTrue((Long) result > 1);
    }

    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement() {
        if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(xhtmlTestPage);

        Object result = executeScript("return document.getElementById('id1');");

        assertNotNull(result);
        assertTrue(result instanceof WebElement);
    }

    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnABoolean() {
        if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(xhtmlTestPage);

        Object result = executeScript("return true;");

        assertNotNull(result);
        assertTrue(result instanceof Boolean);
        assertTrue((Boolean) result);
    }

    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldThrowAnExceptionWhenTheJavascriptIsBad() {
        if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(xhtmlTestPage);

        try {
            executeScript("return squiggle();");
            fail("Expected an exception");
        } catch (Exception e) {
            // This is expected
        }
    }

    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldBeAbleToCallFunctionsDefinedOnThePage() {
        if (!(driver instanceof JavascriptExecutor))
          return;

        driver.get(javascriptPage);
        executeScript("displayMessage('I like cheese');");
        String text = driver.findElement(By.id("result")).getText();

        assertEquals("I like cheese", text.trim());
    }

    private Object executeScript(String script, Object... args) {
        return ((JavascriptExecutor) driver).executeScript(script, args);
    }

  @JavascriptEnabled
  @Ignore(SAFARI)
    public void testShouldBeAbleToPassAStringAnAsArgument() {
      if (!(driver instanceof JavascriptExecutor))
          return;

        driver.get(javascriptPage);
        String value = (String) executeScript("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish");

        assertEquals("fish", value);
    }

    @JavascriptEnabled
  @Ignore(SAFARI)
    public void testShouldBeAbleToPassABooleanAnAsArgument() {
      if (!(driver instanceof JavascriptExecutor))
          return;

        driver.get(javascriptPage);
        boolean value = (Boolean) executeScript("return arguments[0] == true;", true);

        assertTrue(value);
    }

    @JavascriptEnabled
  @Ignore(SAFARI)
    public void testShouldBeAbleToPassANumberAnAsArgument() {
      if (!(driver instanceof JavascriptExecutor))
          return;

        driver.get(javascriptPage);
        long value = (Long) executeScript("return arguments[0] == 1 ? 1 : 0;", 1);

        assertEquals(1, value);
    }

    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldBeAbleToPassAWebElementAsArgument() {
      if (!(driver instanceof JavascriptExecutor))
          return;

      driver.get(javascriptPage);
      WebElement button = driver.findElement(By.id("plainButton"));
      String value = (String) executeScript("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button);

      assertEquals("plainButton", value);
    }

    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldThrowAnExceptionIfAnArgumentIsNotValid() {
      if (!(driver instanceof JavascriptExecutor))
        return;

      driver.get(javascriptPage);
      try {
        executeScript("return arguments[0];", new ArrayList<WebElement>());
        fail("Exception should have been thrown");
      } catch (IllegalArgumentException e) {
        // this is expected
      }
    }
    
    @JavascriptEnabled
    @Ignore(SAFARI)
    public void testShouldBeAbleToPassInMoreThanOneArgument() {
    	if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(javascriptPage);
        String result = (String) executeScript("return arguments[0] + arguments[1];", "one", "two");
        
        assertEquals("onetwo", result);
    }
}
