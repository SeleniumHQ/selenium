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

import com.google.common.base.Supplier;
import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;

import java.lang.reflect.InvocationTargetException;
import java.util.logging.Logger;

public class DefaultDriverSupplier implements Supplier<WebDriver> {

  private static final Logger log = Logger.getLogger(DefaultDriverSupplier.class.getName());
  private Class<? extends WebDriver> driverClass;
  private final Capabilities desiredCapabilities;
  private final Capabilities requiredCapabilities;

  public DefaultDriverSupplier(Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    this.desiredCapabilities = desiredCapabilities;
    this.requiredCapabilities = requiredCapabilities;

    try {
      // Only support a default driver if we're actually in dev mode.
      if (isInDevMode()) {
        driverClass = Class.forName("org.openqa.selenium.testing.drivers.SynthesizedFirefoxDriver")
            .asSubclass(WebDriver.class);
      } else {
        driverClass = null;
      }
    } catch (ClassNotFoundException e) {
      log.severe("Unable to find the default class on the classpath. Tests will fail");
    }
  }

  public WebDriver get() {
    log.info("Providing default driver instance");

    try {
      return driverClass.getConstructor(Capabilities.class, Capabilities.class).
          newInstance(desiredCapabilities, requiredCapabilities);
    } catch (InstantiationException e) {
      throw new RuntimeException(e);
    } catch (IllegalAccessException e) {
      throw new RuntimeException(e);
    } catch (NoSuchMethodException e) {
      throw new RuntimeException(e);
    } catch (InvocationTargetException e) {
      throw Throwables.propagate(e.getTargetException());
    }
  }
}
