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
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import java.util.Optional;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.chromium.ChromiumDriverInfo;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.service.DriverFinder;

@AutoService(WebDriverInfo.class)
public class ChromeDriverInfo extends ChromiumDriverInfo {

  @Override
  public String getDisplayName() {
    return "Chrome";
  }

  @Override
  public Capabilities getCanonicalCapabilities() {
    if (!"jdk-http-client".equalsIgnoreCase(System.getProperty("webdriver.http.factory", ""))) {
      // Allowing any origin "*" through remote-allow-origins might sound risky but an attacker
      // would need to know the port used to start DevTools to establish a connection. Given
      // these sessions are relatively short-lived, the risk is reduced. Only set when the Java
      // 11 client is not used.
      return new ImmutableCapabilities(
          CapabilityType.BROWSER_NAME,
          CHROME.browserName(),
          ChromeOptions.CAPABILITY,
          ImmutableMap.of("args", ImmutableList.of("--remote-allow-origins=*")));
    }
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
    return false;
  }

  @Override
  public boolean isAvailable() {
    try {
      DriverFinder.getPath(ChromeDriverService.createDefaultService(), getCanonicalCapabilities());
      return true;
    } catch (IllegalStateException | WebDriverException e) {
      return false;
    }
  }

  @Override
  public boolean isPresent() {
    try {
      DriverFinder.getPath(
          ChromeDriverService.createDefaultService(), getCanonicalCapabilities(), true);
      return true;
    } catch (IllegalStateException | WebDriverException e) {
      return false;
    }
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
