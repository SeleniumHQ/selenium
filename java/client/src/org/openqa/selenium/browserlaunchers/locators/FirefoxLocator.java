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
import java.util.logging.Logger;

/**
 * Discovers a valid Firefox installation on local system.
 */
public class FirefoxLocator extends SingleBrowserLocator {

  private static Logger LOGGER = Logger.getLogger(FirefoxLocator.class.getName());

  private static final String UBUNTU_BASE_DIR = "/usr/lib";

  private static final String[] USUAL_OS_X_LAUNCHER_LOCATIONS = {
      "/Applications/Firefox-3.app/Contents/MacOS",
      "/Applications/Firefox.app/Contents/MacOS",
  };

  private String[] usualLauncherLocations;

  @Override
  protected String browserPathOverridePropertyName() {
    return "firefoxDefaultPath";
  }

  @Override
  protected String browserName() {
    return "Firefox";
  }

  @Override
  protected String seleniumBrowserName() {
    return BrowserType.FIREFOX;
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

  public BrowserInstallation findBrowserLocationOrFail() {
    LOGGER.fine("Discovering Firefox 3...");
    final BrowserInstallation firefoxLocation = findBrowserLocation();
    if (null != firefoxLocation) {
      return firefoxLocation;
    }

    LOGGER.fine("Did not find Firefox 3, now searching PATH...");
    final BrowserInstallation firefoxPathLocation = findBrowserLocationInPath();
    if (null != firefoxPathLocation) {
      return firefoxPathLocation;
    }

    throw new RuntimeException(couldNotFindAnyInstallationMessage());
  }

  public BrowserInstallation findBrowserLocationInPath() {
    for (String name : standardlauncherFilenames()) {
      String executable = CommandLine.find(name);
      if (executable == null) {
        continue;
      }

      if (isScriptFile(new File(executable))) {
        LOGGER.warning("Caution: '" + executable + "': file is a script file, not a real executable." +
                       " The browser environment is no longer fully under RC control");
      }

      String libraryPathPropertyName = CommandLine.getLibraryPathPropertyName();
      String libraryPath = System.getenv(libraryPathPropertyName);
      return new BrowserInstallation(executable, libraryPath);
    }
    return null;
  }

}
