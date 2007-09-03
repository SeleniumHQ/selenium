package com.thoughtworks.selenium.internal;

import com.thoughtworks.webdriver.WebElement;

import java.util.List;

public class IndexOptionSelectStrategy implements OptionSelectStrategy {
    public boolean select(List fromOptions, String selectThis, boolean setSelected, boolean allowMultipleSelect) {
        try {
            int index = Integer.parseInt(selectThis);
            WebElement option = (WebElement) fromOptions.get(index);
            if (setSelected)
                option.setSelected();
            else if (option.isSelected()) {
                option.toggle();
            }
            return true;
        } catch (Exception e) {
            // Do nothing. Handled below
        }
        return false;
    }
}
