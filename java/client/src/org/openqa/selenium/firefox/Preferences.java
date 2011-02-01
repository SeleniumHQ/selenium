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

import java.util.HashMap;
import java.util.Map;

class Preferences {

  private Map<String, String> additionalPrefs = new HashMap<String, String>();

  public void setPreference(String key, String value) {
    if (isStringified(value)) {
      throw new IllegalArgumentException(
          String.format("Preference values must be plain strings: %s: %s",
                        key, value));
    }
    additionalPrefs.put(key, String.format("\"%s\"", value));
  }

  public void setPreference(String key, boolean value) {
    additionalPrefs.put(key, String.valueOf(value));
  }

  public void setPreference(String key, int value) {
    additionalPrefs.put(key, String.valueOf(value));
  }

  public void addTo(Map<String, String> prefs) {
    prefs.putAll(additionalPrefs);
  }

  public void addTo(FirefoxProfile profile) {
    profile.getAdditionalPreferences().additionalPrefs.putAll(additionalPrefs);
  }

  // Visible for testing
  protected Object getPreference(String key) {
    return additionalPrefs.get(key);
  }
  
  private boolean isStringified(String value) {
    // Assume we a string is stringified (i.e. wrapped in " ") when
    // the first character == " and the last character == "
    return value.startsWith("\"") && value.endsWith("\"");
  }
}
