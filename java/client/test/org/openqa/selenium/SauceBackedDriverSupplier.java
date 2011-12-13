package org.openqa.selenium;

import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.common.base.Supplier;

// This is a particularly ugly class.  I will tidy it up, I swear.
public class SauceBackedDriverSupplier implements Supplier<WebDriver> {
  private final Class<? extends WebDriver> driverClass;

  public SauceBackedDriverSupplier(Class<? extends WebDriver> driverClass) {
    this.driverClass = driverClass;
  }

  public WebDriver get() {
    DesiredCapabilities capabilities;
    String requestedDriver = driverClass.getName();
    if (requestedDriver == "org.openqa.selenium.firefox.FirefoxDriver") {
      capabilities = DesiredCapabilities.firefox();
    } else if (requestedDriver == "org.openqa.selenium.firefox.SynthesizedFirefoxDriver") {
      capabilities = DesiredCapabilities.firefox();
      capabilities.setCapability(CapabilityType.HAS_NATIVE_EVENTS, false);
    } else if (requestedDriver == "org.openqa.selenium.firefox.NativeEventsFirefoxDriver") {
      capabilities = DesiredCapabilities.firefox();
      capabilities.setCapability(CapabilityType.HAS_NATIVE_EVENTS, true);
    } else if (requestedDriver ==
        "org.openqa.selenium.ie.InternetExplorerDriverTestSuite$TestInternetExplorerDriver" ||
        requestedDriver == "org.openqa.selenium.ie.InternetExplorerDriver") {
      capabilities = DesiredCapabilities.internetExplorer();
    } else if (requestedDriver ==
        "org.openqa.selenium.chrome.ChromeDriverTestSuite$DriverForTest" || 
        requestedDriver == "org.openqa.selenium.chrome.ChromeDriver") {
      capabilities = DesiredCapabilities.chrome();
    } else if (requestedDriver == "com.opera.core.systems.OperaDriver") {
      capabilities = DesiredCapabilities.opera();
    } else {
      throw new UnsupportedOperationException(
        "Didn't know how to create sauce-backed driver for class " +
            driverClass.getCanonicalName());
    }
    RemoteWebDriver driver = new SauceDriver(capabilities);
    driver.setFileDetector(new LocalFileDetector());
    return driver;
  }
}
