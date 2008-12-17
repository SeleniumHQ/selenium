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

  private boolean isStringified(String value) {
    // Assume we a string is stringified (i.e. wrapped in " ") when
    // the first character == " and the last character == "
    return value.startsWith("\"") && value.endsWith("\"");
  }
}
