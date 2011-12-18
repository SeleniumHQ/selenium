package org.openqa.selenium.testing.drivers;

import com.google.common.base.Supplier;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.LocalFileDetector;

public class SauceBackedDriverSupplier implements Supplier<WebDriver> {

  private final Capabilities capabilities;

  public SauceBackedDriverSupplier(Capabilities caps) {
    this.capabilities = caps;
  }

  public WebDriver get() {
    if (!SauceDriver.shouldUseSauce()) {
      return null;
    }

    SauceDriver driver = new SauceDriver(capabilities);
    driver.setFileDetector(new LocalFileDetector());
    return driver;
  }
}
