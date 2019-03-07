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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.safari.SafariDriver;

import java.util.function.Supplier;

public class DefaultDriverSupplier implements Supplier<WebDriver> {

  private Supplier<WebDriver> driverSupplier;

  public DefaultDriverSupplier(Capabilities capabilities) {
    String browserName = capabilities == null ? "" : capabilities.getBrowserName();

    if (BrowserType.CHROME.equals(browserName)) {
      driverSupplier = () -> new TestChromeDriver(capabilities);
    } else if (BrowserType.OPERA_BLINK.equals(browserName)) {
      driverSupplier = () -> new TestOperaBlinkDriver(capabilities);
    } else if (BrowserType.FIREFOX.equals(browserName)) {
      driverSupplier = () -> new FirefoxDriver(capabilities);
    } else if (BrowserType.HTMLUNIT.equals(browserName)) {
      driverSupplier = () -> new HtmlUnitDriver(
          capabilities == null ? new ImmutableCapabilities() : capabilities);
    } else if (BrowserType.IE.equals(browserName)) {
      driverSupplier = () -> new InternetExplorerDriver(capabilities);
    } else if (BrowserType.EDGE.equals(browserName)) {
      driverSupplier = () -> new EdgeDriver(capabilities);
    } else if (browserName.toLowerCase().contains(BrowserType.SAFARI)) {
      driverSupplier = () -> new SafariDriver(capabilities);
    } else if (System.getProperty("selenium.browser.class_name") != null) {
      // No browser name specified, let's try reflection
      String className = System.getProperty("selenium.browser.class_name");
      driverSupplier = () -> {
        try {
          Class<? extends WebDriver> driverClass = Class.forName(className).asSubclass(WebDriver.class);
          return driverClass.getConstructor(Capabilities.class).newInstance(capabilities);
        } catch (ReflectiveOperationException e) {
          throw new RuntimeException(e);
        }
      };
    } else {
      throw new RuntimeException("No driver can be provided for capabilities " + capabilities);
    }
  }

  @Override
  public WebDriver get() {
    return driverSupplier.get();
  }
}
