package com.googlecode.webdriver.selenium;

import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.By;

public class XPathLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        if (use.endsWith("/"))
            use = use.substring(0, use.length() - 1);
        return driver.findElement(By.xpath(use));
    }
}
