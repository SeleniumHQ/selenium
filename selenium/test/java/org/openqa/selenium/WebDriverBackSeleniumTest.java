package org.openqa.selenium;

import junit.framework.TestCase;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.internal.LookupStrategy;
import org.openqa.selenium.internal.IdLookupStrategy;

public class WebDriverBackSeleniumTest extends TestCase {
    public void testShouldBeAbleToConvertLocatorsToStrategies() {
        WebDriverBackedSelenium selenium = new WebDriverBackedSelenium(new HtmlUnitDriver(), "http://localhost:3000");

        String locator = "id=button1";
        LookupStrategy strategy = selenium.findStrategy(locator);
        String id = selenium.determineWebDriverLocator(locator);

        assertTrue(strategy instanceof IdLookupStrategy);
        assertEquals("button1", id);
    }
}
