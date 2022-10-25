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

package org.openqa.selenium.firefox;

import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.WINDOWS;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;

public class ProfilesIni {
  private Map<String, File> profiles;

  public ProfilesIni() {
    File appData = locateAppDataDirectory(Platform.getCurrent());
    profiles = readProfiles(appData);
  }

  protected Map<String, File> readProfiles(File appData) {
    Map<String, File> toReturn = new HashMap<>();

    File profilesIni = new File(appData, "profiles.ini");
    if (!profilesIni.exists()) {
      // Fine. No profiles.ini file
      return toReturn;
    }

    boolean isRelative = true;
    String name = null;
    String path = null;

    BufferedReader reader = null;
    try {
      reader = Files.newBufferedReader(profilesIni.toPath(), Charset.defaultCharset());

      String line = reader.readLine();

      while (line != null) {
        if (line.startsWith("[Profile")) {
          File profile = newProfile(name, appData, path, isRelative);
          if (profile != null)
            toReturn.put(name, profile);

          name = null;
          path = null;
        } else if (line.startsWith("Name=")) {
          name = line.substring("Name=".length());
        } else if (line.startsWith("IsRelative=")) {
          isRelative = line.endsWith("1");
        } else if (line.startsWith("Path=")) {
          path = line.substring("Path=".length());
        }

        line = reader.readLine();
      }
    } catch (IOException e) {
      throw new WebDriverException(e);
    } finally {
      try {
        if (reader != null) {
          File profile = newProfile(name, appData, path, isRelative);
          if (profile != null)
            toReturn.put(name, profile);

          reader.close();
        }
      } catch (IOException e) {
        // Nothing that can be done sensibly. Swallowing.
      }
    }

    return toReturn;
  }

  protected File newProfile(String name, File appData, String path, boolean isRelative) {
    if (name != null && path != null) {
      return isRelative ? new File(appData, path) : new File(path);
    }
    return null;
  }

  public FirefoxProfile getProfile(String profileName) {
    File profileDir = profiles.get(profileName);
    if (profileDir == null) {
      return null;
    }

    // Make a copy of the profile to use
    File tempDir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("userprofile", "copy");
    try {
      FileHandler.copy(profileDir, tempDir);

      // Delete the old compreg.dat file so that our new extension is registered
      File compreg = new File(tempDir, "compreg.dat");
      if (compreg.exists()) {
        if (!compreg.delete()) {
          throw new WebDriverException("Cannot delete file from copy of profile " + profileName);
        }
      }
    } catch (IOException e) {
      throw new WebDriverException(e);
    }

    return new FirefoxProfile(tempDir);
  }

  protected File locateAppDataDirectory(Platform os) {
    File appData;
    if (os.is(WINDOWS)) {
      appData = new File(MessageFormat.format("{0}\\Mozilla\\Firefox", System.getenv("APPDATA")));

    } else if (os.is(MAC)) {
      appData =
          new File(MessageFormat.format("{0}/Library/Application Support/Firefox",
                                        System.getenv("HOME")));

    } else {
      appData = new File(MessageFormat.format("{0}/.mozilla/firefox", System.getenv("HOME")));
    }

    if (!appData.exists()) {
      // It's possible we're being run as part of an automated build.
      // Assume the user knows what they're doing
      return null;
    }

    if (!appData.isDirectory()) {
      throw new WebDriverException("The discovered user firefox data directory " +
          "(which normally contains the profiles) isn't a directory: " + appData.getAbsolutePath());
    }

    return appData;
  }
}
