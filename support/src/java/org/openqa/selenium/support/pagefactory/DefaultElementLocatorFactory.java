package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.pagefactory.ElementLocator;

import java.lang.reflect.Field;

public final class DefaultElementLocatorFactory implements ElementLocatorFactory {
  private final WebDriver driverRef;

  public DefaultElementLocatorFactory(WebDriver driverRef) {
    this.driverRef = driverRef;
  }

  public ElementLocator createLocator(Field field) {
    return new DefaultElementLocator(driverRef, field);
  }
}