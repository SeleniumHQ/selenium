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

  static CombinedFirefoxLocator combinedFirefoxLocator;
  static GoogleChromeLocator googleChromeLocator;
  static SafariLocator safariLocator;
  static InternetExplorerLocator internetExplorerLocator;

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
    try {
      combinedFirefoxLocator = new CombinedFirefoxLocator();

      return new File(combinedFirefoxLocator.findBrowserLocation().launcherFilePath())
          .exists();
    } catch (Exception ex) {
      return false;
    }
  }

  /**
   * Get the path where the firefox installation is found.
   * @return <code>{@link String}</code> of the path.
   */
  public static String getFirefoxInstallationBinary() {
    if (isFirefoxInstalled())
      return combinedFirefoxLocator.findBrowserLocation().launcherFilePath();

    return null;
  }

  /**
   * Checks to see if a Google Chrome installation is found.
   * @return <code>true</code> if found.
   */
  public static boolean isGoogleChromeInstalled() {
    try {
      googleChromeLocator = new GoogleChromeLocator();
      return new File(googleChromeLocator.findBrowserLocation().launcherFilePath()).exists();
    } catch (Exception ex) {
      return false;
    }
  }

  /**
   * Get the path where the google chrome installation is found.
   * @return <code>{@link String}</code> of the path.
   */
  public static String getGoogleChromeInstallationBinary() {
    if (isGoogleChromeInstalled())
      return googleChromeLocator.findBrowserLocation().launcherFilePath();

    return null;
  }

  /**
   * Checks to see if a Safar installation is found.
   * @return <code>true</code> if found.
   */
  public static boolean isSafariInstalled() {
    try {
      safariLocator = new SafariLocator();
      return new File(safariLocator.findBrowserLocation().launcherFilePath()).exists();
    } catch (Exception ex) {
      return false;
    }
  }

  /**
   * Get the path where the google chrome installation is found.
   * @return <code>{@link String}</code> of the path.
   */
  public static String getSafariInstallationBinary() {
    if (isSafariInstalled())
      return safariLocator.findBrowserLocation().launcherFilePath();

    return null;
  }

  /**
   * Checks to see if a Internet Explorer installation is found.
   * @return <code>true</code> if found.
   */
  public static boolean isInternetExplorerInstalled() {
    try {
      internetExplorerLocator = new InternetExplorerLocator();
      return new File(internetExplorerLocator.findBrowserLocation().launcherFilePath())
          .exists();
    } catch (Exception ex) {
      return false;
    }
  }

  /**
   * Get the path where the Internet Explorer installation is found.
   * @return <code>{@link String}</code> of the path.
   */
  public static String getInternetExplorerInstallationBinary() {
    if (isInternetExplorerInstalled())
      return internetExplorerLocator.findBrowserLocation().launcherFilePath();

    return null;
  }
}
