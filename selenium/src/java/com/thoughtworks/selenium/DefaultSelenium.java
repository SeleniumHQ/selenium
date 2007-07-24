package com.thoughtworks.selenium;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.firefox.FirefoxDriver;
import com.thoughtworks.webdriver.ie.InternetExplorerDriver;

public class DefaultSelenium extends WebDriverBackedSelenium implements Selenium {
	public DefaultSelenium(String ignored, int ignoredDefaultPort, String browserName, String startUrl) {
		super(getDriver(browserName), startUrl);
	}
	
	private static WebDriver getDriver(String browserName) {
		if (browserName.indexOf("firefox") != -1 || browserName.indexOf("chrome") != -1) {
			return new FirefoxDriver();
		} else if (browserName.indexOf("iexplore") != -1) {
			return new InternetExplorerDriver();
		} else {
			throw new RuntimeException("Unsupported browser version: " + browserName);
		}
	}
}
