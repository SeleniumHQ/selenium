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

package org.openqa.grid.web.servlet.console;

import com.google.common.base.Strings;

import org.openqa.grid.internal.TestSlot;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.InputStream;


/**
 * the browser on the console will be organized per browserName and version only.
 */
class MiniCapability {
  private String browser;
  private String version;
  private DesiredCapabilities capabilities;

  MiniCapability(TestSlot slot) {
    DesiredCapabilities cap = new DesiredCapabilities(slot.getCapabilities());
    browser = cap.getBrowserName();
    version = cap.getVersion();
    capabilities = cap;
  }

  public String getVersion() {
    return version;
  }

  public String getIcon() {
    return getConsoleIconPath(new DesiredCapabilities(capabilities));
  }

  /**
   * get the icon representing the browser for the grid. If the icon cannot be located, returns
   * null.
   *
   * @param cap - Capability
   * @return String with path to icon image file.  Can be <i>null</i> if no icon
   *         file if available.
   */
  private String getConsoleIconPath(DesiredCapabilities cap) {
    String name = consoleIconName(cap);
    String path = "org/openqa/grid/images/";
    InputStream in =
        Thread.currentThread().getContextClassLoader()
            .getResourceAsStream(path + name + ".png");
    if (in == null) {
      return null;
    }
    return "/grid/resources/" + path + name + ".png";
  }

  private String consoleIconName(DesiredCapabilities cap) {
    String browserString = cap.getBrowserName();
    if (Strings.isNullOrEmpty(browserString)) {
      return "missingBrowserName";
    }

    String ret = browserString;

    // Map browser environments to icon names.
    if (browserString.contains("iexplore") || browserString.startsWith("*iehta")) {
      ret = BrowserType.IE;
    } else if (browserString.contains("firefox") || browserString.startsWith("*chrome")) {
      if (cap.getVersion() != null && cap.getVersion().toLowerCase().equals("beta") ||
          cap.getBrowserName().toLowerCase().contains("beta")) {
        ret = "firefoxbeta";
      } else if (cap.getVersion() != null && cap.getVersion().toLowerCase().equals("aurora") ||
                 cap.getBrowserName().toLowerCase().contains("aurora")) {
        ret = "aurora";
      } else if (cap.getVersion() != null && cap.getVersion().toLowerCase().equals("nightly") ||
                 cap.getBrowserName().toLowerCase().contains("nightly")) {
        ret = "nightly";
      } else {
        ret = BrowserType.FIREFOX;
      }

    } else if (browserString.toLowerCase().contains("safari")) {
      if (browserString.toLowerCase().contains("technology")) {
        ret = "safari_technology_preview";
      } else {
        ret = BrowserType.SAFARI;
      }
    } else if (browserString.startsWith("*googlechrome")) {
      ret = BrowserType.CHROME;
    } else if (browserString.startsWith("opera")) {
      ret = BrowserType.OPERA;
    } else if (browserString.toLowerCase().contains("edge")) {
      ret = BrowserType.EDGE;
    }

    return ret.replace(" ", "_");
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((browser == null) ? 0 : browser.hashCode());
    result = prime * result + ((version == null) ? 0 : version.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) return true;
    if (obj == null) return false;
    if (getClass() != obj.getClass()) return false;
    MiniCapability other = (MiniCapability) obj;
    if (browser == null) {
      if (other.browser != null) return false;
    } else if (!browser.equals(other.browser)) return false;
    if (version == null) {
      if (other.version != null) return false;
    } else if (!version.equals(other.version)) return false;
    return true;
  }



}
