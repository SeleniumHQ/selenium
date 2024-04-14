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

import static org.openqa.selenium.edge.EdgeOptions.WEBVIEW2_BROWSER_NAME;
import static org.openqa.selenium.remote.Browser.EDGE;

import com.google.auto.service.AutoService;
import java.util.Optional;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.chromium.ChromiumDriverInfo;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.service.DriverFinder;

@AutoService(WebDriverInfo.class)
public class EdgeDriverInfo extends ChromiumDriverInfo {
  private static final Logger LOG = Logger.getLogger(EdgeDriverInfo.class.getName());

  @Override
  public String getDisplayName() {
    return "Edge";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(CapabilityType.BROWSER_NAME, EDGE.browserName());
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    // webview2 - support https://docs.microsoft.com/en-us/microsoft-edge/webview2/how-to/webdriver
    return EDGE.is(capabilities.getBrowserName())
        || WEBVIEW2_BROWSER_NAME.equalsIgnoreCase(capabilities.getBrowserName())
        || capabilities.getCapability("ms:edgeOptions") != null;
  }

  @Override
  public boolean isSupportingCdp() {
    return true;
  }

  @Override
  public boolean isSupportingBiDi() {
    return true;
  }

  @Override
  public boolean isAvailable() {
    return new DriverFinder(EdgeDriverService.createDefaultService(), getCanonicalCapabilities())
        .isAvailable();
  }

  @Override
  public boolean isPresent() {
    return new DriverFinder(EdgeDriverService.createDefaultService(), getCanonicalCapabilities())
        .isPresent();
  }

  @Override
  public Optional<WebDriver> createDriver(Capabilities capabilities)
      throws SessionNotCreatedException {
    if (!isAvailable() || !isSupporting(capabilities)) {
      return Optional.empty();
    }

    return Optional.of(new EdgeDriver(new EdgeOptions().merge(capabilities)));
  }
}
