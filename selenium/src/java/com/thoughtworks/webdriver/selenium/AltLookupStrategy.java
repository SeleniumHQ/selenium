package com.thoughtworks.webdriver.selenium;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.By;

public class AltLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        return driver.findElement(By.xpath("//*[@alt='" + use + "']"));
    }
}
