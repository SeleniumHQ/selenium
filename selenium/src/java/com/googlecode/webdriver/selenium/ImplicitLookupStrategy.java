package com.googlecode.webdriver.selenium;

import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;

public class ImplicitLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        if (use.startsWith("//")) {
            return new XPathLookupStrategy().find(driver, use);
        } else {
            return new IdentifierLookupStrategy().find(driver, use);
        }
    }
}
