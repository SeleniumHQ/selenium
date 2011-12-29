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

import static org.openqa.selenium.remote.CapabilityType.HAS_NATIVE_EVENTS;

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
  private Capabilities capabilities;

  public WebDriver get() {
    Capabilities caps = getCabilitiesFor(Browser.detect());
    caps = new DesiredCapabilities(capabilities, caps);

    List<Supplier<WebDriver>> suppliers = getSuppliers(caps);

    for (Supplier<WebDriver> supplier : suppliers) {
      WebDriver driver = supplier.get();
      if (driver != null) {
        modifyLogLevel(driver);
        return driver;
      }
    }

    throw new RuntimeException("Cannot instantiate driver instance: " + caps);
  }

  private void modifyLogLevel(WebDriver driver) {
    Class[] args = {Level.class};
    Method setLogLevel = null;
    try {
      setLogLevel = driver.getClass().getMethod("setLogLevel", args);

      String value = System.getProperty("selenium.browser.log_level", "OFF");
      Level level = LogLevel.find(value);
      setLogLevel.invoke(driver.getClass(), level);
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
    suppliers.add(new OperaDriverSupplier(caps));
    suppliers.add(new ReflectionBackedDriverSupplier(caps));
    suppliers.add(new DefaultDriverSupplier(caps));
    return suppliers;
  }

  protected Capabilities getCabilitiesFor(Browser detect) {
    if (detect == null) {
      return null;
    }

    DesiredCapabilities caps;

    switch (detect) {
      case chrome:
        caps = DesiredCapabilities.chrome();
        break;

      case ff:
        caps = DesiredCapabilities.firefox();
        break;

      case htmlunit:
        caps = DesiredCapabilities.htmlUnit();
        caps.setJavascriptEnabled(false);
        break;

      case htmlunit_js:
        caps = DesiredCapabilities.htmlUnit();
        caps.setJavascriptEnabled(true);
        break;

      case ie:
        caps = DesiredCapabilities.internetExplorer();
        break;

      case opera:
        caps = DesiredCapabilities.opera();
        break;

      case ipad:
      case iphone:
      case safari:
        throw new RuntimeException("Browser is unsupported: " + detect);

      default:
        throw new RuntimeException("Cannot determine browser config to use");
    }

    String version = System.getProperty("selenium.browser.version");
    if (version != null) {
      caps.setVersion(version);
    }

    caps.setCapability(HAS_NATIVE_EVENTS,
        Boolean.getBoolean("selenium.browser.native_events"));

    return caps;
  }

  public WebDriverBuilder setCapabilities(Capabilities capabilities) {
    this.capabilities = capabilities;

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

    static Level find(String value) {
      for (LogLevel l : LogLevel.values()) {
        if (l.value.equalsIgnoreCase(value)) {
          return l.level;
        }
      }
      throw new IllegalArgumentException("Could not find: " + value);
    }
  }
}
