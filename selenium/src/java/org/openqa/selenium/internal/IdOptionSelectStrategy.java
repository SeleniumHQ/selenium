package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

public class IdOptionSelectStrategy extends BaseOptionSelectStrategy {
    protected boolean selectOption(WebElement option, String selectThis) {
        String id = option.getAttribute("id");
        return selectThis.equals(id);
    }
}
