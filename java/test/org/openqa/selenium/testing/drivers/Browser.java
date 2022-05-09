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
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.firefox.GeckoDriverInfo;
import org.openqa.selenium.ie.InternetExplorerDriverInfo;
import org.openqa.selenium.ie.InternetExplorerOptions;
import org.openqa.selenium.opera.OperaDriverInfo;
import org.openqa.selenium.opera.OperaOptions;
import org.openqa.selenium.safari.SafariDriverInfo;
import org.openqa.selenium.safari.SafariOptions;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

public enum Browser {
  ALL(new ImmutableCapabilities(), "any", false),
  CHROME(new ChromeOptions(), new ChromeDriverInfo().getDisplayName(), true) {
    @Override
    public Capabilities getCapabilities() {
      ChromeOptions options = new ChromeOptions();

      String binary = System.getProperty("webdriver.chrome.binary");
      if (binary != null) {
        options.setBinary(binary);
      }

      if (Boolean.getBoolean("webdriver.headless")) {
        options.setHeadless(true);
      }

      options.addArguments(
        "disable-extensions",
        "disable-infobars",
        "disable-breakpad",
        "disable-dev-shm-usage",
        "no-sandbox");

      Map<String, Object> prefs = new HashMap<>();
      prefs.put("exit_type", "None");
      prefs.put("exited_cleanly", true);
      options.setExperimentalOption("prefs", prefs);

      return options;
    }
  },
  EDGE(new EdgeOptions(), new EdgeDriverInfo().getDisplayName(), true) {
    @Override
    public Capabilities getCapabilities() {
      EdgeOptions options = new EdgeOptions();

      String binary = System.getProperty("webdriver.edge.binary");
      if (binary != null) {
        options.setBinary(binary);
      }

      if (Boolean.getBoolean("webdriver.headless")) {
        options.setHeadless(true);
      }

      options.addArguments(
        "disable-extensions",
        "disable-infobars",
        "disable-breakpad",
        "disable-dev-shm-usage",
        "no-sandbox");

      Map<String, Object> prefs = new HashMap<>();
      prefs.put("exit_type", "None");
      prefs.put("exited_cleanly", true);
      options.setExperimentalOption("prefs", prefs);

      return options;
    }
  },
  HTMLUNIT(
    new ImmutableCapabilities(BROWSER_NAME, org.openqa.selenium.remote.Browser.HTMLUNIT.browserName()), "HtmlUnit", false),
  IE(new InternetExplorerOptions(), new InternetExplorerDriverInfo().getDisplayName(), false) {
    @Override
    public Capabilities getCapabilities() {
      InternetExplorerOptions options = new InternetExplorerOptions();

      if (Boolean.getBoolean("selenium.ie.disable_native_events")) {
        options.disableNativeEvents();
      }
      if (Boolean.getBoolean("selenium.ie.require_window_focus")) {
        options.requireWindowFocus();
      }

      return options;
    }
  },
  FIREFOX(new FirefoxOptions(), new GeckoDriverInfo().getDisplayName(), false) {
    @Override
    public Capabilities getCapabilities() {
      FirefoxOptions options = new FirefoxOptions().configureFromEnv();

      String binary = System.getProperty("webdriver.firefox.bin");
      if (binary != null) {
        options.setBinary(binary);
      }

      if (Boolean.getBoolean("webdriver.headless")) {
        options.setHeadless(true);
      }

      return options;
    }
  },
  LEGACY_OPERA(new OperaOptions(), new OperaDriverInfo().getDisplayName(), false),
  OPERA(new OperaOptions(), new OperaDriverInfo().getDisplayName(), false) {
    @Override
    public Capabilities getCapabilities() {
      OperaOptions options = new OperaOptions();
      options.addArguments("disable-extensions");
      String operaPath = System.getProperty("webdriver.opera.binary");
      if (operaPath != null) {
        options.setBinary(new File(operaPath));
      }

      return options;
    }
  },
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
      return FIREFOX;
    }

    if ("edge".equalsIgnoreCase(browserName)) {
      return EDGE;
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
