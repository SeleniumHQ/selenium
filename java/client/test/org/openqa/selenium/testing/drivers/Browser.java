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
import org.openqa.selenium.chrome.ChromeDriverInfo;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriverInfo;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.edgehtml.EdgeHtmlDriverInfo;
import org.openqa.selenium.edgehtml.EdgeHtmlOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.firefox.GeckoDriverInfo;
import org.openqa.selenium.firefox.xpi.XpiDriverInfo;
import org.openqa.selenium.ie.InternetExplorerDriverInfo;
import org.openqa.selenium.ie.InternetExplorerOptions;
import org.openqa.selenium.opera.OperaDriverInfo;
import org.openqa.selenium.opera.OperaOptions;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.safari.SafariDriverInfo;
import org.openqa.selenium.safari.SafariOptions;

import java.util.logging.Logger;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

public enum Browser {
  ALL(new ImmutableCapabilities(), "any", false),
  CHROME(new ChromeOptions(), new ChromeDriverInfo().getDisplayName(), true),
  EDGE_HTML(new EdgeHtmlOptions(), new EdgeHtmlDriverInfo().getDisplayName(), false),
  EDGIUM(new EdgeOptions(), new EdgeDriverInfo().getDisplayName(), true),
  HTMLUNIT(new ImmutableCapabilities(BROWSER_NAME, BrowserType.HTMLUNIT), "HtmlUnit", false),
  LEGACY_FIREFOX_XPI(new FirefoxOptions().setLegacy(true), new XpiDriverInfo().getDisplayName(), false),
  IE(new InternetExplorerOptions(), new InternetExplorerDriverInfo().getDisplayName(), false),
  FIREFOX(new FirefoxOptions(), new GeckoDriverInfo().getDisplayName(), false),
  LEGACY_OPERA(new OperaOptions(), new OperaDriverInfo().getDisplayName(), false),
  OPERA(new OperaOptions(), new OperaDriverInfo().getDisplayName(), false),
  SAFARI(new SafariOptions(), new SafariDriverInfo().getDisplayName(), false);

  private static final Logger log = Logger.getLogger(Browser.class.getName());
  private final Capabilities canonicalCapabilities;
  private final String displayName;
  private final boolean supportsCdp;

  Browser(Capabilities canonicalCapabilities, String displayName, boolean supportsCdp) {
    this.canonicalCapabilities = ImmutableCapabilities.copyOf(canonicalCapabilities);
    this.displayName = displayName;
    this.supportsCdp = supportsCdp;
  }

  public static Browser detect() {
    String browserName = System.getProperty("selenium.browser");
    if (browserName == null) {
      log.info("No browser detected, returning null");
      return null;
    }

    if ("ff".equalsIgnoreCase(browserName) || "firefox".equalsIgnoreCase(browserName)) {
      if (System.getProperty("webdriver.firefox.marionette") == null ||
          Boolean.getBoolean("webdriver.firefox.marionette")) {
        return FIREFOX;
      } else {
        return LEGACY_FIREFOX_XPI;
      }
    }

    if ("edge".equalsIgnoreCase(browserName)) {
      return EDGIUM;
    }

    if ("edgehtml".equalsIgnoreCase(browserName)) {
      return EDGE_HTML;
    }

    try {
      return Browser.valueOf(browserName.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new RuntimeException(String.format("Cannot determine driver from name %s", browserName), e);
    }
  }

  public boolean supportsCdp() {
    return supportsCdp;
  }

  public String displayName() {
    return displayName;
  }

  public Capabilities getCapabilities() {
    return canonicalCapabilities;
  }

  public boolean matches(Browser... others) {
    for (Browser item : others) {
      if (item == Browser.ALL) {
        return true;
      }

      if (item == this) {
        return true;
      }
    }
    return false;
  }
}
