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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

import java.io.IOException;

/**
 * A WebDriver implementation that controls Safari using a browser extension
 * (consequently, only Safari 5.1+ is supported).
 *
 * This driver can be configured using the {@link SafariOptions} class.
 */
public class SafariDriver extends RemoteWebDriver {

  /**
   * Capability to force usage of the deprecated SafariDriver extension while running
   * on macOS Sierra.
   *
   * <pre>
   *   DesiredCapabilities safariCap = DesiredCapabilities.Safari();
   *   safariCap.setCapability(SafariDriver.USE_LEGACY_DRIVER_CAPABILITY, true);
   *   WebDriver driver = new SafariDriver(safariCap);
   * </pre>
   */
  public static final String USE_LEGACY_DRIVER_CAPABILITY = "useLegacyDriver";

  private SafariDriverService service;

  /**
   * Initializes a new SafariDriver} class with default {@link SafariOptions}.
   */
  public SafariDriver() {
    this(new SafariOptions());
  }

  /**
   * Converts the specified {@link DesiredCapabilities} to a {@link SafariOptions}
   * instance and initializes a new SafariDriver using these options.
   * @see SafariOptions#fromCapabilities(org.openqa.selenium.Capabilities)
   *
   * @param desiredCapabilities capabilities requested of the driver
   */
  public SafariDriver(Capabilities desiredCapabilities) {
    this(SafariOptions.fromCapabilities(desiredCapabilities));
  }

  /**
   * Initializes a new SafariDriver using the specified {@link SafariOptions}.
   *
   * @param safariOptions safari specific options / capabilities for the driver
   */
  public SafariDriver(SafariOptions safariOptions) {
    super(getExecutor(safariOptions), safariOptions.toCapabilities());
  }

  private static CommandExecutor getExecutor(SafariOptions options) {
    Object useLegacy = options.toCapabilities().getCapability(USE_LEGACY_DRIVER_CAPABILITY);
    SafariDriverService service = SafariDriverService.createDefaultService(options);
    if ((useLegacy == null || !(Boolean)useLegacy) && service != null) {
      return new DriverCommandExecutor(service);
    }
    return new SafariDriverCommandExecutor(options);
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  @Override
  protected void startClient() {
    CommandExecutor commandExecutor = this.getCommandExecutor();
    if (commandExecutor instanceof SafariDriverCommandExecutor) {
      try {
        ((SafariDriverCommandExecutor)commandExecutor).start();
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    } else {
      super.startClient();
    }
  }

  @Override
  protected void stopClient() {
    CommandExecutor commandExecutor = this.getCommandExecutor();
    if (commandExecutor instanceof SafariDriverCommandExecutor) {
      ((SafariDriverCommandExecutor)commandExecutor).stop();
    } else {
      super.stopClient();
    }
  }

  @Override
  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    // Get the screenshot as base64.
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }
}
