package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.RenderedWebElement;
import com.thoughtworks.webdriver.By;

public class XPathLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        if (use.endsWith("/"))
            use = use.substring(0, use.length() - 1);
        return driver.findElement(By.xpath(use));
    }
}
