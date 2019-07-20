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

package org.openqa.selenium.testing;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.remote.CapabilityType;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TestUtilities {

  public static boolean isNativeEventsEnabled(WebDriver driver) {
    return driver instanceof HasCapabilities &&
           ((HasCapabilities) driver).getCapabilities().is(CapabilityType.HAS_NATIVE_EVENTS);

  }

  public static String getUserAgent(WebDriver driver) {
    if (driver instanceof HtmlUnitDriver) {
      return ((HtmlUnitDriver) driver).getBrowserVersion().getUserAgent();
    }
    try {
      return (String) ((JavascriptExecutor) driver).executeScript(
        "return navigator.userAgent;");
    } catch (Throwable e) {
      // Some drivers will only execute JS once a page has been loaded. Since those
      // drivers aren't Firefox or IE, we don't worry about that here.
      //
      // Non-javascript-enabled HtmlUnit throws an UnsupportedOperationException here.
      // Let's just ignore that.
      return "";
    }
  }

  public static boolean isFirefox(WebDriver driver) {
    return getUserAgent(driver).contains("Firefox");
  }

  public static boolean isInternetExplorer(WebDriver driver) {
    String userAgent = getUserAgent(driver);
    return userAgent.contains("MSIE") || userAgent.contains("Trident");
  }

  public static boolean isIe6(WebDriver driver) {
    return isInternetExplorer(driver)
        && getUserAgent(driver).contains("MSIE 6");
  }

  public static boolean isIe7(WebDriver driver) {
    return isInternetExplorer(driver)
           && getUserAgent(driver).contains("MSIE 7");
  }

  public static boolean isOldIe(WebDriver driver) {
    if (!isInternetExplorer(driver)) {
      return false;
    }
    if (driver instanceof HtmlUnitDriver) {
      String applicationVersion = ((HtmlUnitDriver) driver).getBrowserVersion().getApplicationVersion();
      return Double.parseDouble(applicationVersion.split(" ")[0]) < 5;
    }
    try {
      String jsToExecute = "return parseInt(window.navigator.appVersion.split(' ')[0]);";
      // IE9 is trident version 5.  IE9 is the start of new IE.
      return ((Long)((JavascriptExecutor)driver).executeScript(jsToExecute)).intValue() < 5;
    } catch (Throwable t) {
      return false;
    }
  }

  public static boolean isChrome(WebDriver driver) {
    return !(driver instanceof HtmlUnitDriver) && getUserAgent(driver).contains("Chrome");
  }

  public static int getChromeVersion(WebDriver driver) {
    if (!(driver instanceof HasCapabilities)) {
      // Driver does not support capabilities -- not a chromedriver at all.
      return 0;
    }
    Capabilities caps = ((HasCapabilities) driver).getCapabilities();
    String chromedriverVersion = (String) caps.getCapability("chrome.chromedriverVersion");
    if (chromedriverVersion == null) {
      Object chrome = caps.getCapability("chrome");
      if (chrome != null) {
        chromedriverVersion = (String) ((Map<?,?>) chrome).get("chromedriverVersion");
      }
    }
    if (chromedriverVersion != null) {
      String[] versionMajorMinor = chromedriverVersion.split("\\.", 2);
      if (versionMajorMinor.length > 1) {
        try {
          return Integer.parseInt(versionMajorMinor[0]);
        } catch (NumberFormatException e) {
          // First component of the version is not a number -- not a chromedriver.
          return 0;
        }
      }
    }
    return 0;

  }

  /**
   * Finds the Firefox version of the given webdriver and returns it as an integer.
   * For instance, '14.0.1' will translate to 14.
   *
   * @param driver The driver to find the version for.
   * @return The found version, or 0 if no version could be found.
   */
  public static int getFirefoxVersion(WebDriver driver) {
    // extract browser string
    Pattern browserPattern = Pattern.compile("Firefox/\\d+.");
    Matcher browserMatcher = browserPattern.matcher(getUserAgent(driver));
    if (!browserMatcher.find()) {
      return 0;
    }
    String browserStr = browserMatcher.group();

    // extract version string
    Pattern versionPattern = Pattern.compile("\\d+");
    Matcher versionMatcher = versionPattern.matcher(browserStr);
    if (!versionMatcher.find()) {
      return 0;
    }
    return Integer.parseInt(versionMatcher.group());
  }

  /**
   * Finds the IE major version of the given webdriver and returns it as an integer.
   * For instance, '10.6' will translate to 10.
   *
   * @param driver The driver to find the version for.
   * @return The found version, or 0 if no version could be found.
   */
  public static int getIEVersion(WebDriver driver) {
    String userAgent = getUserAgent(driver);
    // extract browser string
    Pattern browserPattern = Pattern.compile("MSIE\\s+\\d+\\.");
    Matcher browserMatcher = browserPattern.matcher(userAgent);
    // IE dropped the "MSIE" token from its user agent string starting with IE11.
    Pattern tridentPattern = Pattern.compile("Trident/\\d+\\.");
    Matcher tridentMatcher = tridentPattern.matcher(userAgent);

    Matcher versionMatcher;
    if (browserMatcher.find()) {
      versionMatcher = Pattern.compile("(\\d+)").matcher(browserMatcher.group());
    } else if (tridentMatcher.find()) {
      versionMatcher = Pattern.compile("rv:(\\d+)").matcher(userAgent);
    } else {
      return Integer.MAX_VALUE;  // Because people check to see if we're at this version or less
    }

    // extract version string
    if (!versionMatcher.find()) {
      return 0;
    }
    return Integer.parseInt(versionMatcher.group(1));
  }


  public static Platform getEffectivePlatform() {
    return Platform.getCurrent();
  }

  /**
   * Returns Platform where the browser (driven by given WebDriver) runs on.
   */
  public static Platform getEffectivePlatform(WebDriver driver) {
    if (!(driver instanceof HasCapabilities)) {
      throw new RuntimeException("WebDriver must implement HasCapabilities");
    }

    Capabilities caps = ((HasCapabilities) driver).getCapabilities();
    return caps.getPlatform();
  }

  public static boolean isLocal() {
    return ! (Boolean.getBoolean("selenium.browser.remote")
              || Boolean.getBoolean("selenium.browser.grid"));
  }

  public static boolean isOnTravis() {
    return Boolean.valueOf(System.getenv("TRAVIS"));
  }
}
