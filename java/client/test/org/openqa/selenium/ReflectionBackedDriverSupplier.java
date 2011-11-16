package org.openqa.selenium;

import com.google.common.base.Supplier;
import com.google.common.base.Throwables;

public class ReflectionBackedDriverSupplier implements Supplier<WebDriver> {

  private final Class<? extends WebDriver> driverClass;

  public ReflectionBackedDriverSupplier(Class<? extends WebDriver> driverClass) {
    this.driverClass = driverClass;
  }

  public WebDriver get() {
    try {
      return driverClass.newInstance();
    } catch (Exception e) {
      Throwables.propagate(e);
    }
    throw new IllegalStateException("Should have returned or thrown");
  }
}