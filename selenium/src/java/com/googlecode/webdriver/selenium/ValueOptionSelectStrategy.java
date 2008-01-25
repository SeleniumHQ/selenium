package com.googlecode.webdriver.selenium;

import com.googlecode.webdriver.WebElement;

public class ValueOptionSelectStrategy extends BaseOptionSelectStrategy {
    protected boolean selectOption(WebElement option, String selectThis) {
        return selectThis.equals(option.getValue());
    }
}
