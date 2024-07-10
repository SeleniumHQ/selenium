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

package org.openqa.selenium.remote.service;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;
import org.openqa.selenium.remote.NoSuchDriverException;

public class DriverFinder {

  private static final Logger LOG = Logger.getLogger(DriverFinder.class.getName());
  private final DriverService service;
  private final Capabilities options;
  private final SeleniumManager seleniumManager;
  private boolean offline;
  private Result result;

  public DriverFinder(DriverService service, Capabilities options) {
    this(service, options, SeleniumManager.getInstance());
  }

  DriverFinder(DriverService service, Capabilities options, SeleniumManager seleniumManager) {
    this.service = service;
    this.options = options;
    this.seleniumManager = seleniumManager;
  }

  public String getDriverPath() {
    return getBinaryPaths().getDriverPath();
  }

  public String getBrowserPath() {
    return getBinaryPaths().getBrowserPath();
  }

  public boolean isAvailable() {
    try {
      offline = false;
      getBinaryPaths();
      return true;
    } catch (NoSuchDriverException e) {
      return false;
    } catch (IllegalStateException | WebDriverException e) {
      LOG.log(Level.WARNING, "failed to discover driver path", e);
      return false;
    }
  }

  public boolean isPresent() {
    try {
      offline = true;
      getBinaryPaths();
      return true;
    } catch (NoSuchDriverException e) {
      return false;
    } catch (IllegalStateException | WebDriverException e) {
      LOG.log(Level.WARNING, "failed to discover driver path", e);
      return false;
    }
  }

  public boolean hasBrowserPath() {
    String browserPath = result.getBrowserPath();
    return browserPath != null && !browserPath.isEmpty();
  }

  private Result getBinaryPaths() {
    if (result == null) {
      try {
        String driverName = service.getDriverName();
        result = new Result(service.getExecutable());
        if (result.getDriverPath() == null) {
          result = new Result(System.getProperty(service.getDriverProperty()));
          if (result.getDriverPath() == null) {
            List<String> arguments = toArguments();
            result = seleniumManager.getBinaryPaths(arguments);
            Require.state(options.getBrowserName(), Path.of(result.getBrowserPath()))
                .isExecutable();
          } else {
            LOG.fine(
                String.format(
                    "Skipping Selenium Manager, path to %s found in system property: %s",
                    driverName, result.getDriverPath()));
          }
        } else {
          LOG.fine(
              String.format(
                  "Skipping Selenium Manager, path to %s specified in Service class: %s",
                  driverName, result.getDriverPath()));
        }

        Require.state(driverName, Path.of(result.getDriverPath())).isExecutable();
      } catch (RuntimeException e) {
        throw new NoSuchDriverException(
            String.format(
                "Unable to obtain: %s, error %s", service.getDriverName(), e.getMessage()),
            e);
      }
    }

    return result;
  }

  private List<String> toArguments() {
    List<String> arguments = new ArrayList<>();
    arguments.add("--browser");
    arguments.add(options.getBrowserName());

    if (!options.getBrowserVersion().isEmpty()) {
      arguments.add("--browser-version");
      arguments.add(options.getBrowserVersion());
    }

    String browserBinary = getBrowserBinary(options);
    if (browserBinary != null && !browserBinary.isEmpty()) {
      arguments.add("--browser-path");
      arguments.add(browserBinary);
    }

    if (offline) {
      arguments.add("--offline");
    }

    Proxy proxy = Proxy.extractFrom(options);
    if (proxy != null
        && proxy.getProxyType() != Proxy.ProxyType.DIRECT
        && proxy.getProxyType() != Proxy.ProxyType.AUTODETECT) {
      arguments.add("--proxy");
      if (proxy.getSslProxy() != null) {
        arguments.add(proxy.getSslProxy());
      } else if (proxy.getHttpProxy() != null) {
        arguments.add(proxy.getHttpProxy());
      }
    }
    return arguments;
  }

  /**
   * Returns the browser binary path when present in the vendor options
   *
   * @param options browser options used to start the session
   * @return the browser binary path when present, only Chrome/Firefox/Edge
   */
  private static String getBrowserBinary(Capabilities options) {
    List<String> vendorOptionsCapabilities =
        Arrays.asList("moz:firefoxOptions", "goog:chromeOptions", "ms:edgeOptions");
    for (String vendorOptionsCapability : vendorOptionsCapabilities) {
      if (options.asMap().containsKey(vendorOptionsCapability)) {
        try {
          @SuppressWarnings("unchecked")
          Map<String, Object> vendorOptions =
              (Map<String, Object>) options.getCapability(vendorOptionsCapability);
          return (String) vendorOptions.get("binary");
        } catch (Exception e) {
          LOG.warning(
              String.format(
                  "Exception while retrieving the browser binary path. %s: %s",
                  options, e.getMessage()));
        }
      }
    }
    return null;
  }
}
