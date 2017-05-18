package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class BasicWebElementRetriever implements WebElementRetriever {

  private final WebDriver driver;

  public BasicWebElementRetriever(WebDriver driver) {
    this.driver = driver;
  }

  @Override
  public WebElement findElement(By by) {
    return driver.findElement(by);
  }

  @Override
  public WebDriver getDriver() {
    return driver;
  }

}
