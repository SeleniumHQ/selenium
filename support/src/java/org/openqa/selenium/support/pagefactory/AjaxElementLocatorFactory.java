package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.pagefactory.ElementLocator;

import java.lang.reflect.Field;

public class AjaxElementLocatorFactory implements ElementLocatorFactory {
  private final WebDriver driver;
  private final int timeOutInSeconds;

  public AjaxElementLocatorFactory(WebDriver driver, int timeOutInSeconds) {
    this.driver = driver;
    this.timeOutInSeconds = timeOutInSeconds;
  }
  
  public ElementLocator createLocator(Field field) {
    return new AjaxElementLocator(driver, field, timeOutInSeconds);
  }
}
