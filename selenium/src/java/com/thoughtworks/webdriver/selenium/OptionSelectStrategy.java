package com.thoughtworks.webdriver.selenium;

import java.util.List;

import com.thoughtworks.webdriver.WebElement;

public interface OptionSelectStrategy {
    public boolean select(List<WebElement> fromOptions, String selectThis, boolean setSelected, boolean allowMultipleSelect);
}
