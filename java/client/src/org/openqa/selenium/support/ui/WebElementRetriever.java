package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public interface WebElementRetriever {

  WebElement findElement(By locator);
  WebDriver getDriver();
}
