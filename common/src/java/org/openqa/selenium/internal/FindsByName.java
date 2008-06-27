package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

import java.util.List;

public interface FindsByName {
  WebElement findElementByName(String using);
  List<WebElement> findElementsByName(String using);
}
