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

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.safari.SafariDriver;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;

public class DefaultDriverSupplier implements Supplier<WebDriver> {

  private static Map<String, Function<Capabilities, WebDriver>> driverConstructors =
      new ImmutableMap.Builder<String, Function<Capabilities, WebDriver>>()
          .put(BrowserType.CHROME, TestChromeDriver::new)
          .put(BrowserType.OPERA_BLINK, TestOperaBlinkDriver::new)
          .put(BrowserType.FIREFOX, FirefoxDriver::new)
          .put(BrowserType.HTMLUNIT, HtmlUnitDriver::new)
          .put(BrowserType.IE, InternetExplorerDriver::new)
          .put(BrowserType.EDGE, TestEdgeDriver::new)
          .put(BrowserType.SAFARI, SafariDriver::new)
          .put("Safari Technology Preview", SafariDriver::new)
          .build();

  private Capabilities capabilities;

  DefaultDriverSupplier(Capabilities capabilities) {
    this.capabilities = capabilities;
  }

  @Override
  public WebDriver get() {
    Function<Capabilities, WebDriver> driverConstructor;

    if (capabilities != null) {
      String browserName = capabilities.getBrowserName();
      driverConstructor = driverConstructors.getOrDefault(browserName, caps -> {
        throw new RuntimeException("No driver can be provided for capabilities " + caps);
      });
    } else {
      String className = System.getProperty("selenium.browser.class_name");
      try {
        Class<? extends WebDriver> driverClass = Class.forName(className).asSubclass(WebDriver.class);
        Constructor<? extends WebDriver> constructor = driverClass.getConstructor(Capabilities.class);
        driverConstructor = (caps) -> {
          try {
            return constructor.newInstance(caps);
          } catch (InstantiationException | IllegalAccessException | InvocationTargetException e) {
            throw new RuntimeException(e);
          }
        };
      } catch (ClassNotFoundException | NoSuchMethodException e) {
        throw new RuntimeException(e);
      }
    }

    return driverConstructor.apply(capabilities);
  }
}
