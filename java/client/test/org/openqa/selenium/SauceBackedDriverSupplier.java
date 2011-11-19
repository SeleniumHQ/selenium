package org.openqa.selenium;

import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import com.google.common.base.Supplier;

// This is a particularly ugly class.  I will tidy it up, I swear.
public class SauceBackedDriverSupplier implements Supplier<WebDriver> {
  private final Class<? extends WebDriver> driverClass;

  public SauceBackedDriverSupplier(Class<? extends WebDriver> driverClass) {
    this.driverClass = driverClass;
  }

  public WebDriver get() {
    DesiredCapabilities capabilities;
    if (driverClass.getName() == "org.openqa.selenium.firefox.FirefoxDriver") {
      capabilities = DesiredCapabilities.firefox();
    } else if (driverClass.getName() == "org.openqa.selenium.firefox.SynthesizedFirefoxDriver") {
      capabilities = DesiredCapabilities.firefox();
      capabilities.setCapability(CapabilityType.HAS_NATIVE_EVENTS, false);
    } else if (driverClass.getName() ==
        "org.openqa.selenium.ie.InternetExplorerDriverTestSuite$TestInternetExplorerDriver") {
      capabilities = DesiredCapabilities.internetExplorer();
    } else if (driverClass.getName() ==
        "org.openqa.selenium.chrome.ChromeDriverTestSuite$DriverForTest") {
      capabilities = DesiredCapabilities.chrome();
    } else {
      throw new UnsupportedOperationException(
        "Didn't know how to create sauce-backed driver for class " +
            driverClass.getCanonicalName());
    }
    return new SauceDriver(capabilities);
  }
}
