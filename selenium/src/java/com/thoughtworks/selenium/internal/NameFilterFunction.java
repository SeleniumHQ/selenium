package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebElement;

public class NameFilterFunction extends BaseFilterFunction {
    protected boolean shouldAdd(WebElement element, String filterValue) {
        String name = element.getAttribute("name");
        return filterValue.equals(name);
    }
}
