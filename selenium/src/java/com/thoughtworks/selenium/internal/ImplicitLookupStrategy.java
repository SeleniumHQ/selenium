package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.RenderingWebDriver;
import com.thoughtworks.webdriver.RenderedWebElement;

public class ImplicitLookupStrategy implements LookupStrategy {
    public RenderedWebElement find(RenderingWebDriver driver, String use) {
        if (use.startsWith("//")) {
            return new XPathLookupStrategy().find(driver, use);
        } else {
            return new IdentifierLookupStrategy().find(driver, use);
        }
    }
}
