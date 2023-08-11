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

import static java.util.stream.Collectors.toMap;
import static org.openqa.selenium.remote.Browser.FIREFOX;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AbstractDriverOptions;
import org.openqa.selenium.remote.CapabilityType;

/**
 * Manage firefox specific settings in a way that geckodriver can understand.
 *
 * <p>An example of usage:
 *
 * <pre>
 *    FirefoxOptions options = new FirefoxOptions()
 *      .addPreference("browser.startup.page", 1)
 *      .addPreference("browser.startup.homepage", "https://www.google.co.uk");
 *    WebDriver driver = new FirefoxDriver(options);
 * </pre>
 */
public class FirefoxOptions extends AbstractDriverOptions<FirefoxOptions> {

  public static final String FIREFOX_OPTIONS = "moz:firefoxOptions";

  private Map<String, Object> firefoxOptions = Collections.unmodifiableMap(new TreeMap<>());

  public FirefoxOptions() {
    setCapability(CapabilityType.BROWSER_NAME, FIREFOX.browserName());
    setAcceptInsecureCerts(true);
    setCapability("moz:debuggerAddress", true);
  }

  public FirefoxOptions(Capabilities source) {
    // We need to initialize all our own fields before calling.
    this();

    source.getCapabilityNames().stream()
        .filter(name -> !FIREFOX_OPTIONS.equals(name))
        .forEach(
            name -> {
              Object value = source.getCapability(name);
              if (value != null) {
                setCapability(name, value);
              }
            });

    // If `source` is an instance of FirefoxOptions, we need to mirror those into this instance.
    if (source instanceof FirefoxOptions) {
      mirror((FirefoxOptions) source);
    } else {
      Object rawOptions = source.getCapability(FIREFOX_OPTIONS);
      if (rawOptions != null) {
        // If `source` contains the keys we care about, then make sure they're good.
        Require.stateCondition(
            rawOptions instanceof Map, "Expected options to be a map: %s", rawOptions);
        @SuppressWarnings("unchecked")
        Map<String, Object> sourceOptions = (Map<String, Object>) rawOptions;
        Map<String, Object> options = new TreeMap<>();
        for (Keys key : Keys.values()) {
          key.amend(sourceOptions, options);
        }

        this.firefoxOptions = Collections.unmodifiableMap(options);
      }
    }
  }

  private void mirror(FirefoxOptions that) {
    Map<String, Object> newOptions = new TreeMap<>(firefoxOptions);

    for (Keys key : Keys.values()) {
      Object value = key.mirror(firefoxOptions, that.firefoxOptions);
      if (value != null) {
        newOptions.put(key.key(), value);
      }
    }

    this.firefoxOptions = Collections.unmodifiableMap(newOptions);
  }

  /**
   * Configures the following:
   *
   * <dl>
   *   <dt>Binary
   *   <dd>{@code webdriver.firefox.bin} - the path to the firefox binary
   *   <dt>Firefox profile
   *   <dd>{@code webdriver.firefox.profile} - a named firefox profile
   * </dl>
   */
  public FirefoxOptions configureFromEnv() {
    // Read system properties and use those if they are set, allowing users to override them later
    // should they want to.

    String binary = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_BINARY);
    if (binary != null) {
      setBinary(binary);
    }

