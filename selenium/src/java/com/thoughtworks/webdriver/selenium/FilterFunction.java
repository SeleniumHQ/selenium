package com.thoughtworks.webdriver.selenium;

import java.util.List;

public interface FilterFunction {
    List filterElements(List allElements, String filterValue);
}
