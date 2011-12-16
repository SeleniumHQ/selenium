package org.openqa.selenium.testing.drivers;

import static org.openqa.selenium.testing.DevMode.isInDevMode;

import com.google.common.base.Supplier;
import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

public class ReflectionBackedDriverSupplier implements Supplier<WebDriver> {

  private final Capabilities caps;

  public ReflectionBackedDriverSupplier(Capabilities caps) {
    this.caps = caps;
  }

  public WebDriver get() {
    try {
      Class<? extends WebDriver> driverClass = mapToClass(caps);
      return driverClass.newInstance();
    } catch (Exception e) {
      throw Throwables.propagate(e);
    }
  }

  // Cover your eyes
  private Class<? extends WebDriver> mapToClass(Capabilities caps) {
    String name = caps == null ? "" : caps.getBrowserName();
    String className = null;

    if (DesiredCapabilities.android().getBrowserName().equals(name)) {
      // Do nothing
    } else if (DesiredCapabilities.chrome().getBrowserName().equals(name)) {
      className = "org.openqa.selenium.chrome.ChromeDriver";
    } else if (DesiredCapabilities.firefox().getBrowserName().equals(name)) {
      if (isInDevMode()) {
        className = "org.openqa.selenium.firefox.SynthesizedFirefoxDriver";
      } else {
        className = "org.openqa.selenium.firefox.FirefoxDriver";
      }
    } else if (DesiredCapabilities.htmlUnit().getBrowserName().equals(name)) {
      if (caps.isJavascriptEnabled()) {
        className =
            "org.openqa.selenium.htmlunit.JavascriptEnabledHtmlUnitDriverTestSuite$HtmlUnitDriverForTest";
      } else {
        className = "org.openqa.selenium.htmlunit.HtmlUnitDriver";
      }
    } else if (DesiredCapabilities.internetExplorer().getBrowserName().equals(name)) {
      if (isInDevMode()) {
        className =
            "org.openqa.selenium.ie.InternetExplorerDriverTestSuite$TestInternetExplorerDriver";
      } else {
        className = "org.openqa.selenium.ie.InternetExplorerDriver";
      }
    } else if (DesiredCapabilities.ipad().getBrowserName().equals(name)) {
      // Do nothing
    } else if (DesiredCapabilities.iphone().getBrowserName().equals(name)) {
      // Do nothing
    } else {
      // The last chance saloon.
      className = System.getProperty("selenium.browser.class_name");
    }

    if (className == null) {
      throw new RuntimeException("Unsure how to create: " + caps);
    }

    try {
      return Class.forName(className).asSubclass(WebDriver.class);
    } catch (ClassNotFoundException e) {
      throw Throwables.propagate(e);
    }
  }
}
