package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

public class NameFilterFunction extends BaseFilterFunction {
    protected boolean shouldAdd(WebElement element, String filterValue) {
        String name = element.getAttribute("name");
        return filterValue.equals(name);
    }
}
