/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.grid.web.utils;

import com.google.common.collect.Maps;

import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.BrowserType;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.Registry;

import java.io.InputStream;
import java.util.Map;

/**
 * Utilities for dealing with browser names.
 */
public class BrowserNameUtils {

  public static String lookupGrid1Environment(String browserString, Registry registry) {
    String translatedBrowserString =
        registry.getConfiguration().getGrid1Mapping().get(browserString);

    return (translatedBrowserString == null) ? browserString : translatedBrowserString;
  }


  public static Map<String, Object> parseGrid2Environment(String environment) {
    Map<String, Object> ret = Maps.newHashMap();

    String[] details = environment.split(" ");
    if (details.length == 1) {
      // simple browser string
      ret.put(RegistrationRequest.BROWSER, details[0]);
    } else {
      // more complex. Only case handled so far = X on Y
      // where X is the browser string, Y the OS
      ret.put(RegistrationRequest.BROWSER, details[0]);
      if (details.length == 3) {
        ret.put(RegistrationRequest.PLATFORM, Platform.extractFromSysProperty(details[2]));
      }
    }

    return ret;
  }

  public static String consoleIconName(DesiredCapabilities cap, Registry registry) {
    String browserString = cap.getBrowserName();
    if (browserString == null || "".equals(browserString)) {
      return "missingBrowserName";
    }

    String ret = browserString;

    // Take care of any Grid 1.0 named environment translation.
    if (browserString.charAt(0) != '*') {
      browserString = lookupGrid1Environment(browserString, registry);
    }

    // Map browser environments to icon names.
    if (browserString.contains("iexplore") || browserString.startsWith("*iehta")) {
      ret = "internet explorer";
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
        ret = "firefox";
      }

    } else if (browserString.startsWith("*safari")) {
      ret = BrowserType.SAFARI;
    } else if (browserString.startsWith("*googlechrome")) {
      ret = "chrome";
    } else if (browserString.startsWith("opera")) {
      ret = BrowserType.OPERA;
    }

    return ret.replace(" ", "_");
  }


  /**
   * get the icon representing the browser for the grid. If the icon cannot be located, returns
   * null.
   * 
   * @param cap
   * @param registry
   * @return String with path to icon image file.  Can be <i>null</i> if no icon
   *         file if available.
   */
  public static String getConsoleIconPath(DesiredCapabilities cap, Registry registry) {
    String name = consoleIconName(cap, registry);
    InputStream in =
        Thread.currentThread().getContextClassLoader()
            .getResourceAsStream("images/" + name + ".png");
    if (in == null) {
      return null;
    } else {
      return "/grid/resources/images/" + name + ".png";
    }

  }

}
