package org.openqa.selenium.internal;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;

public class IdLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        return driver.findElement(By.id(use));
    }
}
