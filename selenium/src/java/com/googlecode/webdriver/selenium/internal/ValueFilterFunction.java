package com.googlecode.webdriver.selenium.internal;

import com.googlecode.webdriver.WebElement;

public class ValueFilterFunction extends BaseFilterFunction {
    protected boolean shouldAdd(WebElement element, String filterValue) {
        String value = element.getValue();
        return filterValue.equals(value);
    }
}
