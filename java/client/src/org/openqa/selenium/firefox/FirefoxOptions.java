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
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;
import static org.openqa.selenium.remote.CapabilityType.SUPPORTS_WEB_STORAGE;
import static org.openqa.selenium.remote.CapabilityType.UNHANDLED_PROMPT_BEHAVIOUR;
import static org.openqa.selenium.remote.CapabilityType.VERSION;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.UnexpectedAlertBehaviour;
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
  private boolean legacy;
  private DesiredCapabilities desiredCapabilities = new DesiredCapabilities();

  private void amend(Map<String, Object> map) throws IOException {
    if (map.containsKey("binary")) {
      setBinary(getOption(map, "binary", String.class));
    }

    if (map.containsKey("args")) {
      @SuppressWarnings("unchecked")  // #YOLO
      List<String> list = (List<String>) getOption(map, "args", List.class);
      addArguments(list);
    }

    if (map.containsKey("profile")) {
      Object value = map.get("profile");
      if (value instanceof String) {
        setProfile(FirefoxProfile.fromJson((String) value));
      } else if (value instanceof FirefoxProfile) {
        setProfile((FirefoxProfile) value);
      } else {
        throw new WebDriverException(
            "In FirefoxOptions, don't know how to convert profile: " + map);
      }
    }

    if (map.containsKey("prefs")) {
      @SuppressWarnings("unchecked")  // #YOLO
      Map<String, Object> prefs = (Map<String, Object>) getOption(map, "prefs", Map.class);
      prefs.forEach((key, value) -> {
        if (value instanceof Boolean) {
          addPreference(key, (Boolean) value);
        } else if (value instanceof Integer || value instanceof Long) {
          addPreference(key, ((Number) value).intValue());
        } else if (value instanceof String) {
          addPreference(key, (String) value);
        } else {
          throw new WebDriverException(
              "Invalid Firefox preference value: " + key + "=" + value);
        }
      });
    }
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

  private void amend(FirefoxOptions source) {
    if (source.actualBinary != null || source.binaryPath != null) {
      setBinary(source.getBinary());
    }
    if (source.args != null) {
      addArguments(source.args);
    }
    if (source.profile != null) {
      setProfile(source.getProfile());
    }
    source.booleanPrefs.forEach(this::addPreference);
    source.intPrefs.forEach(this::addPreference);
    source.stringPrefs.forEach(this::addPreference);

    if (source.logLevel != null) {
      setLogLevel(source.logLevel);
    }
    setLegacy(source.isLegacy());
    desiredCapabilities = new DesiredCapabilities(source.desiredCapabilities);
  }

  public FirefoxOptions() {
    // Read system properties and use those if they are set, allowing users to override them later
    // should they want to.

    String binary = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_BINARY);
    if (binary != null) {
      setBinary(binary);
    }

    String forceMarionette = System.getProperty(FirefoxDriver.SystemProperty.DRIVER_USE_MARIONETTE);
    if (forceMarionette != null) {
      setLegacy(!Boolean.getBoolean(FirefoxDriver.SystemProperty.DRIVER_USE_MARIONETTE));
    }

    String profileName = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_PROFILE);
    if (profileName != null) {
      this.profile = new ProfilesIni().getProfile(profileName);
      if (this.profile == null) {
        throw new WebDriverException(String.format(
            "Firefox profile '%s' named in system property '%s' not found",
            profileName, FirefoxDriver.SystemProperty.BROWSER_PROFILE));
      }
    }
  }

  public FirefoxOptions(Capabilities source) {
    this();

    if (source == null) {
      return;
    }

    Object rawOptions = source.getCapability(FIREFOX_OPTIONS);
    if (rawOptions != null) {
      if (rawOptions instanceof Map) {
        try {
          @SuppressWarnings("unchecked")
          Map<String, Object> map = (Map<String, Object>) rawOptions;
          amend(map);
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      } else if (rawOptions instanceof FirefoxOptions) {
        amend((FirefoxOptions) rawOptions);
      } else {
        throw new WebDriverException(
            "Firefox option was set, but is not a FirefoxOption or a Map: " + rawOptions);
      }
    }

    validateAndAmendUsing(desiredCapabilities, source);
  }

  public FirefoxOptions setLegacy(boolean legacy) {
    this.legacy = legacy;
    desiredCapabilities.setCapability(MARIONETTE, !legacy);
    return this;
  }

  public boolean isLegacy() {
    return legacy;
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
    this.binaryPath = toForwardSlashes(path);
    this.actualBinary = null;
    if (Files.exists(path)) {
      desiredCapabilities.setCapability(BINARY, new FirefoxBinary(path.toFile()));
    }
    return this;
  }

  private String toForwardSlashes(Path path) {
    return Preconditions.checkNotNull(path).toString().replace('\\', '/');
  }

  public FirefoxOptions setBinary(String path) {
    return setBinary(Paths.get(checkNotNull(path)));
  }

  /**
   * Constructs a {@link FirefoxBinary} and returns that to be used, and because of this is only
   * useful when actually starting firefox.
   */
  public FirefoxBinary getBinary() {
    return getBinaryOrNull().orElseGet(FirefoxBinary::new);
  }

  public Optional<FirefoxBinary> getBinaryOrNull() {
    if (actualBinary != null) {
      return Optional.of(actualBinary);
    }
    if (binaryPath != null) {
      return Optional.of(new FirefoxBinary(new File(binaryPath)));
    }

    return Stream.of(desiredCapabilities)
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
      FirefoxBinary.Channel channel = FirefoxBinary.Channel.fromString(String.valueOf(rawVersion));
      return Optional.of(new FirefoxBinary(channel));
    }

    return Optional.empty();
  }

  public FirefoxOptions setProfile(FirefoxProfile profile) {
    this.profile = profile;

    if (!booleanPrefs.isEmpty() || !intPrefs.isEmpty() || !stringPrefs.isEmpty()) {
      LOG.info("Will update profile with preferences from these options.");
      booleanPrefs.forEach(profile::setPreference);
      intPrefs.forEach(profile::setPreference);
      stringPrefs.forEach(profile::setPreference);
    }

    desiredCapabilities.setCapability(PROFILE, profile);

    return this;
  }

  public FirefoxProfile getProfile() {
    return getProfileOrNull().orElseGet(() -> fullyPopulateProfile(new FirefoxProfile()));
  }

  @VisibleForTesting
  Optional<FirefoxProfile> getProfileOrNull() {
    FirefoxProfile profileToUse = profile;
    if (profileToUse == null) {
      profileToUse = extractProfile(desiredCapabilities);
    }
    if (profileToUse == null) {
      return Optional.empty();
    }

    return Optional.of(fullyPopulateProfile(profileToUse));
  }

  private FirefoxProfile fullyPopulateProfile(FirefoxProfile profile) {
    populateProfile(profile, desiredCapabilities);

    booleanPrefs.forEach(profile::setPreference);
    intPrefs.forEach(profile::setPreference);
    stringPrefs.forEach(profile::setPreference);

    return profile;
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

  public FirefoxOptions setPageLoadStrategy(PageLoadStrategy strategy) {
    desiredCapabilities.setCapability(PAGE_LOAD_STRATEGY, strategy);
    return this;
  }

  public FirefoxOptions setUnhandledPromptBehaviour(UnexpectedAlertBehaviour behaviour) {
    desiredCapabilities.setCapability(UNHANDLED_PROMPT_BEHAVIOUR, behaviour);
    return this;
  }

  /**
   * @deprecated Use {@link #addCapabilities(Capabilities)}
   */
  @Deprecated
  public FirefoxOptions addDesiredCapabilities(Capabilities desiredCapabilities) {
    return addCapabilities(desiredCapabilities);
  }

  /**
   * @deprecated Use {@link #addCapabilities(Capabilities)}
   */
  @Deprecated
  public FirefoxOptions addRequiredCapabilities(Capabilities requiredCapabilities) {
    return addCapabilities(requiredCapabilities);
  }

  public FirefoxOptions addCapabilities(Capabilities capabilities) {
    return validateAndAmendUsing(this.desiredCapabilities, capabilities);
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

    Object rawMarionette = existing.getCapability(MARIONETTE);
    if (rawMarionette instanceof Boolean) {
      setLegacy(!(Boolean) rawMarionette);
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

  /**
   * @deprecated Use {@link #toCapabilities()}.
   */
  public Capabilities toDesiredCapabilities() {
    return toCapabilities();
  }

  /**
   * @deprecated Use {@link #toCapabilities()}.
   */
  public Capabilities toRequiredCapabilities() {
    return toCapabilities();
  }

  public Capabilities toCapabilities() {
    HashMap<String, Object> caps = new HashMap<>(desiredCapabilities.asMap());

    if (isLegacy()) {
      caps.put(FirefoxDriver.MARIONETTE, false);
    }

    Object priorBinary = desiredCapabilities.getCapability(BINARY);
    if (priorBinary instanceof Path) {
      // Again, unix-style path
      priorBinary = toForwardSlashes((Path) priorBinary);
    }
    if (priorBinary instanceof String) {
      priorBinary = toForwardSlashes(Paths.get((String) priorBinary));
    }
    if (priorBinary instanceof FirefoxBinary) {
      priorBinary = toForwardSlashes(((FirefoxBinary) priorBinary).getFile().toPath());
    }

    if ((actualBinary != null && !actualBinary.getFile().toPath().equals(priorBinary)) ||
        (binaryPath != null && !binaryPath.equals(priorBinary))) {
      LOG.info(String.format(
          "Preferring the firefox binary in these options (%s rather than %s)",
          actualBinary != null ? actualBinary.getPath() : binaryPath,
          priorBinary));
    }
    if (actualBinary != null && binaryPath == null) {
      caps.put(BINARY, actualBinary);
    } else if (binaryPath != null && actualBinary == null) {
      if (Files.exists(Paths.get(binaryPath))) {
        caps.put(BINARY, new FirefoxBinary(new File(binaryPath)));
      }
    }

    Object priorProfile = desiredCapabilities.getCapability(PROFILE);
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
    caps.put(FIREFOX_OPTIONS, this);

    if (actualBinary != null) {
      actualBinary.addCommandLineOptions(args.toArray(new String[args.size()]));
      caps.put(BINARY, actualBinary);
    }
    if (binaryPath != null) {
      caps.put(BINARY, binaryPath);
    }

    if (profile != null) {
      caps.put(PROFILE, profile);
    }

    return new ImmutableCapabilities(caps);
  }

  public DesiredCapabilities addTo(DesiredCapabilities capabilities) {
    return capabilities.merge(toCapabilities());
  }

  public Map<String, Object> toJson() throws IOException {
    ImmutableMap.Builder<String, Object> options = ImmutableMap.builder();

    if (actualBinary != null) {
      options.put("binary", actualBinary.getPath());
    } else if (binaryPath != null) {
      options.put("binary", binaryPath);
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
      options.put("profile", profile.toJson());
    } else {
      ImmutableMap.Builder<String, Object> allPrefs = ImmutableMap.builder();
      allPrefs.putAll(booleanPrefs);
      allPrefs.putAll(intPrefs);
      allPrefs.putAll(stringPrefs);
      options.put("prefs", allPrefs.build());
    }

    if (logLevel != null) {
      options.put("log", ImmutableMap.of("level", logLevelToGeckoLevel()));
    }

    options.put("args", args);

    return options.build();
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
           "binary=" + (actualBinary == null ? binaryPath : actualBinary) + ", " +
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
