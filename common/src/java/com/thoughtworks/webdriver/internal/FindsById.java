package com.thoughtworks.webdriver.internal;

import com.thoughtworks.webdriver.WebElement;

import java.util.List;

public interface FindsById {
  WebElement findElementById(String using);
  List<WebElement> findElementsById(String using);
}
