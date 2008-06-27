package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

public class ValueFilterFunction extends BaseFilterFunction {
    protected boolean shouldAdd(WebElement element, String filterValue) {
        String value = element.getValue();
        return filterValue.equals(value);
    }
}
