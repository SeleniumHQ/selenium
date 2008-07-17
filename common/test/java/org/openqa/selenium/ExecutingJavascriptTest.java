package org.openqa.selenium;

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

    private Object executeScript(String script) {
        return ((JavascriptExecutor) driver).executeScript(script);
    }
}
