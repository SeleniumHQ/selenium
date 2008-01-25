package com.googlecode.webdriver.internal;

import com.googlecode.webdriver.WebElement;

import java.util.List;

public interface FindsByLinkText {
  WebElement findElementByLinkText(String using);
  List<WebElement> findElementsByLinkText(String using);
}
