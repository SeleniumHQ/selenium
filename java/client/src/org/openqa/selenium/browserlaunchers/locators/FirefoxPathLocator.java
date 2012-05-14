/*
Copyright 2011 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

import org.openqa.selenium.browserlaunchers.LauncherUtils;
import org.openqa.selenium.os.CommandLine;

import java.io.File;
import java.util.logging.Logger;

public class FirefoxPathLocator implements BrowserLocator {
  private static final String[] commonNames = new String[] {
      "firefox",
      "firefox-bin",
  };
  private static final Logger log = Logger.getLogger(FirefoxPathLocator.class.getName());


  public BrowserInstallation findBrowserLocation() {
    for (String name : commonNames) {
      String executable = CommandLine.find(name);
      if (executable == null) {
        continue;
      }

      if (LauncherUtils.isScriptFile(new File(executable))) {
        log.warning("Caution: '" + executable + "': file is a script file, not a real executable." +
            " The browser environment is no longer fully under RC control");
      }

      String libraryPathPropertyName = CommandLine.getLibraryPathPropertyName();
      String libraryPath = System.getenv(libraryPathPropertyName);
      return new BrowserInstallation(executable, libraryPath);
    }
    return null;
  }

  public BrowserInstallation findBrowserLocationOrFail() {
    BrowserInstallation toReturn = findBrowserLocation();
    if (toReturn != null) {
      return toReturn;
    }

    throw new RuntimeException("Unable to find executable on PATH for Firefox");
  }

  public BrowserInstallation retrieveValidInstallationPath(String customLauncherPath) {
    throw new UnsupportedOperationException("retrieveValidInstallationPath");
  }
}
