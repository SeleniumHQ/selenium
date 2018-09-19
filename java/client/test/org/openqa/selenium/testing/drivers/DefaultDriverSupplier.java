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

import static org.openqa.selenium.testing.DevMode.isInDevMode;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.safari.SafariDriver;

import java.lang.reflect.InvocationTargetException;
import java.util.function.Supplier;

public class DefaultDriverSupplier implements Supplier<WebDriver> {

  private Class<? extends WebDriver> driverClass;
  private final Capabilities desiredCapabilities;

  private Supplier<WebDriver> driverSupplier;

  public DefaultDriverSupplier(Capabilities desiredCapabilities) {
    this.desiredCapabilities = desiredCapabilities;

    String browserName = desiredCapabilities == null ? "" : desiredCapabilities.getBrowserName();

    if (BrowserType.CHROME.equals(browserName)) {
      driverSupplier = () -> new TestChromeDriver(desiredCapabilities);
    } else if (BrowserType.OPERA_BLINK.equals(browserName)) {
      driverSupplier = () -> new TestOperaBlinkDriver(desiredCapabilities);
    } else if (BrowserType.FIREFOX.equals(browserName)) {
      if (isInDevMode()) {
        driverSupplier = () -> new SynthesizedFirefoxDriver(desiredCapabilities);
      } else {
        driverSupplier = () -> new FirefoxDriver(desiredCapabilities);
      }
    } else if (BrowserType.HTMLUNIT.equals(browserName)) {
      driverSupplier = () -> new HtmlUnitDriver(desiredCapabilities);
    } else if (BrowserType.IE.equals(browserName)) {
      driverSupplier = () -> new InternetExplorerDriver(desiredCapabilities);
    } else if (browserName.toLowerCase().contains(BrowserType.SAFARI)) {
      driverSupplier = () -> new SafariDriver(desiredCapabilities);
    } else if (System.getProperty("selenium.browser.class_name") != null) {
      // No browser name specified, let's try reflection
      String className = System.getProperty("selenium.browser.class_name");
      driverSupplier = () -> {
        try {
          Class<? extends WebDriver> driverClass = Class.forName(className).asSubclass(WebDriver.class);
          return driverClass.getConstructor(Capabilities.class).newInstance(desiredCapabilities);
        } catch (ClassNotFoundException | NoSuchMethodException | InvocationTargetException | InstantiationException | IllegalAccessException e) {
          throw new RuntimeException(e);
        }
      };
    } else {
      if (isInDevMode()) {
        driverSupplier = () -> new SynthesizedFirefoxDriver(desiredCapabilities);
      } else {
        throw new RuntimeException("No driver can be provided for capabilities " + desiredCapabilities);
      }
    }
  }

  public WebDriver get() {
    return driverSupplier.get();
  }
}
