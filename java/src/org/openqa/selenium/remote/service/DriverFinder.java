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

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;
import org.openqa.selenium.remote.NoSuchDriverException;

public class DriverFinder {

  private static final Logger LOG = Logger.getLogger(DriverFinder.class.getName());

  public static Result getResult(DriverService service, Capabilities options) {
    return getResult(service, options, false);
  }

  public static Result getResult(DriverService service, Capabilities options, boolean offline) {
    Require.nonNull("Driver service", service);
    Require.nonNull("Browser options", options);
    try {
      String driverName = service.getDriverName();
      Result result = new Result(service.getExecutable());
      if (result.getDriverPath() == null) {
        result = new Result(System.getProperty(service.getDriverProperty()));
        if (result.getDriverPath() == null) {
          List<String> arguments = toArguments(options, offline);
          result = SeleniumManager.getInstance().getResult(arguments);
          Require.state(options.getBrowserName(), new File(result.getBrowserPath())).isExecutable();
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

      Require.state(driverName, new File(result.getDriverPath())).isExecutable();
      return result;
    } catch (RuntimeException e) {
      throw new NoSuchDriverException(
          String.format("Unable to obtain: %s, error %s", service.getDriverName(), e.getMessage()),
          e);
    }
  }

  private static List<String> toArguments(Capabilities options, boolean offline) {
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
    if (proxy != null) {
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
