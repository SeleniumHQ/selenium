/*
 * Copyright 2008 Google, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium.browserlaunchers.locators;

import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.remote.BrowserType;

/**
 * Discovers a valid Google Chrome installation on local system.
 */
public class GoogleChromeLocator extends SingleBrowserLocator {

  @Override
  protected String browserName() {
    return "Google Chrome";
  }

  @Override
  protected String seleniumBrowserName() {
    return BrowserType.GOOGLECHROME;
  }

  @Override
  protected String[] standardlauncherFilenames() {
    return new String[] {"chrome.exe", "google-chrome", "Google Chrome"};
  }

  @Override
  protected String browserPathOverridePropertyName() {
    return "googleChromeDefaultPath";
  }

  @Override
  protected String[] usualLauncherLocations() {
    return WindowsUtils.thisIsWindows() ? usualWindowsLauncherLocations() :
        usualUnixLauncherLocations();
  }

  /**
   * Returns usual Google Chrome installation location on Windows.
   * 
   * WARNING: Executing this method on a non-windows platform will fail because the system root is
   * not set.
   * 
   * @return Usual Google Chrome installation location on Windows
   */
  protected String[] usualWindowsLauncherLocations() {
    return new String[] {
        WindowsUtils.getLocalAppDataPath() + "\\Google\\Chrome\\Application"
    };
  }

  /**
   * Returns usual Google Chrome installation location on Linux.
   * 
   * @return Usual Google Chrome installation location on Linux
   */
  protected String[] usualUnixLauncherLocations() {
    return new String[] {
        "/usr/bin",
        "/Applications/Google Chrome.app/Contents/MacOS",
    };
  }

}
