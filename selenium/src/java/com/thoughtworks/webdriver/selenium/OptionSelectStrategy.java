package com.thoughtworks.webdriver.selenium;

import java.util.List;

public interface OptionSelectStrategy {
    public boolean select(List fromOptions, String selectThis, boolean setSelected, boolean allowMultipleSelect);
}
