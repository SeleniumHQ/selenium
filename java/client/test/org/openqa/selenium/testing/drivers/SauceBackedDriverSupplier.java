package org.openqa.selenium.testing.drivers;

import com.google.common.base.Supplier;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;

public class SauceBackedDriverSupplier implements Supplier<WebDriver> {

  private final Capabilities capabilities;

  public SauceBackedDriverSupplier(Capabilities caps) {
    this.capabilities = caps;
  }

  public WebDriver get() {
    if (!SauceDriver.shouldUseSauce()) {
      return null;
    }

    return new SauceDriver(capabilities);
  }
}
