// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.testing.drivers;

import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_JAVASCRIPT;
import static org.openqa.selenium.testing.DevMode.isInDevMode;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.BrowserType;

import java.lang.reflect.InvocationTargetException;
import java.util.function.Supplier;
import java.util.logging.Logger;

public class ReflectionBackedDriverSupplier implements Supplier<WebDriver> {

  private final static Logger log =
      Logger.getLogger(ReflectionBackedDriverSupplier.class.getName());
  private final Capabilities desiredCapabilities;

  public ReflectionBackedDriverSupplier(Capabilities desiredCapabilities) {
    this.desiredCapabilities = desiredCapabilities;
  }

  public WebDriver get() {
    try {
      Class<? extends WebDriver> driverClass = mapToClass(desiredCapabilities);
      if (driverClass == null) {
        return null;
      }

      try {
        return driverClass.getConstructor(desiredCapabilities.getClass()).newInstance(desiredCapabilities);
      } catch (NoSuchMethodException | InvocationTargetException e) {
      }

      return driverClass.getConstructor(Capabilities.class).newInstance(desiredCapabilities);
    } catch (InvocationTargetException e) {
      throw new RuntimeException(e.getTargetException());
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  // Cover your eyes
  private Class<? extends WebDriver> mapToClass(Capabilities caps) {
    String name = caps == null ? "" : caps.getBrowserName();
    String className;

    if (BrowserType.CHROME.equals(name)) {
      className = "org.openqa.selenium.testing.drivers.TestChromeDriver";
    } else if (BrowserType.OPERA_BLINK.equals(name)) {
      className = "org.openqa.selenium.testing.drivers.TestOperaBlinkDriver";
    } else if (BrowserType.FIREFOX.equals(name)) {
      if (isInDevMode()) {
        className = "org.openqa.selenium.testing.drivers.SynthesizedFirefoxDriver";
      } else {
        className = "org.openqa.selenium.firefox.FirefoxDriver";
      }
    } else if (BrowserType.HTMLUNIT.equals(name)) {
      if (caps.is(SUPPORTS_JAVASCRIPT)) {
        className = "org.openqa.selenium.htmlunit.JavascriptEnabledHtmlUnitDriverTests$HtmlUnitDriverForTest";
      } else {
        className = "org.openqa.selenium.htmlunit.HtmlUnitDriver";
      }
    } else if (BrowserType.IE.equals(name)) {
      className = "org.openqa.selenium.ie.InternetExplorerDriver";
    } else if (name.toLowerCase().contains(BrowserType.SAFARI)) {
      className = "org.openqa.selenium.safari.SafariDriver";
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
      throw new RuntimeException(e);
    }
  }
}
