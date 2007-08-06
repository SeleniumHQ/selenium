package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebElement;

public class LabelOptionSelectStrategy extends BaseOptionSelectStrategy {
	protected boolean selectOption(WebElement option, String selectThis) {
		return selectThis.equals(option.getText());
	}
}
