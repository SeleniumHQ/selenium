/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.browserlaunchers.locators;

import java.io.File;

/**
 * Encapsulate useful settings of a browser installation discovered with a
 * {@link org.openqa.selenium.browserlaunchers.locators.BrowserLocator}
 */
public class BrowserInstallation {

  static CombinedFirefoxLocator      combinedFirefoxLocator;
  static GoogleChromeLocator googleChromeLocator;
  static SafariLocator       safariLocator;

  private final String launcherFilePath;
  private final String libraryPath;

  public BrowserInstallation(String launcherFilePath, String libraryPath) {
    this.launcherFilePath = launcherFilePath;
    this.libraryPath = libraryPath;
  }

  public String launcherFilePath() {
    return launcherFilePath;
  }

  public String libraryPath() {
    return libraryPath;
  }

  /**
   * Checks to see if a Firefox installation is found.
   * @return <code>true</code> if found.
   */
  public static boolean isFirefoxInstalled() {
    combinedFirefoxLocator = new CombinedFirefoxLocator();
    return new File(combinedFirefoxLocator.findBrowserLocationOrFail().launcherFilePath()).exists();
  }

  /**
   * Get the path where the firefox installation is found.
   * @return <code>{@link String}</code> of the path.
   */
  public static String getFirefoxInstallationBinary() {
    if (isFirefoxInstalled())
      return combinedFirefoxLocator.findBrowserLocationOrFail().launcherFilePath();

    return null;
  }

  /**
   * Checks to see if a Google Chrome installation is found.
   * @return <code>true</code> if found.
   */
  public static boolean isGoogleChromeInstalled() {
    googleChromeLocator = new GoogleChromeLocator();
    return new File(googleChromeLocator.findBrowserLocationOrFail().launcherFilePath()).exists();
  }

  /**
   * Get the path where the google chrome installation is found.
   * @return <code>{@link String}</code> of the path.
   */
  public static String getGoogleChromeInstallationBinary() {
    if (isGoogleChromeInstalled())
      return googleChromeLocator.findBrowserLocationOrFail().launcherFilePath();

    return null;
  }

  /**
   * Checks to see if a Safar installation is found.
   * @return <code>true</code> if found.
   */
  public static boolean isSafariInstalled() {
    safariLocator = new SafariLocator();
    return new File(safariLocator.findBrowserLocationOrFail().launcherFilePath()).exists();
  }

  /**
   * Get the path where the google chrome installation is found.
   * @return <code>{@link String}</code> of the path.
   */
  public static String getSafariInstallationBinary() {
    if (isSafariInstalled())
      return safariLocator.findBrowserLocationOrFail().launcherFilePath();

    return null;
  }
}
