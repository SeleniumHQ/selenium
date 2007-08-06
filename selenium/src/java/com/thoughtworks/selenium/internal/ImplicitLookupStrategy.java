package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public class ImplicitLookupStrategy implements LookupStrategy {
	public WebElement find(WebDriver driver, String use) {
		if (use.startsWith("//")) {
			return new XPathLookupStrategy().find(driver, use);
		} else {
			return new IdentifierLookupStrategy().find(driver, use);
		}
	}
}
