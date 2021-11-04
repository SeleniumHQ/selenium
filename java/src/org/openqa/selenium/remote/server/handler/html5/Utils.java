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

package org.openqa.selenium.remote.server.handler.html5;

import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.mobile.NetworkConnection;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.html5.RemoteApplicationCache;
import org.openqa.selenium.remote.html5.RemoteLocationContext;
import org.openqa.selenium.remote.html5.RemoteWebStorage;
import org.openqa.selenium.remote.mobile.RemoteNetworkConnection;

import java.lang.reflect.InvocationTargetException;

/**
 * Provides utility methods for converting a {@link WebDriver} instance to the various HTML5
 * role interfaces. Each method will throw an {@link UnsupportedCommandException} if the driver
 * does not support the corresponding HTML5 feature.
 */
public class Utils {

  static ApplicationCache getApplicationCache(WebDriver driver) {
    return convert(driver, ApplicationCache.class, CapabilityType.SUPPORTS_APPLICATION_CACHE,
                   RemoteApplicationCache.class);
  }

  public static NetworkConnection getNetworkConnection(WebDriver driver) {
	    return convert(driver, NetworkConnection.class, CapabilityType.SUPPORTS_NETWORK_CONNECTION,
	        RemoteNetworkConnection.class);
  }

  static LocationContext getLocationContext(WebDriver driver) {
    return convert(driver, LocationContext.class, CapabilityType.SUPPORTS_LOCATION_CONTEXT,
        RemoteLocationContext.class);
  }

  static WebStorage getWebStorage(WebDriver driver) {
    return convert(driver, WebStorage.class, CapabilityType.SUPPORTS_WEB_STORAGE,
        RemoteWebStorage.class);
  }

  private static <T> T convert(
      WebDriver driver, Class<T> interfaceClazz, String capability,
      Class<? extends T> remoteImplementationClazz) {
    if (interfaceClazz.isInstance(driver)) {
      return interfaceClazz.cast(driver);
    }

    if (driver instanceof ExecuteMethod
        && driver instanceof HasCapabilities
        && ((HasCapabilities) driver).getCapabilities().is(capability)) {
      try {
        return remoteImplementationClazz
            .getConstructor(ExecuteMethod.class)
            .newInstance((ExecuteMethod) driver);
      } catch (InvocationTargetException e) {
        Throwable cause = e.getCause();
        throw cause instanceof RuntimeException ?
              (RuntimeException) cause :
              new RuntimeException(cause);
      } catch (ReflectiveOperationException e) {
        throw new WebDriverException(e);
      }
    }

    throw new UnsupportedCommandException(
        "driver (" + driver.getClass().getName() + ") does not support "
        + interfaceClazz.getName());
  }
}
