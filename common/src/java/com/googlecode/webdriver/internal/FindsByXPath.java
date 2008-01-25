package com.googlecode.webdriver.internal;

import com.googlecode.webdriver.WebElement;

import java.util.List;

public interface FindsByXPath {
  WebElement findElementByXPath(String using);
  List<WebElement> findElementsByXPath(String using);
}
