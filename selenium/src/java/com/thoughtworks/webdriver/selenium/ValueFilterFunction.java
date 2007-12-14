package com.thoughtworks.webdriver.selenium;

import com.thoughtworks.webdriver.WebElement;

public class ValueFilterFunction extends BaseFilterFunction {
    protected boolean shouldAdd(WebElement element, String filterValue) {
        String value = element.getValue();
        return filterValue.equals(value);
    }
}
