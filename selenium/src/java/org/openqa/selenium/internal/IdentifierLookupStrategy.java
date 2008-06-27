package org.openqa.selenium.internal;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class IdentifierLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        try {
            return new IdLookupStrategy().find(driver, use);
        } catch (NoSuchElementException e) {
            return new NameLookupStrategy().find(driver, use);
        }
    }
}
