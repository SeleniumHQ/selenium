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

import org.openqa.selenium.Platform;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.os.WindowsUtils;

import java.io.File;

/**
 * Discovers a valid Firefox 2.x installation on local system.
 */
public class Firefox2Locator extends FirefoxLocator {

  private static final String[] USUAL_UNIX_LAUNCHER_LOCATIONS = {
      "/Applications/Minefield.app/Contents/MacOS",
      "/Applications/Firefox-2.app/Contents/MacOS",
      "/Applications/Firefox.app/Contents/MacOS",
      "/usr/lib/firefox", /* Ubuntu 7.x default location */
  };

  private static final String[] USUAL_WINDOWS_LAUNCHER_LOCATIONS = {
      WindowsUtils.getProgramFilesPath() + "\\Mozilla Firefox",
      WindowsUtils.getProgramFilesPath() + "\\Firefox",
      WindowsUtils.getProgramFilesPath() + "\\Firefox-2",
  };


  @Override
  protected String browserName() {
    return "Firefox 2";
  }

  @Override
  protected String seleniumBrowserName() {
    return "*firefox2";
  }

  @Override
  protected String[] standardlauncherFilenames() {
    if (WindowsUtils.thisIsWindows()) {
      return new String[] {"firefox.exe"};
    } else {
      return new String[] {"firefox-bin"};
    }
  }

  @Override
  protected String[] usualLauncherLocations() {
    return WindowsUtils.thisIsWindows()
        ? USUAL_WINDOWS_LAUNCHER_LOCATIONS
        : USUAL_UNIX_LAUNCHER_LOCATIONS;
  }

  protected boolean runningOnWindows() {
    return Platform.getCurrent().is(Platform.WINDOWS);
  }

  @Override
  public String computeLibraryPath(File launcherPath) {
    if (runningOnWindows()) {
      return "";
    }

    StringBuilder libraryPath = new StringBuilder();
    String libraryPropertyName = CommandLine.getLibraryPathPropertyName();

    String existingLibraryPath = System.getenv(libraryPropertyName);

    if (Platform.getCurrent().is(Platform.MAC) && Platform.getCurrent().getMinorVersion() > 5) {
      libraryPath.append(existingLibraryPath);
    } else {
      libraryPath.append(launcherPath.getParent()).append(File.pathSeparator).append(libraryPath);
    }

    return libraryPath.toString();
  }

}
