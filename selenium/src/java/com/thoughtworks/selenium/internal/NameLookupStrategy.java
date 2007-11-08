package com.thoughtworks.selenium.internal;

import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;
import com.thoughtworks.webdriver.RenderedWebElement;
import com.thoughtworks.webdriver.RenderingWebDriver;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class NameLookupStrategy implements LookupStrategy {
    private static final Pattern NAME_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+)=(.+)");
    Map filterFunctions = new HashMap();

    public NameLookupStrategy() {
        filterFunctions.put("value", new ValueFilterFunction());
        filterFunctions.put("name", new NameFilterFunction());
        filterFunctions.put("index", new IndexFilterFunction());
    }

    public RenderedWebElement find(RenderingWebDriver driver, String use) {
        String[] parts = use.split(" ");

        List<RenderedWebElement> allElements = driver.selectElements("//*[@name='" + parts[0] + "']");

        // For some reason, we sometimes get back elements with a name that doesn't match. Filter those out
        Iterator<RenderedWebElement> iterator = allElements.iterator();
        while (iterator.hasNext()) {
            WebElement element = iterator.next();
            if (!(parts[0].equals(element.getAttribute("name"))))
                iterator.remove();
        }

        for (int i = 1; i < parts.length; i++) {
            FilterFunction filterBy = getFilterFunction(parts[i]);

            if (filterBy == null) {
                throw new SeleniumException(use + " not found. Cannot find filter for: " + parts[i]);
            }

            String filterValue = getFilterValue(parts[i]);
            allElements = filterBy.filterElements(allElements, filterValue);
        }

        if (allElements.size() > 0) {
            return (RenderedWebElement) allElements.get(0);
        }
        throw new SeleniumException(use + " not found");
    }

    private String getFilterValue(String originalFilterValue) {
        Matcher matcher = NAME_AND_VALUE_PATTERN.matcher(originalFilterValue);
        if (matcher.matches()) {
            return matcher.group(2);
        }
        return originalFilterValue;
    }

    private FilterFunction getFilterFunction(String originalFilter) {
        String filterName = "value";

        Matcher matcher = NAME_AND_VALUE_PATTERN.matcher(originalFilter);
        if (matcher.matches()) {
            filterName = matcher.group(1);
        }

        return (FilterFunction) filterFunctions.get(filterName);
    }
}
