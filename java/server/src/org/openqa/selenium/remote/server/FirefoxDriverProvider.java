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
package org.openqa.selenium.remote.server;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This driver provider that instantiates FirefoxDriver.
 */
public class FirefoxDriverProvider implements DriverProvider {

  private static final Logger LOG = Logger.getLogger(FirefoxDriverProvider.class.getName());

  @Override
  public Capabilities getProvidedCapabilities() {
    return DesiredCapabilities.firefox();
  }

  /**
   * Checks that driver class can be loaded.
   */
  @Override
  public boolean canCreateDriverInstances() {
    return true;
  }

  /**
   * Checks that the browser name set in the provided capabilities matches the browser name
   * set in the desired capabilities.
   * @param capabilities The desired capabilities
   * @return true if the browser name is the same, false otherwise
   */
  @Override
  public boolean canCreateDriverInstanceFor(Capabilities capabilities) {
    return BrowserType.FIREFOX.equals(capabilities.getBrowserName());
  }

  @Override
  public WebDriver newInstance(Capabilities capabilities) {
    LOG.info("Creating a new session for " + capabilities);
    return callConstructor("org.openqa.selenium.firefox.FirefoxDriver", capabilities);
  }

  private Class<? extends WebDriver> getDriverClass(String driverClassName) {
    try {
      return Class.forName(driverClassName).asSubclass(WebDriver.class);
    } catch (ClassNotFoundException e) {
      LOG.log(Level.INFO, "Driver class not found: " + driverClassName);
      return null;
    } catch (NoClassDefFoundError e) {
      LOG.log(Level.INFO, "Driver class not found: " + driverClassName);
      return null;
    } catch (UnsupportedClassVersionError e) {
      LOG.log(Level.INFO, "Driver class is built for higher Java version: " + driverClassName);
      return null;
    }
  }

  private WebDriver callConstructor(String driverClassName, Capabilities capabilities) {
    Class<? extends WebDriver> from = getDriverClass(driverClassName);
    try {
      Constructor<? extends WebDriver> constructor = from.getConstructor(Capabilities.class);
      return constructor.newInstance(capabilities);
    } catch (NoSuchMethodException e) {
      try {
        return from.newInstance();
      } catch (InstantiationException e1) {
        throw new WebDriverException(e);
      } catch (IllegalAccessException e1) {
        throw new WebDriverException(e);
      }
    } catch (InvocationTargetException e) {
      throw new WebDriverException(e);
    } catch (InstantiationException e) {
      throw new WebDriverException(e);
    } catch (IllegalAccessException e) {
      throw new WebDriverException(e);
    }
  }

  @Override
  public String toString() {
    return "Firefox/Marionette driver";
  }
}
