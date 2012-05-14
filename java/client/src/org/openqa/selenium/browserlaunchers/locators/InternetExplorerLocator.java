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

import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.remote.BrowserType;

/**
 * Discovers a valid Internet Explorer installation on local system.
 */
public class InternetExplorerLocator extends SingleBrowserLocator {

  private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
      WindowsUtils.getProgramFilesPath() + "\\Internet Explorer"
  };

  @Override
  protected String browserName() {
    return "Internet Explorer";
  }

  @Override
  protected String seleniumBrowserName() {
    return BrowserType.IEXPLORE;
  }

  @Override
  protected String[] standardlauncherFilenames() {
    return new String[] {"iexplore.exe"};
  }

  @Override
  protected String browserPathOverridePropertyName() {
    return "internetExplorerDefaultPath";
  }

  @Override
  protected String[] usualLauncherLocations() {
    return WindowsUtils.thisIsWindows() ? USUAL_WINDOWS_LAUNCHER_LOCATIONS : new String[0];
  }

}