    String profileName = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_PROFILE);
    if (profileName != null) {
      FirefoxProfile profile = new ProfilesIni().getProfile(profileName);
      if (profile == null) {
        throw new WebDriverException(
            String.format(
                "Firefox profile '%s' named in system property '%s' not found",
                profileName, FirefoxDriver.SystemProperty.BROWSER_PROFILE));
      }
      setProfile(profile);
    }

    return this;
  }

  /**
   * Constructs a {@link FirefoxBinary} and returns that to be used, and because of this is only
   * useful when actually starting firefox.
   */
  public FirefoxBinary getBinary() {
    return getBinaryOrNull().orElseGet(FirefoxBinary::new);
  }

  public FirefoxOptions setBinary(FirefoxBinary binary) {
    Require.nonNull("Binary", binary);
    addArguments(binary.getExtraOptions());
    return setFirefoxOption(Keys.BINARY, binary.getPath());
  }

  public FirefoxOptions setBinary(Path path) {
    Require.nonNull("Binary", path);
    return setFirefoxOption(Keys.BINARY, path.toString());
  }

  public FirefoxOptions setBinary(String path) {
    Require.nonNull("Binary", path);
    return setFirefoxOption(Keys.BINARY, path);
  }

  public Optional<FirefoxBinary> getBinaryOrNull() {
    Object binary = firefoxOptions.get(Keys.BINARY.key());
    if (!(binary instanceof String)) {
      return Optional.empty();
    }

    FirefoxBinary toReturn = new FirefoxBinary(new File((String) binary));
    Object rawArgs = firefoxOptions.getOrDefault(Keys.ARGS.key(), new ArrayList<>());
    Require.stateCondition(rawArgs instanceof List, "Arguments are not a list: %s", rawArgs);

    ((List<?>) rawArgs)
        .stream()
            .filter(Objects::nonNull)
            .map(String::valueOf)
            .forEach(toReturn::addCommandLineOptions);

    return Optional.of(toReturn);
  }

  public FirefoxProfile getProfile() {
    Object rawProfile = firefoxOptions.get(Keys.PROFILE.key());
    if (rawProfile == null) {
      return new FirefoxProfile();
    }

    if (rawProfile instanceof FirefoxProfile) {
      return (FirefoxProfile) rawProfile;
    }

    try {
      return FirefoxProfile.fromJson((String) rawProfile);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public FirefoxOptions setProfile(FirefoxProfile profile) {
    Require.nonNull("Profile", profile);

    try {
      return setFirefoxOption(Keys.PROFILE, profile.toJson());
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  public FirefoxOptions addArguments(String... arguments) {
    addArguments(Arrays.asList(arguments));
    return this;
  }

  public FirefoxOptions addArguments(List<String> arguments) {
    Require.nonNull("Arguments", arguments);

    Object rawList = firefoxOptions.getOrDefault(Keys.ARGS.key(), new ArrayList<>());
    Require.stateCondition(rawList instanceof List, "Arg list of unexpected type: %s", rawList);

    List<String> newArgs = new ArrayList<>();
    ((List<?>) rawList).stream().map(String::valueOf).forEach(newArgs::add);
    newArgs.addAll(arguments);

    return setFirefoxOption(Keys.ARGS, Collections.unmodifiableList(newArgs));
  }

  public FirefoxOptions addPreference(String key, Object value) {
    Require.nonNull("Key", key);
    Require.nonNull("Value", value);

    Object rawPrefs = firefoxOptions.getOrDefault(Keys.PREFS.key(), new HashMap<>());
    Require.stateCondition(rawPrefs instanceof Map, "Prefs are of unexpected type: %s", rawPrefs);

    @SuppressWarnings("unchecked")
    Map<String, Object> prefs = (Map<String, Object>) rawPrefs;
    Map<String, Object> newPrefs = new TreeMap<>(prefs);
    newPrefs.put(key, value);

    return setFirefoxOption(Keys.PREFS, Collections.unmodifiableMap(newPrefs));
  }

  public FirefoxOptions setLogLevel(FirefoxDriverLogLevel logLevel) {
    Require.nonNull("Log level", logLevel);
    return setFirefoxOption(Keys.LOG, logLevel.toJson());
  }

  /**
   * @deprecated Use {@link #addArguments(String...)}. Example: `addArguments("-headless")`.
   */
  @Deprecated
  public FirefoxOptions setHeadless(boolean headless) {
    Object rawArgs = firefoxOptions.getOrDefault(Keys.ARGS.key(), new ArrayList<>());
    Require.stateCondition(rawArgs instanceof List, "Arg list of unexpected type: %s", rawArgs);

    List<String> newArgs = new ArrayList<>();
    ((List<?>) rawArgs)
        .stream()
            .map(String::valueOf)
            .filter(arg -> !"-headless".equals(arg))
            .forEach(newArgs::add);

    if (headless) {
      newArgs.add("-headless");
    }
    return setFirefoxOption(Keys.ARGS, Collections.unmodifiableList(newArgs));
  }

  public FirefoxOptions setAndroidPackage(String androidPackage) {
    Require.nonNull("Android package", androidPackage);
    return setFirefoxOption("androidPackage", androidPackage);
  }

  public FirefoxOptions setAndroidActivity(String activity) {
    Require.nonNull("Android activity", activity);
    return setFirefoxOption("androidActivity", activity);
  }

  public FirefoxOptions setAndroidDeviceSerialNumber(String serial) {
    Require.nonNull("Android device serial number", serial);
    return setFirefoxOption("androidDeviceSerial", serial);
  }

  public FirefoxOptions setAndroidIntentArguments(String[] args) {
    Require.nonNull("Android intent arguments", args);
    return setAndroidIntentArguments(Arrays.asList(args));
  }

  public FirefoxOptions setAndroidIntentArguments(List<String> args) {
    Require.nonNull("Android intent arguments", args);
    return setFirefoxOption("androidIntentArguments", args);
  }

  private FirefoxOptions setFirefoxOption(Keys key, Object value) {
    return setFirefoxOption(key.key(), value);
  }

  private FirefoxOptions setFirefoxOption(String key, Object value) {
    Require.nonNull("Key", key);
    Require.nonNull("Value", value);

    Map<String, Object> newOptions = new TreeMap<>(firefoxOptions);
    newOptions.put(key, value);
    firefoxOptions = Collections.unmodifiableMap(newOptions);
    return this;
  }

  @Override
  protected Set<String> getExtraCapabilityNames() {
    Set<String> names = new TreeSet<>();

    names.add(FIREFOX_OPTIONS);

    return Collections.unmodifiableSet(names);
  }

  @Override
  protected Object getExtraCapability(String capabilityName) {
    Require.nonNull("Capability name", capabilityName);

    if (FIREFOX_OPTIONS.equals(capabilityName)) {
      return Collections.unmodifiableMap(firefoxOptions);
    }
    return null;
  }

  @Override
  public FirefoxOptions merge(Capabilities capabilities) {
    Require.nonNull("Capabilities to merge", capabilities);
    FirefoxOptions newInstance = new FirefoxOptions();
    getCapabilityNames().forEach(name -> newInstance.setCapability(name, getCapability(name)));
    newInstance.mirror(this);

    for (String name : capabilities.getCapabilityNames()) {

      if (!name.equals(Keys.ARGS.key)
          && !name.equals(Keys.PREFS.key)
          && !name.equals(Keys.PROFILE.key)
          && !name.equals(Keys.BINARY.key)
          && !name.equals(Keys.LOG.key)) {
        newInstance.setCapability(name, capabilities.getCapability(name));
      }

      if (name.equals(Keys.ARGS.key) && capabilities.getCapability(name) != null) {
        List<String> arguments = (List<String>) (capabilities.getCapability(("args")));
        arguments.forEach(
            arg -> {
              if (!((List<String>) newInstance.firefoxOptions.get(Keys.ARGS.key())).contains(arg)) {
                newInstance.addArguments(arg);
              }
            });
      }

      if (name.equals(Keys.PREFS.key) && capabilities.getCapability(name) != null) {
        Map<String, Object> prefs = (Map<String, Object>) (capabilities.getCapability(("prefs")));
        prefs.forEach(newInstance::addPreference);
      }

      if (name.equals(Keys.PROFILE.key) && capabilities.getCapability(name) != null) {
        String rawProfile = (String) capabilities.getCapability("profile");
        try {
          newInstance.setProfile(FirefoxProfile.fromJson(rawProfile));
        } catch (IOException e) {
          throw new WebDriverException(e);
        }
      }

      if (name.equals(Keys.BINARY.key) && capabilities.getCapability(name) != null) {
        Object binary = capabilities.getCapability("binary");
        if (binary instanceof String) {
          newInstance.setBinary((String) binary);
        } else if (binary instanceof Path) {
          newInstance.setBinary((Path) binary);
        } else if (binary instanceof FirefoxBinary) {
          newInstance.setBinary((FirefoxBinary) binary);
        }
      }

      if (name.equals(Keys.LOG.key) && capabilities.getCapability(name) != null) {
        Map<String, Object> logLevelMap = (Map<String, Object>) capabilities.getCapability("log");
        FirefoxDriverLogLevel logLevel =
            FirefoxDriverLogLevel.fromString((String) logLevelMap.get("level"));
        if (logLevel != null) {
          newInstance.setLogLevel(logLevel);
        }
      }
    }

    if (capabilities instanceof FirefoxOptions) {
      newInstance.mirror((FirefoxOptions) capabilities);
    } else {
      Object optionsValue = capabilities.getCapability(FIREFOX_OPTIONS);

      if (optionsValue instanceof Map) {
        @SuppressWarnings("unchecked")
        Map<String, Object> options = (Map<String, Object>) optionsValue;

        @SuppressWarnings("unchecked")
        List<String> arguments = (List<String>) (options.getOrDefault("args", new ArrayList<>()));
        @SuppressWarnings("unchecked")
        Map<String, Object> prefs =
            (Map<String, Object>) options.getOrDefault("prefs", new HashMap<>());
        String rawProfile = (String) options.get("profile");
        @SuppressWarnings("unchecked")
        Map<String, Object> logLevelMap =
            (Map<String, Object>) options.getOrDefault("log", new HashMap<>());
        FirefoxDriverLogLevel logLevel =
            FirefoxDriverLogLevel.fromString((String) logLevelMap.get("level"));

        arguments.forEach(
            arg -> {
              if (!((List<String>) newInstance.firefoxOptions.get(Keys.ARGS.key())).contains(arg)) {
                newInstance.addArguments(arg);
              }
            });

        Object binary = options.get("binary");
        if (binary instanceof String) {
          newInstance.setBinary((String) binary);
        } else if (binary instanceof Path) {
          newInstance.setBinary((Path) binary);
        } else if (binary instanceof FirefoxBinary) {
          newInstance.setBinary((FirefoxBinary) binary);
        }

        prefs.forEach(newInstance::addPreference);

        if (rawProfile != null) {
          try {
            newInstance.setProfile(FirefoxProfile.fromJson(rawProfile));
          } catch (IOException e) {
            throw new WebDriverException(e);
          }
        }

        if (logLevel != null) {
          newInstance.setLogLevel(logLevel);
        }
      }
    }

    return newInstance;
  }

  private enum Keys {
    ANDROID_PACKAGE("androidPackage") {
      @Override
      public void amend(Map<String, Object> sourceOptions, Map<String, Object> toAmend) {}

      @Override
      public Object mirror(Map<String, Object> first, Map<String, Object> second) {
        return null;
      }
    },
    ARGS("args") {
      @Override
      public void amend(Map<String, Object> sourceOptions, Map<String, Object> toAmend) {
        Object o = sourceOptions.get(key());
        if (!(o instanceof List)) {
          return;
        }

        Object rawArgs = toAmend.getOrDefault(key(), new ArrayList<>());
        @SuppressWarnings("unchecked")
        List<String> existingArgs = (List<String>) rawArgs;
        @SuppressWarnings("unchecked")
        List<String> sourceArgs = (List<String>) o;

        List<String> newArgs = new ArrayList<>(existingArgs);
        newArgs.addAll(sourceArgs);

        toAmend.put(key(), Collections.unmodifiableList(new ArrayList<>(newArgs)));
      }

      @Override
      public Object mirror(Map<String, Object> first, Map<String, Object> second) {
        Object rawFirst = first.getOrDefault(key(), new ArrayList<>());
        Require.stateCondition(
            rawFirst instanceof List, "Args are of unexpected type: %s", rawFirst);
        @SuppressWarnings("unchecked")
        List<String> firstList = (List<String>) rawFirst;

        Object rawSecond = second.getOrDefault(key(), new ArrayList<>());
        Require.stateCondition(
            rawSecond instanceof List, "Args are of unexpected type: %s", rawSecond);
        @SuppressWarnings("unchecked")
        List<String> secondList = (List<String>) rawSecond;

        List<String> args = new ArrayList<>(firstList);
        args.addAll(secondList);

        return args.isEmpty() ? null : args;
      }
    },
    BINARY("binary") {
      @Override
      public void amend(Map<String, Object> sourceOptions, Map<String, Object> toAmend) {
        Object o = sourceOptions.get(key());

        if (o instanceof FirefoxBinary) {
          FirefoxBinary binary = (FirefoxBinary) o;
          toAmend.put(key(), binary.getFile().toString());
          ARGS.amend(Collections.singletonMap(ARGS.key(), binary.getExtraOptions()), toAmend);
        } else if (o instanceof String) {
          toAmend.put(key(), o);
        }
      }

      @Override
      public Object mirror(Map<String, Object> first, Map<String, Object> second) {
        Object value = second.get(key());

        if (value == null) {
          value = first.get(key());
        }

        if (value == null) {
          return null;
        }

        Require.stateCondition(value instanceof String, "Unexpected type for binary: %s", value);
        return value;
      }
    },
    ENV("env") {
      @Override
      public void amend(Map<String, Object> sourceOptions, Map<String, Object> toAmend) {
        Object o = sourceOptions.get(key());
        if (o == null) {
          return;
        }

        Require.stateCondition(o instanceof Map, "Unexpected type for env: %s", o);
        Map<String, Object> collected =
            ((Map<?, ?>) o)
                .entrySet().stream()
                    .collect(toMap(entry -> String.valueOf(entry.getKey()), Map.Entry::getValue));

        toAmend.put(key(), Collections.unmodifiableMap(collected));
      }

      @Override
      public Object mirror(Map<String, Object> first, Map<String, Object> second) {
        Object rawFirst = first.getOrDefault(key(), new TreeMap<>());
        Require.stateCondition(
            rawFirst instanceof Map, "Env vars are of unexpected type: %s", rawFirst);
        @SuppressWarnings("unchecked")
        Map<String, String> firstPrefs = (Map<String, String>) rawFirst;

        Object rawSecond = second.getOrDefault(key(), new TreeMap<>());
        Require.stateCondition(
            rawSecond instanceof Map, "Env vars are of unexpected type: %s", rawSecond);
        @SuppressWarnings("unchecked")
        Map<String, String> secondPrefs = (Map<String, String>) rawSecond;

        Map<String, String> value = new TreeMap<>(firstPrefs);
        value.putAll(secondPrefs);

        return value.isEmpty() ? null : value;
      }
    },
    LOG("log") {
      @Override
      public void amend(Map<String, Object> sourceOptions, Map<String, Object> toAmend) {
        Object o = toAmend.get(key());
        if (o == null) {
          return;
        }

        Require.stateCondition(o instanceof Map, "Unexpected type for log: %s", o);
        toAmend.put(key(), o);
      }

      @Override
      public Object mirror(Map<String, Object> first, Map<String, Object> second) {
        Object value = second.get(key());

        if (value == null) {
          value = first.get(key());
        }

        if (value == null) {
          return null;
        }

        Require.stateCondition(value instanceof Map, "Log level is of unexpected type: %s", value);
        return value;
      }
    },
    PREFS("prefs") {
      @Override
      public void amend(Map<String, Object> sourceOptions, Map<String, Object> toAmend) {
        Object o = sourceOptions.get(key());
        if (o == null) {
          return;
        }
        Require.stateCondition(o instanceof Map, "Unexpected type for preferences: %s", o);
        Map<String, Object> collected =
            ((Map<?, ?>) o)
                .entrySet().stream()
                    .collect(toMap(entry -> String.valueOf(entry.getKey()), Map.Entry::getValue));
        toAmend.put(key(), Collections.unmodifiableMap(collected));
      }

      @Override
      public Object mirror(Map<String, Object> first, Map<String, Object> second) {
        Object rawFirst = first.getOrDefault(key(), new TreeMap<>());
        Require.stateCondition(
            rawFirst instanceof Map, "Prefs are of unexpected type: " + rawFirst);
        @SuppressWarnings("unchecked")
        Map<String, Object> firstPrefs = (Map<String, Object>) rawFirst;

        Object rawSecond = second.getOrDefault(key(), new TreeMap<>());
        Require.stateCondition(
            rawSecond instanceof Map, "Prefs are of unexpected type: " + rawSecond);
        @SuppressWarnings("unchecked")
        Map<String, Object> secondPrefs = (Map<String, Object>) rawSecond;

        Map<String, Object> value = new TreeMap<>(firstPrefs);
        value.putAll(secondPrefs);

        return value.isEmpty() ? null : value;
      }
    },
    PROFILE("profile") {
      @Override
      public void amend(Map<String, Object> sourceOptions, Map<String, Object> toAmend) {
        Object o = sourceOptions.get(key());
        if (o == null) {
          return;
        }

        if (o instanceof FirefoxProfile) {
          toAmend.put(key(), o);
          return;
        }

        Require.stateCondition(o instanceof String, "Unexpected type for profile: %s", o);
        toAmend.put(key(), o);
      }

      @Override
      public Object mirror(Map<String, Object> first, Map<String, Object> second) {
        Object value = second.get(key());

        if (value == null) {
          value = first.get(key());
        }

        if (value == null) {
          return null;
        }

        Require.stateCondition(value instanceof String, "Profile is of unexpected type: %s", value);
        return value;
      }
    },
    ;

    private final String key;

    Keys(String key) {
      this.key = key;
    }

    public String key() {
      return key;
    }

    public abstract void amend(Map<String, Object> sourceOptions, Map<String, Object> toAmend);

    public abstract Object mirror(Map<String, Object> first, Map<String, Object> second);
  }
}
