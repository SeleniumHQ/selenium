package com.thoughtworks.webdriver.internal;

import com.thoughtworks.webdriver.WebElement;

import java.util.List;

public interface FindsByLinkText {
  WebElement findElementByLinkText(String using);
  List<WebElement> findElementsByLinkText(String using);
}
