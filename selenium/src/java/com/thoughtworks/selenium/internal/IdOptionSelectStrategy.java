package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebElement;

public class IdOptionSelectStrategy extends BaseOptionSelectStrategy {
	protected boolean selectOption(WebElement option, String selectThis) {
		String id = option.getAttribute("id");
		return selectThis.equals(id);
	}
}
