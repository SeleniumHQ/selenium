package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public interface LookupStrategy {
	WebElement find(WebDriver driver, String use);
}
