package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

import java.util.List;

public interface FindsById {
  WebElement findElementById(String using);
  List<WebElement> findElementsById(String using);
}
