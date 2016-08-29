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

import com.google.common.base.Supplier;
import com.google.common.collect.Lists;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.logging.Level;

public class WebDriverBuilder implements Supplier<WebDriver> {
  private Capabilities desiredCapabilities;
  private Capabilities requiredCapabilities;
  private final Browser browser;

  public WebDriverBuilder() {
    this(Browser.detect());
  }

  public WebDriverBuilder(Browser browser) {
    this.browser = browser;
  }

  public WebDriver get() {
    Capabilities standardCapabilities = BrowserToCapabilities.of(browser);
    Capabilities desiredCaps = new DesiredCapabilities(standardCapabilities,
        desiredCapabilities);

    List<Supplier<WebDriver>> suppliers = getSuppliers(desiredCaps,
        requiredCapabilities);

    for (Supplier<WebDriver> supplier : suppliers) {
      WebDriver driver = supplier.get();
      if (driver != null) {
        modifyLogLevel(driver);
        return driver;
      }
    }

    throw new RuntimeException("Cannot instantiate driver instance: " + desiredCapabilities);
  }

  private void modifyLogLevel(WebDriver driver) {
    Class<?>[] args = {Level.class};
    Method setLogLevel;
    try {
      setLogLevel = driver.getClass().getMethod("setLogLevel", args);

      String value = System.getProperty("selenium.browser.log_level", "INFO");
      LogLevel level = LogLevel.valueOf(value);
      setLogLevel.invoke(driver, level.getLevel());
    } catch (NoSuchMethodException e) {
      return;
    } catch (InvocationTargetException e) {
      throw new RuntimeException(e);
    } catch (IllegalAccessException e) {
      throw new RuntimeException(e);
    }
  }

  private List<Supplier<WebDriver>> getSuppliers(Capabilities desiredCaps,
      Capabilities requiredCaps) {
    List<Supplier<WebDriver>> suppliers = Lists.newArrayList();
    suppliers.add(new ExternalDriverSupplier(desiredCaps, requiredCaps));
    suppliers.add(new SauceBackedDriverSupplier(desiredCaps));
    suppliers.add(new RemoteSupplier(desiredCaps, requiredCaps));
    suppliers.add(new PhantomJSDriverSupplier(desiredCaps));
    suppliers.add(new TestInternetExplorerSupplier(desiredCaps));
    suppliers.add(new ReflectionBackedDriverSupplier(desiredCaps, requiredCaps));
    suppliers.add(new DefaultDriverSupplier(desiredCaps, requiredCaps));
    return suppliers;
  }

  public WebDriverBuilder setDesiredCapabilities(Capabilities caps) {
    this.desiredCapabilities = caps;
    return this;
  }

  public WebDriverBuilder setRequiredCapabilities(Capabilities caps) {
    this.requiredCapabilities = caps;
    return this;
  }

  private enum LogLevel {
    OFF("OFF", Level.OFF),
    DEBUG("DEBUG", Level.FINE),
    INFO("INFO", Level.INFO),
    WARNING("WARNING", Level.WARNING),
    ERROR("ERROR", Level.SEVERE);

    private final String value;
    private final Level level;

    LogLevel(String value, Level level) {
      this.value = value;
      this.level = level;
    }

    public Level getLevel() {
      return level;
    }
  }
}
