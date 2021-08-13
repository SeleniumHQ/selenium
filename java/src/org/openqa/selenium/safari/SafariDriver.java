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

package org.openqa.selenium.safari;

import static java.util.Collections.singletonMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;

/**
 * A WebDriver implementation that controls Safari using a browser extension
 * (consequently, only Safari 5.1+ is supported).
 *
 * This driver can be configured using the {@link SafariOptions} class.
 */
public class SafariDriver extends RemoteWebDriver {

  /**
   * Initializes a new SafariDriver} class with default {@link SafariOptions}.
   */
  public SafariDriver() {
    this(new SafariOptions());
  }

  /**
   * Converts the specified {@link Capabilities} to a {@link SafariOptions}
   * instance and initializes a new SafariDriver using these options.
   * @see SafariOptions#fromCapabilities(Capabilities)
   *
   * @param desiredCapabilities capabilities requested of the driver
   * @deprecated Use {@link SafariDriver(SafariOptions)} instead.
   */
  @Deprecated
  public SafariDriver(Capabilities desiredCapabilities) {
    this(SafariOptions.fromCapabilities(desiredCapabilities));
  }

  /**
   * Initializes a new SafariDriver using the specified {@link SafariOptions}.
   *
   * @param safariOptions safari specific options / capabilities for the driver
   */
  public SafariDriver(SafariOptions safariOptions) {
    this(SafariDriverService.createDefaultService(safariOptions), safariOptions);
  }

  /**
   * Initializes a new SafariDriver backed by the specified {@link SafariDriverService}.
   *
   * @param safariService preconfigured safari service
   */
  public SafariDriver(SafariDriverService safariService) {
    this(safariService, new SafariOptions());
  }

  /**
   * Initializes a new SafariDriver using the specified {@link SafariOptions}.
   *
   * @param safariOptions safari specific options / capabilities for the driver
   */
  public SafariDriver(SafariDriverService safariServer, SafariOptions safariOptions) {
    super(new SafariDriverCommandExecutor(safariServer), safariOptions);
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  /**
   * Open either a new tab or window, depending on what is requested, and return the window handle
   * without switching to it.
   *
   * @return The handle of the new window.
   */
  @Beta
  public String newWindow(WindowType type) {
    Response response = execute(
        "SAFARI_NEW_WINDOW",
        singletonMap("newTab", type == WindowType.TAB));

    return (String) response.getValue();
  }

  public enum WindowType {
    TAB,
    WINDOW,
  }
}
