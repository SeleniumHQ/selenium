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

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverService;

import java.util.Map;

/**
 * A WebDriver implementation that controls Safari using a browser extension
 * (consequently, only Safari 5.1+ is supported).
 *
 * This driver can be configured using the {@link SafariOptions} class.
 */
public class SafariDriver extends RemoteWebDriver implements HasPermissions, HasDebugger {

  private final HasPermissions permissions;
  private final HasDebugger debugger;

  /**
   * Initializes a new SafariDriver} class with default {@link SafariOptions}.
   */
  public SafariDriver() {
    this(new SafariOptions());
  }

  /**
   * Initializes a new SafariDriver using the specified {@link SafariOptions}.
   *
   * @param safariOptions safari specific options / capabilities for the driver
   */
  public SafariDriver(SafariOptions safariOptions) {
    this(safariOptions.getUseTechnologyPreview() ?
         SafariTechPreviewDriverService.createDefaultService() :
         SafariDriverService.createDefaultService(),
         safariOptions);
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
  public SafariDriver(DriverService safariServer, SafariOptions safariOptions) {
    super(new SafariDriverCommandExecutor(safariServer), safariOptions);
    permissions = new AddHasPermissions().getImplementation(getCapabilities(), getExecuteMethod());
    debugger = new AddHasDebugger().getImplementation(getCapabilities(), getExecuteMethod());
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new SafariOptions());
  }

  @Override
  public void setPermissions(String permission, boolean value) {
    Require.nonNull("Permission Name", permission);
    Require.nonNull("Permission Value", value);

    this.permissions.setPermissions(permission, value);
  }

  @Override
  public Map<String, Boolean> getPermissions() {
    return permissions.getPermissions();
  }

  @Override
  public void attachDebugger() {
    debugger.attachDebugger();
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  private static class SafariDriverCommandExecutor extends DriverCommandExecutor {
    public SafariDriverCommandExecutor(DriverService service) {
      super(service, getExtraCommands());
    }

    private static Map<String, CommandInfo> getExtraCommands() {
      return ImmutableMap.<String, CommandInfo>builder()
        .putAll(new AddHasPermissions().getAdditionalCommands())
        .putAll(new AddHasDebugger().getAdditionalCommands())
        .build();
    }
  }
}
