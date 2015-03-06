/*
Copyright 2014 Selenium committers
Copyright 2014 Software Freedom Conservancy

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
package org.openqa.selenium.remote.server;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.logging.Logger;

public class DefaultDriverProvider implements DriverProvider {

  private static final Logger log = Logger.getLogger(DefaultDriverProvider.class.getName());

  private Capabilities capabilities;
  private Class<? extends WebDriver> implementation;

  public DefaultDriverProvider(Capabilities capabilities, Class<? extends WebDriver> implementation) {
    this.capabilities = capabilities;
    this.implementation = implementation;
  }

  @Override
  public Capabilities getProvidedCapabilities() {
    return capabilities;
  }

  @Override
  public Class<? extends WebDriver> getDriverClass() {
    return implementation;
  }

  @Override
  public WebDriver newInstance(Capabilities capabilities) {
    log.info("Creating a new session for " + capabilities);
    // Try and call the single arg constructor that takes a capabilities first
    return callConstructor(implementation, capabilities);
  }

  private WebDriver callConstructor(Class<? extends WebDriver> from, Capabilities capabilities) {
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
}
