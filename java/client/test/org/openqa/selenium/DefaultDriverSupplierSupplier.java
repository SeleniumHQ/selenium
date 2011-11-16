package org.openqa.selenium;

import com.google.common.base.Supplier;

public class DefaultDriverSupplierSupplier implements Supplier<Supplier<WebDriver>> {

  private static final String USE_SAUCE_ENV_NAME = "USE_SAUCE";

  private final Class<? extends WebDriver> driverClass;

  public DefaultDriverSupplierSupplier(Class<? extends WebDriver> driverClass) {
    this.driverClass = driverClass;
  }
  
  public Supplier<WebDriver> get() {
    return System.getenv(USE_SAUCE_ENV_NAME) == null ?
        new ReflectionBackedDriverSupplier(driverClass) :
        new SauceBackedDriverSupplier(driverClass);
  }
}
