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

package org.openqa.selenium.firefox;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

/**
 * An implementation of the {#link WebDriver} interface that drives Firefox using Marionette interface.
 *
 * @deprecated One should use FirefoxDriver with capability marionette = true or false respectively.
 */
@Beta
@Deprecated
public class MarionetteDriver extends RemoteWebDriver {

  /**
   * Port which is used by default.
   */
  private final static int DEFAULT_PORT = 0;

  public MarionetteDriver() {
    this(null, null, DEFAULT_PORT);
  }

  public MarionetteDriver(Capabilities capabilities) {
    this(null, capabilities, DEFAULT_PORT);
  }

  public MarionetteDriver(int port) {
    this(null, null, port);
  }

  public MarionetteDriver(GeckoDriverService service) {
    this(service, null, DEFAULT_PORT);
  }

  public MarionetteDriver(GeckoDriverService service, Capabilities capabilities) {
    this(service, capabilities, DEFAULT_PORT);
  }

  public MarionetteDriver(GeckoDriverService service, Capabilities capabilities,
                                int port) {
    if (capabilities == null) {
      capabilities = DesiredCapabilities.firefox();
    }

    if (service == null) {
      service = setupService(port);
    }
    run(service, capabilities);
  }

  private void run(GeckoDriverService service, Capabilities capabilities) {
    setCommandExecutor(new DriverCommandExecutor(service));

    startSession(capabilities);
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
      "Setting the file detector only works on remote webdriver instances obtained " +
      "via RemoteWebDriver");
  }

  private GeckoDriverService setupService(int port) {
    GeckoDriverService.Builder builder = new GeckoDriverService.Builder();
    builder.usingPort(port);

    return builder.build();
  }
}
