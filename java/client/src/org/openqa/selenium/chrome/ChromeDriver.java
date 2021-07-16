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

package org.openqa.selenium.chrome;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chromium.ChromiumDriver;
import org.openqa.selenium.chromium.ChromiumDriverCommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;

/**
 * A {@link WebDriver} implementation that controls a Chrome browser running on the local machine.
 * It requires a <code>chromedriver</code> executable to be available in PATH.
 *
 * @see <a href="https://sites.google.com/chromium.org/driver/">chromedriver</a>
 */
public class ChromeDriver extends ChromiumDriver {

  /**
   * Creates a new ChromeDriver using the {@link ChromeDriverService#createDefaultService default}
   * server configuration.
   *
   * @see #ChromeDriver(ChromeDriverService, ChromeOptions)
   */
  public ChromeDriver() {
    this(ChromeDriverService.createDefaultService(), new ChromeOptions());
  }

  /**
   * Creates a new ChromeDriver instance. The {@code service} will be started along with the driver,
   * and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @see RemoteWebDriver#RemoteWebDriver(org.openqa.selenium.remote.CommandExecutor, Capabilities)
   */
  public ChromeDriver(ChromeDriverService service) {
    this(service, new ChromeOptions());
  }

  /**
   * Creates a new ChromeDriver instance. The {@code capabilities} will be passed to the
   * ChromeDriver service.
   *
   * @param capabilities The capabilities required from the ChromeDriver.
   * @see #ChromeDriver(ChromeDriverService, Capabilities)
   * @deprecated Use {@link ChromeDriver(ChromeOptions)} instead.
   */
  @Deprecated
  public ChromeDriver(Capabilities capabilities) {
    this(ChromeDriverService.createDefaultService(), capabilities);
  }

  /**
   * Creates a new ChromeDriver instance with the specified options.
   *
   * @param options The options to use.
   * @see #ChromeDriver(ChromeDriverService, ChromeOptions)
   */
  public ChromeDriver(ChromeOptions options) {
    this(ChromeDriverService.createServiceWithConfig(options), options);
  }

  /**
   * Creates a new ChromeDriver instance with the specified options. The {@code service} will be
   * started along with the driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param options The options to use.
   */
  public ChromeDriver(ChromeDriverService service, ChromeOptions options) {
    this(service, (Capabilities) options);
  }

  /**
   * Creates a new ChromeDriver instance. The {@code service} will be started along with the
   * driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service      The service to use.
   * @param capabilities The capabilities required from the ChromeDriver.
   * @deprecated Use {@link ChromeDriver(ChromeDriverService, ChromeOptions)} instead.
   */
  @Deprecated
  public ChromeDriver(ChromeDriverService service, Capabilities capabilities) {
    super(new ChromiumDriverCommandExecutor("goog", service), capabilities, ChromeOptions.CAPABILITY);
  }

}
