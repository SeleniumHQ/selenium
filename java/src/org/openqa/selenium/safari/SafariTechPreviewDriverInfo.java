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

import static org.openqa.selenium.remote.Browser.SAFARI_TECH_PREVIEW;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.auto.service.AutoService;
import java.util.Optional;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.remote.service.DriverFinder;

@SuppressWarnings("unused")
@AutoService(WebDriverInfo.class)
public class SafariTechPreviewDriverInfo implements WebDriverInfo {

  @Override
  public String getDisplayName() {
    return "Safari Technology Preview";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(BROWSER_NAME, SAFARI_TECH_PREVIEW.browserName());
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    if (SAFARI_TECH_PREVIEW.browserName().equalsIgnoreCase(capabilities.getBrowserName())) {
      return true;
    }

    return capabilities.asMap().keySet().parallelStream()
        .map(key -> key.startsWith("safari:"))
        .reduce(Boolean::logicalOr)
        .orElse(false);
  }

  @Override
  public boolean isSupportingCdp() {
    return false;
  }

  @Override
  public boolean isSupportingBiDi() {
    return false;
  }

  @Override
  public boolean isAvailable() {
    try {
      DriverFinder.getPath(
          SafariTechPreviewDriverService.createDefaultService(), getCanonicalCapabilities());
      return true;
    } catch (IllegalStateException | WebDriverException e) {
      return false;
    }
  }

  @Override
  public boolean isPresent() {
    try {
      DriverFinder.getPath(
          SafariTechPreviewDriverService.createDefaultService(), getCanonicalCapabilities(), true);
      return true;
    } catch (IllegalStateException | WebDriverException e) {
      return false;
    }
  }

  @Override
  public int getMaximumSimultaneousSessions() {
    return 1;
  }

  @Override
  public Optional<WebDriver> createDriver(Capabilities capabilities)
      throws SessionNotCreatedException {
    if (!isAvailable()) {
      return Optional.empty();
    }

    return Optional.of(new SafariDriver(new SafariOptions(capabilities)));
  }
}
