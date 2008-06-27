package com.googlecode.webdriver.selenium.internal;

import com.googlecode.webdriver.WebElement;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public abstract class BaseFilterFunction implements FilterFunction {
    public List<WebElement> filterElements(List<WebElement> allElements, String filterValue) {
        ArrayList<WebElement> toReturn = new ArrayList<WebElement>();

        Iterator<WebElement> iterator = allElements.iterator();
        while (iterator.hasNext()) {
            WebElement element = iterator.next();
            if (shouldAdd(element, filterValue))
                toReturn.add(element);
        }

        return toReturn;
    }

    protected abstract boolean shouldAdd(WebElement element, String filterValue);
}
