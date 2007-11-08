package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.NoSuchElementException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.RenderingWebDriver;
import com.thoughtworks.webdriver.RenderedWebElement;

public class IdentifierLookupStrategy implements LookupStrategy {
    public RenderedWebElement find(RenderingWebDriver driver, String use) {
        try {
            return new IdLookupStrategy().find(driver, use);
        } catch (NoSuchElementException e) {
            return new NameLookupStrategy().find(driver, use);
        }
    }
}
