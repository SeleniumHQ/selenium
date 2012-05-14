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

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.Platform;
import org.openqa.selenium.os.CommandLine;
import org.openqa.selenium.os.WindowsUtils;
import org.openqa.selenium.remote.BrowserType;

import java.io.File;
import java.io.FilenameFilter;

/**
 * Discovers a valid Firefox 2.x or 3.x installation on local system. Preference is given to 2.x
 * installs.
 */
public class Firefox3Locator extends FirefoxLocator {

  private static final String UBUNTU_BASE_DIR = "/usr/lib";

  private static final String[] USUAL_OS_X_LAUNCHER_LOCATIONS = {
      "/Applications/Firefox-3.app/Contents/MacOS",
      "/Applications/Firefox.app/Contents/MacOS",
  };

  private String[] usualLauncherLocations;


  @Override
  protected String browserName() {
    return "Firefox 3";
  }

  @Override
  protected String seleniumBrowserName() {
    return BrowserType.FIREFOX_3;
  }

  @Override
  protected String[] standardlauncherFilenames() {
    if (runningOnWindows()) {
      return new String[] {"firefox.exe"};
    } else {
      return new String[] {"firefox-bin", "firefox"};
    }
  }

  @Override
  protected synchronized String[] usualLauncherLocations() {
    if (null == usualLauncherLocations) {
      usualLauncherLocations =
          runningOnWindows() ? firefoxDefaultLocationsOnWindows() : usualUnixLauncherLocations();
    }

    return usualLauncherLocations;
  }

  protected String[] usualUnixLauncherLocations() {
    final String[] ubuntuLocations;
    final String[] ubuntoLocationPaths;

    ubuntuLocations = firefoxDefaultLocationsOnUbuntu();
    if (ubuntuLocations.length == 0) {
      return USUAL_OS_X_LAUNCHER_LOCATIONS;
    }

    ubuntoLocationPaths = new String[ubuntuLocations.length];
    for (int i = 0; i < ubuntuLocations.length; i++) {
      ubuntoLocationPaths[i] = UBUNTU_BASE_DIR + "/" + ubuntuLocations[i];
    }
    return ubuntoLocationPaths;
  }


  /**
   * Dynamic because the directory version number keep changing.
   */
  protected String[] firefoxDefaultLocationsOnUbuntu() {
    final File dir;

    dir = new File(UBUNTU_BASE_DIR);

    if (!dir.exists() && dir.isDirectory()) {
      return new String[] {};
    }
    return dir.list(new FilenameFilter() {
      public boolean accept(File dir, String name) {
        return name.startsWith("firefox-");
      }
    });
  }

  protected String[] firefoxDefaultLocationsOnWindows() {
    return new ImmutableList.Builder<String>()
        .addAll(WindowsUtils.getPathsInProgramFiles("\\Firefox-3"))
        .addAll(WindowsUtils.getPathsInProgramFiles("\\Mozilla Firefox"))
        .addAll(WindowsUtils.getPathsInProgramFiles("\\Firefox"))
        .build().toArray(new String[0]);
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
