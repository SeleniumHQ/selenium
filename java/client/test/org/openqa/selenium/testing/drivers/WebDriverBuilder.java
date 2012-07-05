/*
Copyright 2011 Selenium committers
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
import com.google.common.collect.Lists;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.logging.Level;

public class WebDriverBuilder implements Supplier<WebDriver> {
  private Capabilities additionalCapabilities;
  private final Browser browser;

  public WebDriverBuilder() {
    this(Browser.detect());
  }

  public WebDriverBuilder(Browser browser) {
    this.browser = browser;
  }

  public WebDriver get() {
    Capabilities standardCapabilities = BrowserToCapabilities.of(browser);
    Capabilities desiredCapabilities =
        new DesiredCapabilities(standardCapabilities, additionalCapabilities);

    List<Supplier<WebDriver>> suppliers = getSuppliers(desiredCapabilities);

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
      throw Throwables.propagate(e);
    } catch (IllegalAccessException e) {
      throw Throwables.propagate(e);
    }
  }

  private List<Supplier<WebDriver>> getSuppliers(Capabilities caps) {
    List<Supplier<WebDriver>> suppliers = Lists.newArrayList();
    suppliers.add(new SauceBackedDriverSupplier(caps));
    suppliers.add(new RemoteSupplier(caps));
    suppliers.add(new SeleniumBackedSupplier(caps));
    suppliers.add(new OperaDriverSupplier(caps));
    suppliers.add(new ReflectionBackedDriverSupplier(caps));
    suppliers.add(new DefaultDriverSupplier(caps));
    return suppliers;
  }

  public WebDriverBuilder setCapabilities(Capabilities additionalCapabilities) {
    this.additionalCapabilities = additionalCapabilities;

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
