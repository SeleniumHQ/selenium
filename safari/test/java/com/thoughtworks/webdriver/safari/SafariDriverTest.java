package com.thoughtworks.webdriver.safari;

import com.thoughtworks.webdriver.JavascriptEnabledDriverTest;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.By;

public class SafariDriverTest extends JavascriptEnabledDriverTest {
    protected WebDriver getDriver() {
        return new SafariDriver();
    }

    public void testGetUrl() {
        driver.get(xhtmlTestPage);
        assertEquals("XHTML Test Page", driver.getTitle());
    }

    public void testShouldFindByLinks() {
        driver.get(xhtmlTestPage);
        assertNotNull(driver);
        assertNotNull(driver.findElement(By.linkText("click me")));

    }
}
