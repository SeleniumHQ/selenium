package org.openqa.selenium;

import java.util.ArrayList;

public class ExecutingJavascriptTest extends AbstractDriverTestCase {
    @JavascriptEnabled
    @Ignore("safari")
    public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAString() {
        if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(xhtmlTestPage);

        Object result = executeScript("return document.title;");

        assertTrue(result instanceof String);
        assertEquals("XHTML Test Page", result);
    }

    @JavascriptEnabled
    @Ignore("safari")
    public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnALong() {
        if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(nestedPage);

        Object result = executeScript("return document.getElementsByName('checky').length;");

        assertTrue(result.getClass().getName(), result instanceof Long);
        assertTrue((Long) result > 1);
    }

    @JavascriptEnabled
    @Ignore("safari")
    public void testShouldBeAbleToExecuteSimpleJavascriptAndReturnAWebElement() {
        if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(xhtmlTestPage);

        Object result = executeScript("return document.getElementById('id1');");

        assertNotNull(result);
        assertTrue(result instanceof WebElement);
    }

    @JavascriptEnabled
    @Ignore("safari")
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
    @Ignore("safari")
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
    @Ignore("safari")
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
  @Ignore("safari")
    public void testShouldBeAbleToPassAStringAnAsArgument() {
      if (!(driver instanceof JavascriptExecutor))
          return;

        driver.get(javascriptPage);
        String value = (String) executeScript("return arguments[0] == 'fish' ? 'fish' : 'not fish';", "fish");

        assertEquals("fish", value);
    }

    @JavascriptEnabled
  @Ignore("safari")
    public void testShouldBeAbleToPassABooleanAnAsArgument() {
      if (!(driver instanceof JavascriptExecutor))
          return;

        driver.get(javascriptPage);
        boolean value = (Boolean) executeScript("return arguments[0] == true;", true);

        assertTrue(value);
    }

    @JavascriptEnabled
  @Ignore("safari")
    public void testShouldBeAbleToPassANumberAnAsArgument() {
      if (!(driver instanceof JavascriptExecutor))
          return;

        driver.get(javascriptPage);
        long value = (Long) executeScript("return arguments[0] == 1 ? 1 : 0;", 1);

        assertEquals(1, value);
    }

    @JavascriptEnabled
    @Ignore("safari")
    public void testShouldBeAbleToPassAWebElementAsArgument() {
      if (!(driver instanceof JavascriptExecutor))
          return;

      driver.get(javascriptPage);
      WebElement button = driver.findElement(By.id("plainButton"));
      String value = (String) executeScript("arguments[0]['flibble'] = arguments[0].getAttribute('id'); return arguments[0]['flibble'];", button);

      assertEquals("plainButton", value);
    }

    @JavascriptEnabled
    @Ignore("safari")
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
    @Ignore("safari")
    public void testShouldBeAbleToPassInMoreThanOneArgument() {
    	if (!(driver instanceof JavascriptExecutor))
            return;

        driver.get(javascriptPage);
        String result = (String) executeScript("return arguments[0] + arguments[1];", "one", "two");
        
        assertEquals("onetwo", result);
    }
}
