package com.thoughtworks.webdriver.internal;

import com.thoughtworks.webdriver.WebElement;

import java.util.List;

public interface FindsByXPath {
  WebElement findElementByXPath(String using);
  List<WebElement> findElementsByXPath(String using);
}
