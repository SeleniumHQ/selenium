package com.googlecode.webdriver.selenium.internal;

import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;
import com.googlecode.webdriver.By;

public class ClassLookupStrategy implements LookupStrategy {
    public WebElement find(WebDriver driver, String use) {
        return driver.findElement(By.xpath("//*[@class='" + use + "']"));
    }
}
