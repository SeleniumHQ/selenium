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

package org.openqa.selenium.remote;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.Platform;

import java.util.Map;

import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_VERSION;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM_NAME;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_JAVASCRIPT;

public class DesiredCapabilities extends MutableCapabilities {

  public DesiredCapabilities(String browser, String version, Platform platform) {
    setCapability(BROWSER_NAME, browser);
    setCapability(BROWSER_VERSION, version);
    setCapability(PLATFORM_NAME, platform);
  }

  public DesiredCapabilities() {
    // no-arg constructor
  }

  public DesiredCapabilities(Map<String, ?> rawMap) {
    if (rawMap == null) {
      return;
    }

    rawMap.forEach(this::setCapability);
  }

  public DesiredCapabilities(Capabilities other) {
    merge(other);
  }

  public DesiredCapabilities(Capabilities... others) {
    for (Capabilities caps : others) {
      merge(caps);
    }
  }

  public void setBrowserName(String browserName) {
    setCapability(BROWSER_NAME, browserName);
  }

  public void setVersion(String version) {
    setCapability(BROWSER_VERSION, version);
  }

  public void setPlatform(Platform platform) {
    setCapability(PLATFORM_NAME, platform);
  }

  /**
   * @deprecated This setting has no effect in W3C sessions, and JWP support is going away soon.
   */
  @Deprecated
  public void setJavascriptEnabled(boolean javascriptEnabled) {
    setCapability(SUPPORTS_JAVASCRIPT, javascriptEnabled);
  }

  public boolean acceptInsecureCerts() {
    if (getCapability(ACCEPT_INSECURE_CERTS) != null) {
      Object raw = getCapability(ACCEPT_INSECURE_CERTS);
      if (raw instanceof String) {
        return Boolean.parseBoolean((String) raw);
      } else if (raw instanceof Boolean) {
        return (Boolean) raw;
      }
    }
    return true;
  }

  public void setAcceptInsecureCerts(boolean acceptInsecureCerts) {
    setCapability(ACCEPT_INSECURE_CERTS, acceptInsecureCerts);
  }

  /**
   * Merges the extra capabilities provided into this DesiredCapabilities instance. If capabilities
   * with the same name exist in this instance, they will be overridden by the values from the
   * extraCapabilities object.
   *
   * @param extraCapabilities Additional capabilities to be added.
   * @return DesiredCapabilities after the merge
   */
  @Override
  public DesiredCapabilities merge(Capabilities extraCapabilities) {
    if (extraCapabilities != null) {
      extraCapabilities.asMap().forEach(this::setCapability);
    }
    return this;
  }
}
