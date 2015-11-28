package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public interface WebElementRetriever {

  /**
   * @param locator
   * @return the found element
   * @throws org.openqa.selenium.NoSuchElementException if the element cannot be found
   */
  WebElement findElement(By locator);

  WebDriver getDriver();
}
