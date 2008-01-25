package com.googlecode.webdriver.internal;

import com.googlecode.webdriver.WebElement;

import java.util.List;

public interface FindsById {
  WebElement findElementById(String using);
  List<WebElement> findElementsById(String using);
}
