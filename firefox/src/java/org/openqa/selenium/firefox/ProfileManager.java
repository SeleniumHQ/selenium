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

package org.openqa.selenium.firefox;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.ProfilesIni;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A manager which takes care of the housekeeping of profile management.
 * Note that this is a singleton, which caches profiles used across the VM.
 * 
 * @author gregory.block@gmail.com (Gregory Block)
 */
public class ProfileManager {
  private static final String ANONYMOUS_PROFILE_NAME = "WEBDRIVER_ANONYMOUS_PROFILE";
  private static final ProfileManager SINGLETON = new ProfileManager();

  private final Map<String, FirefoxProfile> cachedProfiles =
      new ConcurrentHashMap<String, FirefoxProfile>();

  /**
   * Returns an instance of our ProfileManager, which stores cached, initialized
   * instances of requested profiles.
   * @return a ProfileManager
   */
  public static synchronized final ProfileManager getInstance() {
    return SINGLETON;
  }
  
  private ProfileManager() {
    // Private constructor.
  }
  
  /**
   * Constructs an anonymous profile.  If a template profile has not been created
   * for this anonymous type, it will create one.
   * 
   * @param port the port number to assign to the new profile
   * @return an anonymous FirefoxProfile, ready for use.
   */
  FirefoxProfile createProfile(FirefoxBinary binary, int port) {
    
    // Lazily instantiate the anonymous profile.
    FirefoxProfile anonymous = cachedProfiles.get(ANONYMOUS_PROFILE_NAME);
    if (!isValidProfile(anonymous)) {
      synchronized (this) {
        anonymous = cachedProfiles.get(ANONYMOUS_PROFILE_NAME);
        if (!isValidProfile(anonymous)) {
          anonymous = new FirefoxProfile() {
            @Override public void clean() {
              throw new WebDriverException("Cached profiles must not be cleaed.");
            }
          };
          initCachedProfile(binary, anonymous, port);
          cachedProfiles.put(ANONYMOUS_PROFILE_NAME, anonymous);
        }
      }
    }
    return anonymous.createCopy(port);
  }

  /**
   * Constructs a named profile.  If the template profile has not been created
   * for this profile, it will create one.
   * 
   * @param profileName the profile, ready for use
   * @param port the port number to assign to the new profile
   * @return a fresh clone of the requested named profile
   */
  FirefoxProfile createProfile(FirefoxBinary binary, String profileName, int port) {
    FirefoxProfile named = cachedProfiles.get(profileName);
    if (!isValidProfile(named)) {
      synchronized (this) {
        named = cachedProfiles.get(profileName);
        if (!isValidProfile(named)) {
          ProfilesIni profileDirectory = new ProfilesIni();
          named = profileDirectory.getProfile(profileName);
          if (!isValidProfile(named)) {
            throw new WebDriverException(String.format("Unable to locate profile \"%s\"", profileName));
          }

          initCachedProfile(binary, named, port);
          cachedProfiles.put(profileName, named);
        }
      }
    }
    return named.createCopy(port);
  }
  
  private static boolean isValidProfile(FirefoxProfile profile) {
    return profile != null && profile.getProfileDir().exists();
  }
  
  /**
   * Initialize a new profile directory, ensuring that everything is ready for use.
   * This contains more than we used to do - binary.startProfile(profile) is followed by
   * a waitFor() which waits for the start profile process to complete before calling profile
   * clean; moreover, we've merged in updated user prefs and port setting from elsewhere.
   * 
   * @param binary the binary to initialize the profile with
   * @param profile the profile to be initialized
   * @param port the port to initialize on
   */
  private static void initCachedProfile(FirefoxBinary binary, FirefoxProfile profile, int port) {
    
    // Install extension if necessary.
    profile.addWebDriverExtensionIfNeeded(false);

    // Set port and update user prefs.
    profile.setPort(port);
    profile.updateUserPrefs();

    // Clean up the profile.
    try {
      binary.clean(profile);
    } catch (IOException e) {
      throw new WebDriverException("Unable to clean profile", e);
    }
  }
}
