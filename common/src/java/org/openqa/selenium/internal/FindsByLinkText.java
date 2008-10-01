package org.openqa.selenium.internal;

import org.openqa.selenium.WebElement;

import java.util.List;

public interface FindsByLinkText {
  WebElement findElementByLinkText(String using);
  List<WebElement> findElementsByLinkText(String using);
  WebElement findElementByPartialLinkText(String using);
  List<WebElement> findElementsByPartialLinkText(String using);
}
