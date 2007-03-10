package com.thoughtworks.webdriver.firefox;

import com.thoughtworks.webdriver.JavascriptEnabledDriverTest;
import com.thoughtworks.webdriver.WebDriver;

public class FirefoxDriverTest extends JavascriptEnabledDriverTest {
	protected WebDriver getDriver() {
		return new FirefoxDriver();
	}
	
	protected boolean isUsingSameDriverInstance() {
		return true;
	}
}
