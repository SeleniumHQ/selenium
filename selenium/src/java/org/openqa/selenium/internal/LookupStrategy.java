package com.googlecode.webdriver.selenium.internal;

import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;

public interface LookupStrategy {
    WebElement find(WebDriver driver, String use);
}
