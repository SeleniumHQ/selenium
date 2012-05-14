/*
Copyright 2007-2009 Selenium committers

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

import static com.google.common.base.Preconditions.checkState;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class DefaultDriverFactory implements DriverFactory {
  private Map<Capabilities, Class<? extends WebDriver>> capabilitiesToDriver =
      new ConcurrentHashMap<Capabilities, Class<? extends WebDriver>>();

  public void registerDriver(Capabilities capabilities, Class<? extends WebDriver> implementation) {
    capabilitiesToDriver.put(capabilities, implementation);
  }

  protected Class<? extends WebDriver> getBestMatchFor(Capabilities desired) {
    // We won't be able to make a match if no drivers have been registered.
    checkState(!capabilitiesToDriver.isEmpty(),
        "No drivers have been registered, will be unable to match %s", desired);
    Capabilities bestMatchingCapabilities =
        CapabilitiesComparator.getBestMatch(desired, capabilitiesToDriver.keySet());
    return capabilitiesToDriver.get(bestMatchingCapabilities);
  }

  public WebDriver newInstance(Capabilities capabilities) {
    Class<? extends WebDriver> clazz = getBestMatchFor(capabilities);

    // Try and call the single arg constructor that takes a capabilities first
    return callConstructor(clazz, capabilities);
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

  public boolean hasMappingFor(Capabilities capabilities) {
    return capabilitiesToDriver.containsKey(capabilities);
  }
}
