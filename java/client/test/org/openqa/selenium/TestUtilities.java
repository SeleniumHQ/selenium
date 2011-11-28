/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium;

import org.openqa.selenium.remote.CapabilityType;

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

  public  static boolean isFirefox30(WebDriver driver) {
    return getUserAgent(driver).contains("Firefox/3.0.");
  }

  public static boolean isFirefox35(WebDriver driver) {
    return getUserAgent(driver).contains("Firefox/3.5.");
  }

  public static Platform getEffectivePlatform() {
    if (SauceDriver.shouldUseSauce()) {
      return SauceDriver.getEffectivePlatform();
    }

    return Platform.getCurrent();
  }
}
