package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

import java.util.List;

public interface FindsByXPath {
  WebElement findElementByXPath(String using);
  List<WebElement> findElementsByXPath(String using);
}
