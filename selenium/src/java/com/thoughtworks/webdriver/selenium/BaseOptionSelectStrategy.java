package com.thoughtworks.webdriver.selenium;

import com.thoughtworks.webdriver.WebElement;

import java.util.Iterator;
import java.util.List;

public abstract class BaseOptionSelectStrategy implements OptionSelectStrategy {
    public boolean select(List<WebElement> fromOptions, String selectThis, boolean setSelected, boolean allowMultipleSelect) {
        boolean matchMade = false;
        Iterator<WebElement> allOptions = fromOptions.iterator();
        while (allOptions.hasNext()) {
            WebElement option = allOptions.next();
            boolean matchThisTime = selectOption(option, selectThis);
            if (matchThisTime) {
                if (setSelected)
                    option.setSelected();
                else if (option.isSelected()) {
                    option.toggle();
                }
            }
            matchMade |= matchThisTime;

            if (matchMade && !allowMultipleSelect)
                return true;
        }

        return matchMade;
    }

    protected abstract boolean selectOption(WebElement option, String selectThis);
}
