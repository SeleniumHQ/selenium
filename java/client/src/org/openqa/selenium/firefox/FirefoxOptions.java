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
import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;
import static org.openqa.selenium.firefox.FirefoxDriver.PROFILE;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_SSL_CERTS;
import static org.openqa.selenium.remote.CapabilityType.LOGGING_PREFS;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_WEB_STORAGE;
import static org.openqa.selenium.remote.CapabilityType.VERSION;

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
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
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
  private final static Logger LOG = Logger.getLogger(FirefoxOptions.class.getName());

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
    desiredCapabilities.setCapability(MARIONETTE, !legacy);
    requiredCapabilities.setCapability(MARIONETTE, !legacy);
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
    desiredCapabilities.setCapability(BINARY, binary);
    this.binaryPath = null;
    return this;
  }

  public FirefoxOptions setBinary(Path path) {
    // Default to UNIX-style paths, even on Windows.
    this.binaryPath = asUnixPath(path);
    this.actualBinary = null;
    if (Files.exists(path)) {
      desiredCapabilities.setCapability(BINARY, new FirefoxBinary(path.toFile()));
    }
    return this;
  }

  private String asUnixPath(Path path) {
    StringBuilder builder = new StringBuilder(path.isAbsolute() ? "/" : "");
    return Joiner.on("/").appendTo(builder, path).toString();
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

    Object rawVersion = caps.getCapability(VERSION);
    if (rawVersion != null && !"".equals(rawVersion)) {
      try {
        FirefoxBinary.Channel channel =
            FirefoxBinary.Channel.fromString(String.valueOf(rawVersion));
        return Optional.of(new FirefoxBinary(channel));
      } catch (WebDriverException ex) {
        return Optional.of(new FirefoxBinary(String.valueOf(rawVersion)));
      }
    }

    return Optional.empty();
  }

  public FirefoxOptions setProfile(FirefoxProfile profile) {
    this.profile = profile;

    if (!booleanPrefs.isEmpty() || !intPrefs.isEmpty() || !stringPrefs.isEmpty()) {
      LOG.info("Will update profile with preferences from these options.");
      booleanPrefs.entrySet().forEach(e -> profile.setPreference(e.getKey(), e.getValue()));
      intPrefs.entrySet().forEach(e -> profile.setPreference(e.getKey(), e.getValue()));
      stringPrefs.entrySet().forEach(e -> profile.setPreference(e.getKey(), e.getValue()));
    }

    desiredCapabilities.setCapability(PROFILE, profile);

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
    if (profile != null) {
      profile.setPreference(key, value);
    }
    return this;
  }

  public FirefoxOptions addPreference(String key, int value) {
    intPrefs.put(checkNotNull(key), value);
    if (profile != null) {
      profile.setPreference(key, value);
    }
    return this;
  }

  public FirefoxOptions addPreference(String key, String value) {
    stringPrefs.put(checkNotNull(key), checkNotNull(value));
    if (profile != null) {
      profile.setPreference(key, value);
    }
    return this;
  }

  public FirefoxOptions setLogLevel(Level logLevel) {
    this.logLevel = logLevel;
    return this;
  }

  public FirefoxOptions addDesiredCapabilities(Capabilities desiredCapabilities) {
    return validateAndAmendUsing(this.desiredCapabilities, desiredCapabilities);
  }

  public FirefoxOptions addRequiredCapabilities(Capabilities requiredCapabilities) {
    return validateAndAmendUsing(this.requiredCapabilities, requiredCapabilities);
  }

  private FirefoxOptions validateAndAmendUsing(DesiredCapabilities existing, Capabilities caps) {
    if (caps == null) {
      return this;
    }

    existing.merge(caps);

    FirefoxProfile newProfile = extractProfile(caps);
    if (profile != null && newProfile != null && !profile.equals(newProfile)) {
      LOG.info("Found a profile on these options and the capabilities. Will assume you " +
               "want the profile already set here. If you're seeing this in the logs of the " +
               "standalone server, we've probably just deserialized the same options twice and " +
               "it's likely that there's nothing to worry about.");
    }

    if (newProfile != null) {
      setProfile(newProfile);
    }

    Object binary = existing.getCapability(BINARY);
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
    return toCapabilities(desiredCapabilities);
  }

  public Capabilities toRequiredCapabilities() {
    return toCapabilities(requiredCapabilities);
  }

  private Capabilities toCapabilities(Capabilities source) {
    DesiredCapabilities capabilities = new DesiredCapabilities(source);

    if (isLegacy()) {
      capabilities.setCapability(FirefoxDriver.MARIONETTE, false);
    }

    Object priorBinary = capabilities.getCapability(BINARY);
    if (priorBinary instanceof Path) {
      // Again, unix-style path
      priorBinary = asUnixPath((Path) priorBinary);
    }
    if (priorBinary instanceof String) {
      priorBinary = asUnixPath(Paths.get((String) priorBinary));
    }
    if (priorBinary instanceof FirefoxBinary) {
      priorBinary = asUnixPath(((FirefoxBinary) priorBinary).getFile().toPath());
    }

    if ((actualBinary != null && !actualBinary.getFile().toPath().equals(priorBinary)) ||
        (binaryPath != null && !binaryPath.equals(priorBinary))) {
      LOG.info(String.format(
          "Preferring the firefox binary in these options (%s rather than %s)",
          actualBinary != null ? actualBinary.getPath() : binaryPath,
          priorBinary));
    }
    if (actualBinary != null && binaryPath == null) {
      capabilities.setCapability(BINARY, actualBinary);
    } else if (binaryPath != null && actualBinary == null) {
      if (Files.exists(Paths.get(binaryPath))) {
        capabilities.setCapability(BINARY, new FirefoxBinary(new File(binaryPath)));
      }
    }

    Object priorProfile = capabilities.getCapability(PROFILE);
    if (priorProfile instanceof String) {
      try {
        priorProfile = FirefoxProfile.fromJson((String) priorProfile);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
    if (priorProfile != null) {
      if (!booleanPrefs.isEmpty() || !intPrefs.isEmpty() || !stringPrefs.isEmpty()) {
        LOG.info("Setting our our preferences on the existing profile");
      }
      if (profile != null && !priorProfile.equals(profile)) {
        LOG.info("Found a profile on these options and the capabilities. Will assume you " +
                 "want the profile already set here. If you're seeing this in the logs of the " +
                 "standalone server, we've probably just deserialized the same options twice and " +
                 "it's likely that there's nothing to worry about.");
      }
      if (profile == null) {
        if (priorProfile instanceof FirefoxProfile) {
          profile = (FirefoxProfile) priorProfile;
        } else {
          LOG.info("Unable to use profile: " + priorProfile.getClass());
        }
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

  public DesiredCapabilities addTo(DesiredCapabilities capabilities) {
    capabilities.merge(toDesiredCapabilities());
    capabilities.merge(toRequiredCapabilities());
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
