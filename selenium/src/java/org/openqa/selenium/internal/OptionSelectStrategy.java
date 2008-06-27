package com.googlecode.webdriver.selenium.internal;

import com.googlecode.webdriver.WebElement;

import java.util.List;

public interface OptionSelectStrategy {
    public boolean select(List<WebElement> fromOptions, String selectThis, boolean setSelected, boolean allowMultipleSelect);
}
