package com.googlecode.webdriver.selenium.internal;

import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.By;
import com.googlecode.webdriver.WebElement;

public class AltLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        return driver.findElement(By.xpath("//*[@alt='" + use + "']"));
    }
}
