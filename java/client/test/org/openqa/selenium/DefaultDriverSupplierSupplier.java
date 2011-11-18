package org.openqa.selenium;

import com.google.common.base.Supplier;

public class DefaultDriverSupplierSupplier implements Supplier<Supplier<WebDriver>> {
  private final Class<? extends WebDriver> driverClass;

  public DefaultDriverSupplierSupplier(Class<? extends WebDriver> driverClass) {
    this.driverClass = driverClass;
  }
  
  public Supplier<WebDriver> get() {
    return SauceDriver.shouldUseSauce() ?
        new SauceBackedDriverSupplier(driverClass) :
        new ReflectionBackedDriverSupplier(driverClass);
  }
}
