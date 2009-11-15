/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.internal.seleniumemulation;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class NameLookupStrategy implements LookupStrategy {
    private static final Pattern NAME_AND_VALUE_PATTERN = Pattern.compile("^(\\p{Alpha}+)=(.+)");
    Map<String, FilterFunction> filterFunctions = new HashMap<String, FilterFunction>();

    public NameLookupStrategy() {
        filterFunctions.put("value", new ValueFilterFunction());
        filterFunctions.put("name", new NameFilterFunction());
        filterFunctions.put("index", new IndexFilterFunction());
    }

    public WebElement find(WebDriver driver, String use) {
        String[] parts = use.split(" ");

        List<WebElement> allElements = driver.findElements(By.name(parts[0]));

        // For some reason, we sometimes get back elements with a name that doesn't match. Filter those out
        Iterator<WebElement> iterator = allElements.iterator();
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
            return allElements.get(0);
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
