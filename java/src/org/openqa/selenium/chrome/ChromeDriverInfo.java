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

import static org.openqa.selenium.remote.Browser.CHROME;

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
public class ChromeDriverInfo extends ChromiumDriverInfo {
  private static final Logger LOG = Logger.getLogger(ChromeDriverInfo.class.getName());

  @Override
  public String getDisplayName() {
    return "Chrome";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    return new ImmutableCapabilities(CapabilityType.BROWSER_NAME, CHROME.browserName());
  }

  @Override
  public boolean isSupporting(Capabilities capabilities) {
    return CHROME.is(capabilities) || capabilities.getCapability(ChromeOptions.CAPABILITY) != null;
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
    return new DriverFinder(ChromeDriverService.createDefaultService(), getCanonicalCapabilities())
        .isAvailable();
  }

  @Override
  public boolean isPresent() {
    return new DriverFinder(ChromeDriverService.createDefaultService(), getCanonicalCapabilities())
        .isPresent();
  }

  @Override
  public Optional<WebDriver> createDriver(Capabilities capabilities)
      throws SessionNotCreatedException {
    if (!isAvailable() || !isSupporting(capabilities)) {
      return Optional.empty();
    }

    WebDriver driver = new ChromeDriver(new ChromeOptions().merge(capabilities));

    return Optional.of(driver);
  }
}
