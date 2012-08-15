/*
Copyright 2011 Selenium committers

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

package org.openqa.selenium.testing;

import static org.junit.Assume.assumeTrue;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.drivers.SauceDriver;

public class TestUtilities {
  public static boolean isNativeEventsEnabled(WebDriver driver) {
    if (!(driver instanceof HasCapabilities)) {
      return false;
    }

    return ((HasCapabilities) driver).getCapabilities().is(CapabilityType.HAS_NATIVE_EVENTS);
  }

  private static String getUserAgent(WebDriver driver) {
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
    return getUserAgent(driver).contains("MSIE");
  }

  public static boolean isIe6(WebDriver driver) {
    return getUserAgent(driver).contains("MSIE 6");
  }

  public static boolean isOldIe(WebDriver driver) {
    try {
      String jsToExecute = "return parseInt(window.navigator.appVersion.split(' ')[0]);";
      // IE9 is trident version 5.  IE9 is the start of new IE.
      return ((Long)((JavascriptExecutor)driver).executeScript(jsToExecute)).intValue() < 5;
    } catch (Throwable t) {
      return false;
    }
  }

  public  static boolean isFirefox30(WebDriver driver) {
    return getUserAgent(driver).contains("Firefox/3.0.");
  }

  public static boolean isFirefox35(WebDriver driver) {
    return getUserAgent(driver).contains("Firefox/3.5.");
  }

  public static boolean isFirefox9(WebDriver driver) {
    return getUserAgent(driver).contains("Firefox/9.0");
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

  public static Platform getEffectivePlatform() {
    if (SauceDriver.shouldUseSauce()) {
      return SauceDriver.getEffectivePlatform();
    }

    return Platform.getCurrent();
  }

  public static boolean isLocal() {
    return !Boolean.getBoolean("selenium.browser.remote") && !SauceDriver.shouldUseSauce();
  }

  public static void assumeFalse(boolean b) {
    assumeTrue(!b);
  }
}
