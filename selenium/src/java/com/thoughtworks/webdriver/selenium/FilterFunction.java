package com.thoughtworks.webdriver.selenium;

import java.util.List;

import com.thoughtworks.webdriver.WebElement;

public interface FilterFunction {
    List<WebElement> filterElements(List<WebElement> allElements, String filterValue);
}
