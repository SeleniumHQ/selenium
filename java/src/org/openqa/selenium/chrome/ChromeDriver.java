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

import com.google.common.collect.ImmutableMap;
import java.util.Map;
import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chromium.ChromiumDriver;
import org.openqa.selenium.chromium.ChromiumDriverCommandExecutor;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.manager.SeleniumManagerOutput.Result;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.service.DriverFinder;
import org.openqa.selenium.remote.service.DriverService;

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
   * Creates a new ChromeDriver instance with the specified options.
   *
   * @param options The options to use.
   * @see #ChromeDriver(ChromeDriverService, ChromeOptions)
   */
  public ChromeDriver(ChromeOptions options) {
    this(ChromeDriverService.createDefaultService(), options);
  }

  /**
   * Creates a new ChromeDriver instance with the specified options. The {@code service} will be
   * started along with the driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param options The options required from ChromeDriver.
   */
  public ChromeDriver(ChromeDriverService service, ChromeOptions options) {
    this(service, options, ClientConfig.defaultConfig());
  }

  public ChromeDriver(
      ChromeDriverService service, ChromeOptions options, ClientConfig clientConfig) {
    super(generateExecutor(service, options, clientConfig), options, ChromeOptions.CAPABILITY);
    casting = new AddHasCasting().getImplementation(getCapabilities(), getExecuteMethod());
    cdp = new AddHasCdp().getImplementation(getCapabilities(), getExecuteMethod());
  }

  private static ChromeDriverCommandExecutor generateExecutor(
      ChromeDriverService service, ChromeOptions options, ClientConfig clientConfig) {
    Require.nonNull("Driver service", service);
    Require.nonNull("Driver options", options);
    Require.nonNull("Driver clientConfig", clientConfig);
    if (service.getExecutable() == null) {
      Result result = DriverFinder.getPath(service, options);
      service.setExecutable(result.getDriverPath());
      options.setBinary(result.getBrowserPath());
    }
    return new ChromeDriverCommandExecutor(service, clientConfig);
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new ChromeOptions());
  }

  private static class ChromeDriverCommandExecutor extends ChromiumDriverCommandExecutor {
    public ChromeDriverCommandExecutor(DriverService service, ClientConfig clientConfig) {
      super(service, getExtraCommands(), clientConfig);
    }

    private static Map<String, CommandInfo> getExtraCommands() {
      return ImmutableMap.<String, CommandInfo>builder()
          .putAll(new AddHasCasting().getAdditionalCommands())
          .putAll(new AddHasCdp().getAdditionalCommands())
          .build();
    }
  }
}
