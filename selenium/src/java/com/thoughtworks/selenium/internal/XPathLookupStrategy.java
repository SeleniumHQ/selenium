package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.RenderingWebDriver;
import com.thoughtworks.webdriver.RenderedWebElement;

public class XPathLookupStrategy implements LookupStrategy {
    public RenderedWebElement find(RenderingWebDriver driver, String use) {
        if (use.endsWith("/"))
            use = use.substring(0, use.length() - 1);
        return driver.selectElement(use);
    }
}
