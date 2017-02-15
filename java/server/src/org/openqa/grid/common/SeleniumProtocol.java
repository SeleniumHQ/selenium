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

package org.openqa.grid.common;

import static org.openqa.grid.common.RegistrationRequest.PATH;
import static org.openqa.grid.common.RegistrationRequest.SELENIUM_PROTOCOL;

import org.openqa.grid.common.exception.GridException;

import java.util.Arrays;
import java.util.Map;

public enum SeleniumProtocol {
  Selenium("/selenium-server/driver"),
  WebDriver("/wd/hub");
  private String path;

  SeleniumProtocol(String path) {
    this.path = path;
  }

  public static SeleniumProtocol fromCapabilitiesMap(Map<String, ?> capabilities) {
    String type = (String) capabilities.get(SELENIUM_PROTOCOL);
    if (type == null || type.trim().isEmpty()) {
      return WebDriver;
    }
    try {
      return SeleniumProtocol.valueOf(type);
    } catch (IllegalArgumentException e) {
      throw new GridException(type + " isn't a valid protocol type for grid. Valid values :[" +
                              Arrays.toString(values()) + "]", e);
    }
  }

  public String getPathConsideringCapabilitiesMap(Map<String, ?> capabilities) {
    String localPath = (String) capabilities.get(PATH);
    if (localPath != null) {
      return localPath;
    }
    return path;
  }

  public String getPath() {
    return path;
  }

  public boolean isSelenium() {
    return Selenium.equals(this);
  }
}
