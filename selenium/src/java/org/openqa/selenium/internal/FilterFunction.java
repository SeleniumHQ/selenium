package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

import java.util.List;

public interface FilterFunction {
    List<WebElement> filterElements(List<WebElement> allElements, String filterValue);
}
