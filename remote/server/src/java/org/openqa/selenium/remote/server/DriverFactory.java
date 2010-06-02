/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;

public class DriverFactory {
  private Map<Capabilities, Class<? extends WebDriver>> capabilitiesToDriver =
      new ConcurrentHashMap<Capabilities, Class<? extends WebDriver>>();

  public void registerDriver(Capabilities capabilities, Class<? extends WebDriver> implementation) {
    capabilitiesToDriver.put(capabilities, implementation);
  }

  protected Class<? extends WebDriver> getBestMatchFor(Capabilities desired) {
    int numberOfFieldsMatched = 0;
    Class<? extends WebDriver> bestMatch = null;

    for (Map.Entry<Capabilities, Class<? extends WebDriver>> entry : capabilitiesToDriver.entrySet()) {
      int count = 0;
      Capabilities caps = entry.getKey();
      if (matches(caps.getBrowserName(), desired.getBrowserName())) {
        count++;
      }
      if (matches(caps.getVersion(), desired.getVersion())) {
        count++;
      }
      if (caps.isJavascriptEnabled() == desired.isJavascriptEnabled()) {
        count++;
      }
      Platform capPlatform = caps.getPlatform();
      Platform desiredPlatform = desired.getPlatform();

      if (capPlatform != null && desiredPlatform != null) {
        if (capPlatform.is(desiredPlatform)) {
          count++;
        }
      }

      if (count > numberOfFieldsMatched) {
        numberOfFieldsMatched = count;
        bestMatch = entry.getValue();
      }
    }

    return bestMatch;
  }

  private boolean matches(String value, String value2) {
    // We don't match on null
    return value != null && value.equals(value2);
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
