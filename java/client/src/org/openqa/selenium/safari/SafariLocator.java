// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.


package org.openqa.selenium.safari;

import org.openqa.selenium.io.IOUtils;
import org.openqa.selenium.os.CommandLine;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.logging.Logger;

/**
 * Discovers a valid Safari installation on local system.
 */
class SafariLocator {

  private static Logger LOG = Logger.getLogger(SafariLocator.class.getName());

  private static final File DEFAULT_SAFARI_PATH =
    new File("/Applications/Safari.app/Contents/MacOS/Safari");

  public String launcherFilePath() {
    return findBrowserLocationOrFail().launcherFilePath();
  }

  public BrowserInstallation findBrowserLocationOrFail() {
    final BrowserInstallation location;

    location = findBrowserLocation();
    if (null == location) {
      throw new RuntimeException(
        "Safari could not be found in the path!\nPlease add the directory containing 'Safari' " +
        "to your PATH environment\nvariable, or explicitly specify a path to Safari.");
    }

    return location;
  }

  public BrowserInstallation findBrowserLocation() {
    final BrowserInstallation defaultPath;

    LOG.fine("Discovering Safari...");
    defaultPath = findAtADefaultLocation();
    if (null != defaultPath) {
      return defaultPath;
    }

    return findFileInPath("Safari");
  }

  protected BrowserInstallation findAtADefaultLocation() {
    final String userProvidedDefaultPath;

    userProvidedDefaultPath = System.getProperty(browserPathOverridePropertyName());
    if (null != userProvidedDefaultPath) {
      return retrieveValidInstallationPath(userProvidedDefaultPath);
    }

    final BrowserInstallation validInstallationPath;

    validInstallationPath = retrieveValidInstallationPath(DEFAULT_SAFARI_PATH);
    if (null != validInstallationPath) {
      return validInstallationPath;
    }

    return null;
  }

  public BrowserInstallation findFileInPath(String fileName) {
    return retrieveValidInstallationPath(CommandLine.find(fileName));
  }

  public BrowserInstallation retrieveValidInstallationPath(String launcher) {
    if (null == launcher) {
      return null;
    }
    return retrieveValidInstallationPath(new File(launcher));
  }


  protected BrowserInstallation retrieveValidInstallationPath(File launcher) {
    if (null == launcher) {
      return null;
    }
    LOG.fine("Checking whether Safari launcher at :'" + launcher + "' is valid...");
    if (!launcher.exists()) {
      return null;
    }

    if (isScriptFile(launcher)) {
      LOG.warning("Caution: '" +
                  launcher.getAbsolutePath() +
                  "': file is a script file, not a real executable.  The browser environment is no longer fully under RC control");
    }

    LOG.fine("Discovered valid Safari launcher  : '" + launcher + "'");


    return new BrowserInstallation(launcher.getAbsolutePath());
  }

  protected boolean isScriptFile(File aFile) {
    final char firstTwoChars[] = new char[2];
    FileReader reader = null;
    int charsRead;

    try {
      reader = new FileReader(aFile);
      charsRead = reader.read(firstTwoChars);
      if (2 != charsRead) {
        return false;
      }
      return (firstTwoChars[0] == '#' && firstTwoChars[1] == '!');
    } catch (IOException e) {
      throw new RuntimeException(e);
    } finally {
      IOUtils.closeQuietly(reader);
    }
  }

  protected String browserPathOverridePropertyName() {
    return "SafariDefaultPath";
  }

}
