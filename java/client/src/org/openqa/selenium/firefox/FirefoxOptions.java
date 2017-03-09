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

import static com.google.common.base.Preconditions.checkNotNull;
import static org.openqa.selenium.firefox.FirefoxDriver.BINARY;
import static org.openqa.selenium.firefox.FirefoxDriver.PROFILE;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_SSL_CERTS;
import static org.openqa.selenium.remote.CapabilityType.LOGGING_PREFS;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_WEB_STORAGE;

import com.google.common.base.Joiner;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.firefox.internal.ProfilesIni;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Manage firefox specific settings in a way that geckodriver can understand. Use {@link
 * #addTo(DesiredCapabilities)} to also add settings to a {@link DesiredCapabilities} object.
 * <p>
 * An example of usage:
 * <pre>
 *    FirefoxOptions options = new FirefoxOptions()
 *      .addPreference("browser.startup.page", 1)
 *      .addPreference("browser.startup.homepage", "https://www.google.co.uk");
 *    WebDriver driver = new FirefoxDriver(options);
 * </pre>
 */
public class FirefoxOptions {

  public final static String FIREFOX_OPTIONS = "moz:firefoxOptions";

  private String binaryPath;
  private FirefoxBinary actualBinary;

  private FirefoxProfile profile;
  private List<String> args = new ArrayList<>();
  private Map<String, Boolean> booleanPrefs = new HashMap<>();
  private Map<String, Integer> intPrefs = new HashMap<>();
  private Map<String, String> stringPrefs = new HashMap<>();
  private Level logLevel = null;
  private Boolean legacy;
  private DesiredCapabilities desiredCapabilities = new DesiredCapabilities();
  private DesiredCapabilities requiredCapabilities = new DesiredCapabilities();

  /** INTERNAL ONLY: DO NOT USE */
  static FirefoxOptions fromJsonMap(Map<String, Object> map) throws IOException {
    FirefoxOptions options = new FirefoxOptions();

    if (map.containsKey("binary")) {
      options.setBinary(getOption(map, "binary", String.class));
    }

    if (map.containsKey("args")) {
      @SuppressWarnings("unchecked")  // #YOLO
      List<String> list = (List) getOption(map, "args", List.class);
      options.addArguments(list);
    }

    if (map.containsKey("profile")) {
      Object value = map.get("profile");
      if (value instanceof String) {
        options.setProfile(FirefoxProfile.fromJson((String) value));
      } else if (value instanceof FirefoxProfile) {
        options.setProfile((FirefoxProfile) value);
      } else {
        throw new WebDriverException(
            "In FirefoxOptions, don't know how to convert profile: " + map);
      }
    }

    if (map.containsKey("prefs")) {
      @SuppressWarnings("unchecked")  // #YOLO
      Map<String, Object> prefs = (Map) getOption(map, "prefs", Map.class);
      prefs.entrySet().forEach(entry -> {
        Object value = entry.getValue();
        if (value instanceof Boolean) {
          options.addPreference(entry.getKey(), (Boolean) value);
        } else if (value instanceof Integer) {
          options.addPreference(entry.getKey(), (Integer) value);
        } else if (value instanceof String) {
          options.addPreference(entry.getKey(), (String) value);
        } else {
          throw new WebDriverException(
              "Invalid Firefox preference value: " + entry.getKey() + "=" + value);
        }
      });
    }

    return options;
  }

  private static <T> T getOption(Map<String, Object> map, String key, Class<T> type) {
    Object value = map.get(key);
    if (type.isInstance(value)) {
      return type.cast(value);
    }
    throw new WebDriverException(
        String.format(
            "In FirefoxOptions, expected key '%s' to be a %s: %s", key, type.getSimpleName(), map));
  }

  public FirefoxOptions setLegacy(boolean legacy) {
    this.legacy = legacy;
    return this;
  }

  public boolean isLegacy() {
    String forceMarionette = System.getProperty(FirefoxDriver.SystemProperty.DRIVER_USE_MARIONETTE);
    if (forceMarionette != null) {
      return !Boolean.valueOf(forceMarionette);
    }
    if (legacy != null) {
      return legacy;
    }

    return false;
  }

  public FirefoxOptions setBinary(FirefoxBinary binary) {
    this.actualBinary = Preconditions.checkNotNull(binary);
    binary.amendOptions(this);
    this.binaryPath = null;
    return this;
  }

  public FirefoxOptions setBinary(Path path) {
    // Default to UNIX-style paths, even on Windows.
    StringBuilder builder = new StringBuilder(path.isAbsolute() ? "/" : "");
    this.binaryPath = Joiner.on("/").appendTo(builder, path).toString();
    this.actualBinary = null;
    return this;
  }

  public FirefoxOptions setBinary(String path) {
    return setBinary(Paths.get(checkNotNull(path)));
  }

  /**
   * Constructs a {@link FirefoxBinary} and returns that to be used, and because of this is only
   * useful when actually starting firefox.
   */
  public FirefoxBinary getBinary() {
    return getBinaryOrNull().orElse(new FirefoxBinary());
  }

  public Optional<FirefoxBinary> getBinaryOrNull() {
    if (actualBinary != null) {
      return Optional.of(actualBinary);
    }
    if (binaryPath != null) {
      return Optional.of(new FirefoxBinary(new File(binaryPath)));
    }

    return Stream.of(requiredCapabilities, desiredCapabilities)
        .map(this::determineBinaryFromCapabilities)
        .filter(Optional::isPresent)
        .findFirst()
        .orElse(Optional.empty());
  }

  private Optional<FirefoxBinary> determineBinaryFromCapabilities(Capabilities caps) {
    if (caps.getCapability(FirefoxDriver.BINARY) != null) {
      Object raw = caps.getCapability(FirefoxDriver.BINARY);
      if (raw instanceof FirefoxBinary) {
        return Optional.of((FirefoxBinary) raw);
      } else {
        try {
          return Optional.of(new FirefoxBinary(new File(raw.toString())));
        } catch (WebDriverException wde) {
          throw new SessionNotCreatedException(wde.getMessage());
        }
      }
    }

    if (caps.getCapability(CapabilityType.VERSION) != null) {
      try {
        FirefoxBinary.Channel channel = FirefoxBinary.Channel.fromString(
            (String) caps.getCapability(CapabilityType.VERSION));
        return Optional.of(new FirefoxBinary(channel));
      } catch (WebDriverException ex) {
        return Optional.of(new FirefoxBinary(
            (String) caps.getCapability(CapabilityType.VERSION)));
      }
    }

    return Optional.empty();
  }

  public FirefoxOptions setProfile(FirefoxProfile profile) {
    this.profile = profile;
    return this;
  }

  public FirefoxProfile getProfile() {
    FirefoxProfile profileToUse = profile;
    if (profileToUse == null) {
      profileToUse = extractProfile(requiredCapabilities);
    }
    if (profileToUse == null) {
      profileToUse = extractProfile(desiredCapabilities);
    }
    if (profileToUse == null) {
      String suggestedProfile = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_PROFILE);
      if (suggestedProfile != null) {
        profileToUse = new ProfilesIni().getProfile(suggestedProfile);
        if (profileToUse == null) {
          throw new WebDriverException(String.format(
              "Firefox profile '%s' named in system property '%s' not found",
              suggestedProfile, FirefoxDriver.SystemProperty.BROWSER_PROFILE));
        }
      }
    }
    if (profileToUse == null) {
      profileToUse = new FirefoxProfile();
    }

    populateProfile(profileToUse, desiredCapabilities);
    populateProfile(profileToUse, requiredCapabilities);

    FirefoxProfile prefHolder = profileToUse;
    booleanPrefs.entrySet().forEach(pref -> prefHolder.setPreference(pref.getKey(), pref.getValue()));
    intPrefs.entrySet().forEach(pref -> prefHolder.setPreference(pref.getKey(), pref.getValue()));
    stringPrefs.entrySet().forEach(pref -> prefHolder.setPreference(pref.getKey(), pref.getValue()));

    return profileToUse;
  }

  private static void populateProfile(FirefoxProfile profile, Capabilities capabilities) {
    Preconditions.checkNotNull(profile);
    if (capabilities == null) {
      return;
    }

    if (capabilities.getCapability(SUPPORTS_WEB_STORAGE) != null) {
      Boolean supportsWebStorage = (Boolean) capabilities.getCapability(SUPPORTS_WEB_STORAGE);
      profile.setPreference("dom.storage.enabled", supportsWebStorage.booleanValue());
    }
    if (capabilities.getCapability(ACCEPT_SSL_CERTS) != null) {
      Boolean acceptCerts = (Boolean) capabilities.getCapability(ACCEPT_SSL_CERTS);
      profile.setAcceptUntrustedCertificates(acceptCerts);
    }
    if (capabilities.getCapability(LOGGING_PREFS) != null) {
      LoggingPreferences logsPrefs =
          (LoggingPreferences) capabilities.getCapability(LOGGING_PREFS);
      for (String logtype : logsPrefs.getEnabledLogTypes()) {
        profile.setPreference("webdriver.log." + logtype,
                              logsPrefs.getLevel(logtype).intValue());
      }
    }
  }

  // Confusing API. Keeping package visible only
  FirefoxOptions setProfileSafely(FirefoxProfile profile) {
    if (profile == null) {
      return this;
    }
    return setProfile(profile);
  }

  public FirefoxOptions addArguments(String... arguments) {
    addArguments(ImmutableList.copyOf(arguments));
    return this;
  }

  public FirefoxOptions addArguments(List<String> arguments) {
    args.addAll(arguments);
    return this;
  }

  public FirefoxOptions addPreference(String key, boolean value) {
    booleanPrefs.put(checkNotNull(key), value);
    return this;
  }

  public FirefoxOptions addPreference(String key, int value) {
    intPrefs.put(checkNotNull(key), value);
    return this;
  }

  public FirefoxOptions addPreference(String key, String value) {
    stringPrefs.put(checkNotNull(key), checkNotNull(value));
    return this;
  }

  public FirefoxOptions setLogLevel(Level logLevel) {
    this.logLevel = logLevel;
    return this;
  }

  public FirefoxOptions addDesiredCapabilities(Capabilities desiredCapabilities) {
    if (desiredCapabilities == null) {
      return this;
    }

    this.desiredCapabilities.merge(desiredCapabilities);

    FirefoxProfile suggestedProfile = extractProfile(desiredCapabilities);
    if (suggestedProfile !=  null) {
      if (!booleanPrefs.isEmpty() || !intPrefs.isEmpty() || !stringPrefs.isEmpty()) {
        throw new IllegalStateException(
            "Unable to determine if preferences set on this option " +
            "are the same as the profile in the capabilities");
      }
      if (profile != null && !suggestedProfile.equals(profile)) {
        throw new IllegalStateException(
            "Profile has been set on both the capabilities and these options, but they're " +
            "different. Unable to determine which one you want to use.");
      }
      profile = suggestedProfile;
    }

    Object binary = desiredCapabilities.getCapability(BINARY);
    if (binary != null) {
      if (binary instanceof File) {
        setBinary(((File) binary).toPath());
      } else if (binary instanceof FirefoxBinary) {
        setBinary((FirefoxBinary) binary);
      } else if (binary instanceof Path) {
        setBinary((Path) binary);
      } else if (binary instanceof String) {
        setBinary((String) binary);
      }
    }

    return this;
  }

  public FirefoxOptions addRequiredCapabilities(Capabilities requiredCapabilities) {
    this.requiredCapabilities.merge(requiredCapabilities);

    FirefoxProfile suggestedProfile = extractProfile(desiredCapabilities);
    if (suggestedProfile !=  null) {
      if (!booleanPrefs.isEmpty() || !intPrefs.isEmpty() || !stringPrefs.isEmpty()) {
        throw new IllegalStateException(
            "Unable to determine if preferences set on this option " +
            "are the same as the profile in the capabilities");
      }
      if (profile != null && !suggestedProfile.equals(profile)) {
        throw new IllegalStateException(
            "Profile has been set on both the capabilities and these options, but they're " +
            "different. Unable to determine which one you want to use.");
      }
      profile = suggestedProfile;
    }

    return this;
  }

  private FirefoxProfile extractProfile(Capabilities capabilities) {
    if (capabilities == null) {
      return null;
    }
    Object raw = capabilities.getCapability(PROFILE);
    if (raw == null) {
      return null;

    } else if (raw instanceof FirefoxProfile) {
      return (FirefoxProfile) raw;

    } else if (raw instanceof String) {
      try {
        return FirefoxProfile.fromJson((String) raw);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }

    return null;
  }

  public Capabilities toDesiredCapabilities() {
    DesiredCapabilities capabilities = new DesiredCapabilities(desiredCapabilities);

    if (isLegacy()) {
      capabilities.setCapability(FirefoxDriver.MARIONETTE, false);
    }

    Object priorBinary = capabilities.getCapability(BINARY);
    if (priorBinary instanceof Path) {
      // Again, unix-style path
      priorBinary = Joiner.on("/").join((Path) priorBinary);
    }
    if (priorBinary instanceof String) {
      if (actualBinary != null || !priorBinary.equals(binaryPath)) {
        throw new IllegalStateException(String.format(
            "Binary already set in capabilities, but is different from the one set here: %s, %s",
            priorBinary,
            binaryPath != null ? binaryPath : actualBinary));
      }
    }
    if (priorBinary instanceof FirefoxBinary) {
      // Relies on instance equality, which is fragile.
      if (binaryPath != null || !priorBinary.equals(actualBinary)) {
        throw new IllegalStateException(String.format(
            "Binary already set in capabilities, but is different from the one set here: %s, %s",
            priorBinary,
            actualBinary != null ? actualBinary : binaryPath));
      }
    }

    Object priorProfile = capabilities.getCapability(PROFILE);
    if (priorProfile != null) {
      if (!booleanPrefs.isEmpty() || !intPrefs.isEmpty() || !stringPrefs.isEmpty()) {
        throw new IllegalStateException(
            "Unable to determine if preferences set on this option " +
            "are the same as the profile in the capabilities");
      }
      if (profile != null && !priorProfile.equals(profile)) {
        throw new IllegalStateException(
            "Profile has been set on both the capabilities and these options, but they're " +
            "different. Unable to determine which one you want to use.");
      }
    }

    capabilities.setCapability(FIREFOX_OPTIONS, this);

    if (actualBinary != null) {
      actualBinary.addCommandLineOptions(args.toArray(new String[args.size()]));
      capabilities.setCapability(BINARY, actualBinary);
    }
    if (binaryPath != null) {
      capabilities.setCapability(BINARY, binaryPath);
    }

    if (profile != null) {
      capabilities.setCapability(PROFILE, profile);
    }

    return capabilities;
  }

  public Capabilities toRequiredCapabilities() {
    return requiredCapabilities;
  }

  public DesiredCapabilities addTo(DesiredCapabilities capabilities) {
    capabilities.merge(toDesiredCapabilities());
    return capabilities;
  }

  public JsonObject toJson() throws IOException {
    JsonObject options = new JsonObject();

    if (actualBinary != null) {
      options.addProperty("binary", actualBinary.getPath());
    } else if (binaryPath != null) {
      options.addProperty("binary", binaryPath);
    }

    if (profile != null) {
      for (Map.Entry<String, Boolean> pref : booleanPrefs.entrySet()) {
        profile.setPreference(pref.getKey(), pref.getValue());
      }
      for (Map.Entry<String, Integer> pref : intPrefs.entrySet()) {
        profile.setPreference(pref.getKey(), pref.getValue());
      }
      for (Map.Entry<String, String> pref : stringPrefs.entrySet()) {
        profile.setPreference(pref.getKey(), pref.getValue());
      }
      options.addProperty("profile", profile.toJson());
    } else {
      JsonObject allPrefs = new JsonObject();
      for (Map.Entry<String, Boolean> pref : booleanPrefs.entrySet()) {
        allPrefs.add(pref.getKey(), new JsonPrimitive(pref.getValue()));
      }
      for (Map.Entry<String, Integer> pref : intPrefs.entrySet()) {
        allPrefs.add(pref.getKey(), new JsonPrimitive(pref.getValue()));
      }
      for (Map.Entry<String, String> pref : stringPrefs.entrySet()) {
        allPrefs.add(pref.getKey(), new JsonPrimitive(pref.getValue()));
      }
      options.add("prefs", allPrefs);
    }

    if (logLevel != null) {
      JsonObject level = new JsonObject();
      level.add("level", new JsonPrimitive(logLevelToGeckoLevel()));
      options.add("log", level);
    }

    JsonArray arguments = new JsonArray();
    for (String arg : args) {
      arguments.add(new JsonPrimitive(arg));
    }
    options.add("args", arguments);

    return options;
  }

  private String logLevelToGeckoLevel() {
    // levels defined by GeckoDriver
    // https://github.com/mozilla/geckodriver#log-object
    if (logLevel.intValue() < Level.FINE.intValue()) {
      return "trace";
    }
    if (logLevel == Level.FINE) {
      return "debug";
    }
    if (logLevel == Level.CONFIG) {
      return "config";
    }
    if (logLevel == Level.INFO) {
      return "info";
    }
    if (logLevel == Level.WARNING) {
      return "warn";
    }
    if (logLevel == Level.SEVERE) {
      return "error";
    }
    if (logLevel == Level.OFF) {
      return "fatal";
    }

    // something else?  ¯\_(ツ)_/¯
    return "debug";
  }

  @Override
  public String toString() {
    return "{" +
           "binary=" + getBinaryOrNull() + ", " +
           "args=" + args + ", " +
           "legacy=" + legacy + ", " +
           "logLevel=" + logLevel + ", " +
           "prefs=" +
           Stream.of(booleanPrefs, intPrefs, stringPrefs)
               .map(Map::entrySet)
               .flatMap(Collection::stream)
               .collect(
                   Collectors.toMap(Map.Entry::getKey, e -> String.valueOf(e.getValue()))) +
           ", " +
           "profile=" + profile +
           "}";
  }
}
