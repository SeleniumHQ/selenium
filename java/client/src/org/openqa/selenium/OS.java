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

package org.openqa.selenium;

/**
 * Represents an Operating System that Selenium is running on. This is designed to support an OS
 * that is unknown at compile time, and can be populated from a {@link Capabilities} object.
 */
public class OS {

  private final String family;
  private final String name;
  private final String version;

  public OS(Capabilities capabilities) {
    String family = null;
    String name = null;
    String version = null;

    // JSON Wire Protocol
    Object raw = capabilities.getCapability("platform");
    if (raw instanceof Platform) {
      Platform platform = (Platform) raw;
      if (platform.family() == null) {
        family = platform.toString().toLowerCase();
      } else {
        family = platform.family().toString().toLowerCase();
      }
    }

    // W3C Protocol

    // SafariDriver

    // Appium

    // SauceLabs

    // BrowserStack


    this.family = family;
    this.name = name;
    this.version = version;
  }

  public String getFamily() {
    return family;
  }

  public String getName() {
    return name;
  }

  public String getVersion() {
    return version;
  }
}
