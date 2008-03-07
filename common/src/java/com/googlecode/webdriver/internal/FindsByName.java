package com.googlecode.webdriver.internal;

import com.googlecode.webdriver.WebElement;

import java.util.List;

public interface FindsByName {
  WebElement findElementByName(String using);
  List<WebElement> findElementsByName(String using);
}
