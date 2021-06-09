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

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.chromium.ChromiumDriverInfo;
import org.openqa.selenium.remote.BrowserType;

import java.util.Objects;
import java.util.Optional;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

@AutoService(WebDriverInfo.class)
public class EdgeDriverInfo extends ChromiumDriverInfo {

  @Override
  public String getDisplayName() {
    return "Edge";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, BrowserType.EDGE);
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return (BrowserType.EDGE.equalsIgnoreCase(capabilities.getBrowserName())
            || capabilities.getCapability("ms:edgeOptions") != null
            || capabilities.getCapability("edgeOptions") != null)
           &&
           (capabilities.getCapability(EdgeOptions.USE_CHROMIUM) == null
            || Objects.equals(capabilities.getCapability(EdgeOptions.USE_CHROMIUM), true));
  }

  @Override
  public boolean isSupportingCdp() {
    return true;
  }

  @Override
  public boolean isAvailable() {
    try {
      EdgeDriverService.createDefaultService();
      return true;
    } catch (IllegalStateException | WebDriverException e) {
      return false;
    }
  }

  @Override
  public int getMaximumSimultaneousSessions() {
    return Runtime.getRuntime().availableProcessors();
  }

  @Override
  public Optional<WebDriver> createDriver(Capabilities capabilities)
      throws SessionNotCreatedException {
    if (!isAvailable() || !isSupporting(capabilities)) {
      return Optional.empty();
    }

    return Optional.of(new EdgeDriver(capabilities));
  }
}
