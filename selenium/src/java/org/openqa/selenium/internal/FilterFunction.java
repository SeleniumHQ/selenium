package com.googlecode.webdriver.selenium.internal;

import com.googlecode.webdriver.WebElement;

import java.util.List;

public interface FilterFunction {
    List<WebElement> filterElements(List<WebElement> allElements, String filterValue);
}
