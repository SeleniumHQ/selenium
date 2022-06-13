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
package org.openqa.selenium.edge;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chromium.ChromiumDriver;
import org.openqa.selenium.chromium.ChromiumDriverCommandExecutor;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.CommandInfo;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.service.DriverService;

import java.util.Map;

/**
 * A {@link WebDriver} implementation that controls an Edge browser running on the local machine.
 * It requires an <code>edgedriver</code> executable to be available in PATH.
 *
 * @see <a href="https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/">Microsoft WebDriver</a>
 */
public class EdgeDriver extends ChromiumDriver {

  public EdgeDriver() {
    this(new EdgeOptions());
  }

  public EdgeDriver(EdgeOptions options) {
    this(new EdgeDriverService.Builder().build(), options);
  }

  public EdgeDriver(EdgeDriverService service) {
    this(service, new EdgeOptions());
  }

  public EdgeDriver(EdgeDriverService service, EdgeOptions options) {
    super(new EdgeDriverCommandExecutor(service), Require.nonNull("Driver options", options), EdgeOptions.CAPABILITY);
    casting = new AddHasCasting().getImplementation(getCapabilities(), getExecuteMethod());
    cdp = new AddHasCdp().getImplementation(getCapabilities(), getExecuteMethod());
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new EdgeOptions());
  }

  private static class EdgeDriverCommandExecutor extends ChromiumDriverCommandExecutor {
    public EdgeDriverCommandExecutor(DriverService service) {
      super(service, getExtraCommands());
    }

    private static Map<String, CommandInfo> getExtraCommands() {
      return ImmutableMap.<String, CommandInfo>builder()
        .putAll(new AddHasCasting().getAdditionalCommands())
        .putAll(new AddHasCdp().getAdditionalCommands())
        .build();
    }
  }
}
