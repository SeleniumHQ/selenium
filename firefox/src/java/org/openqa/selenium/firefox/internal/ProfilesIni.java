package org.openqa.selenium.firefox.internal;

import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.internal.OperatingSystem;

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
    File appData = locateAppDataDirectory(OperatingSystem.getCurrentPlatform());
    profiles = readProfiles(appData);
  }
  
  protected Map<String, FirefoxProfile> readProfiles(File appData) {
    File profilesIni = new File(appData, "profiles.ini");
    if (!profilesIni.exists()) {
        throw new RuntimeException("Unable to locate the profiles.ini file, which contains information about where to locate the profiles");
    }

    Map<String, FirefoxProfile> toReturn = new HashMap<String, FirefoxProfile>();
    
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
        throw new RuntimeException(e);
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
      return new FirefoxProfile(profileDir);
    }
    return null;
  }

  public FirefoxProfile getProfile(String profileName) {
    return profiles.get(profileName);
  }
  
  public Collection<FirefoxProfile> getExistingProfiles() {
    return profiles.values();
  }
  
  protected File locateAppDataDirectory(OperatingSystem os) {
    File appData;
    switch (os) {
        case WINDOWS:
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
        throw new RuntimeException("Unable to locate directory which should contain the information about Firefox profiles.\n" +
                "Tried looking in: " + appData.getAbsolutePath());
    }

    if (!appData.isDirectory()) {
        throw new RuntimeException("The discovered user firefox data directory " +
                "(which normally contains the profiles) isn't a directory: " + appData.getAbsolutePath());
    }

    return appData;
  }
}

