package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

import java.util.List;

public interface OptionSelectStrategy {
    public boolean select(List<WebElement> fromOptions, String selectThis, boolean setSelected, boolean allowMultipleSelect);
}
