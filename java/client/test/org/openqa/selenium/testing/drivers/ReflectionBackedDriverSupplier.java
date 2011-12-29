/*
Copyright 2011 WebDriver committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.testing.drivers;

import com.google.common.base.Supplier;
import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.logging.Logger;

import static org.openqa.selenium.testing.DevMode.isInDevMode;

public class ReflectionBackedDriverSupplier implements Supplier<WebDriver> {

  private final static Logger log = Logger.getLogger(ReflectionBackedDriverSupplier.class.getName());
  private final Capabilities caps;

  public ReflectionBackedDriverSupplier(Capabilities caps) {
    this.caps = caps;
  }

  public WebDriver get() {
    try {
      Class<? extends WebDriver> driverClass = mapToClass(caps);
      if (driverClass == null) {
        return null;
      }

      return driverClass.getConstructor(Capabilities.class).newInstance(caps);
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
      log.fine("Unsure how to create: " + caps);
      return null;
    }

    try {
      return Class.forName(className).asSubclass(WebDriver.class);
    } catch (ClassNotFoundException e) {
      throw Throwables.propagate(e);
    }
  }
}
