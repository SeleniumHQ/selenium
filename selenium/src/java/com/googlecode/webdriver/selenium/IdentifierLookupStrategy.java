package com.googlecode.webdriver.selenium;

import com.googlecode.webdriver.NoSuchElementException;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;

public class IdentifierLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        try {
            return new IdLookupStrategy().find(driver, use);
        } catch (NoSuchElementException e) {
            return new NameLookupStrategy().find(driver, use);
        }
    }
}
