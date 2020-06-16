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

package org.openqa.selenium.testing.drivers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.edgehtml.EdgeHtmlOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.ie.InternetExplorerOptions;
import org.openqa.selenium.opera.OperaOptions;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.safari.SafariOptions;

import java.util.logging.Logger;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

public enum Browser {
  ALL(new ImmutableCapabilities(), false),
  CHROME(new ChromeOptions(), true),
  EDGE(new EdgeHtmlOptions(), false),
  CHROMIUMEDGE(new EdgeOptions(), true),
  HTMLUNIT(new ImmutableCapabilities(BROWSER_NAME, BrowserType.HTMLUNIT), false),
  FIREFOX(new FirefoxOptions(), false),
  IE(new InternetExplorerOptions(), false),
  MARIONETTE(new FirefoxOptions(), false),
  OPERA(new OperaOptions(), false),
  OPERABLINK(new OperaOptions(), false),
  SAFARI(new SafariOptions(), false);

  private static final Logger log = Logger.getLogger(Browser.class.getName());
  private final Capabilities canonicalCapabilities;
  private final boolean supportsCdp;

  private Browser(Capabilities canonicalCapabilities, boolean supportsCdp) {
    this.canonicalCapabilities = ImmutableCapabilities.copyOf(canonicalCapabilities);
    this.supportsCdp = supportsCdp;
  }

  public static Browser detect() {
    String browserName = System.getProperty("selenium.browser");
    if (browserName == null) {
      log.info("No browser detected, returning null");
      return null;
    }

    if ("ff".equals(browserName.toLowerCase()) || "firefox".equals(browserName.toLowerCase())) {
      if (System.getProperty("webdriver.firefox.marionette") == null ||
          Boolean.getBoolean("webdriver.firefox.marionette")) {
        return MARIONETTE;
      } else {
        return FIREFOX;
      }
    }

    if ("edge".equals(browserName.toLowerCase())) {
      return CHROMIUMEDGE;
    }

    if ("edgehtml".equals(browserName.toLowerCase())) {
      return EDGE;
    }

    try {
      return Browser.valueOf(browserName.toUpperCase());
    } catch (IllegalArgumentException e) {
    }

    throw new RuntimeException(String.format("Cannot determine driver from name %s", browserName));
  }

  public boolean supportsCdp() {
    return supportsCdp;
  }

  public Capabilities getCapabilities() {
    return canonicalCapabilities;
  }
}
