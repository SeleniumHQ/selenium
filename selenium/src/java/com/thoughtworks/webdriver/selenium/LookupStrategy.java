package com.thoughtworks.webdriver.selenium;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public interface LookupStrategy {
    WebElement find(WebDriver driver, String use);
}
