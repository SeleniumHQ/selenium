/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.firefox.internal;

import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.internal.FileHandler;
import org.openqa.selenium.internal.TemporaryFilesystem;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.text.MessageFormat;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class ProfilesIni {
  private Map<String, FirefoxProfile> profiles = new HashMap<String, FirefoxProfile>();
  
  public ProfilesIni() {
    File appData = locateAppDataDirectory(Platform.getCurrent());
    profiles = readProfiles(appData);
  }
  
  protected Map<String, FirefoxProfile> readProfiles(File appData) {
    Map<String, FirefoxProfile> toReturn = new HashMap<String, FirefoxProfile>();

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
        reader = new BufferedReader(new FileReader(profilesIni));

        String line = reader.readLine();

        while (line != null) {
          if (line.startsWith("[Profile")) {
            FirefoxProfile profile = newProfile(name, appData, path, isRelative);
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
              FirefoxProfile profile = newProfile(name, appData, path, isRelative);
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
  
  protected FirefoxProfile newProfile(String name, File appData, String path, boolean isRelative) {
    if (name != null && path != null) {
      File profileDir = isRelative ? new File(appData, path) : new File(path);
      return new ProfileFromDirectory(profileDir);
    }
    return null;
  }

  private static class ProfileFromDirectory extends FirefoxProfile {
    public ProfileFromDirectory(File dir) {
      super(dir);
    }
  }

  public FirefoxProfile getProfile(String profileName) {
    FirefoxProfile liveProfile = profiles.get(profileName);
    if (liveProfile == null)
      return null;

    // Make a copy of the profile to use
    File tempDir = TemporaryFilesystem.createTempDir("userprofile", "copy");
    try {
      FileHandler.copy(liveProfile.getProfileDir(), tempDir);

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

    FirefoxProfile profile = new ProfileFromDirectory(tempDir);

    if (profile.getPort() == 0)
      profile.setPort(FirefoxDriver.DEFAULT_PORT);
    
    return profile;
  }
  
  public Collection<FirefoxProfile> getExistingProfiles() {
    return profiles.values();
  }
  
  protected File locateAppDataDirectory(Platform os) {
    File appData;
    switch (os) {
        case WINDOWS:
        case VISTA:
        case XP:
            appData = new File(MessageFormat.format("{0}\\Mozilla\\Firefox", System.getenv("APPDATA")));
            break;

        case MAC:
            appData = new File(MessageFormat.format("{0}/Library/Application Support/Firefox", System.getenv("HOME")));
            break;

        default:
            appData = new File(MessageFormat.format("{0}/.mozilla/firefox", System.getenv("HOME")));
            break;
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

