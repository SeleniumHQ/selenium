package org.openqa.selenium.internal;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;

public class XPathLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        if (use.endsWith("/"))
            use = use.substring(0, use.length() - 1);
        return driver.findElement(By.xpath(use));
    }
}
