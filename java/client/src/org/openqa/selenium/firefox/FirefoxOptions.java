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

import static java.util.Objects.requireNonNull;
import static org.openqa.selenium.firefox.FirefoxDriver.BINARY;
import static org.openqa.selenium.firefox.FirefoxDriver.MARIONETTE;
import static org.openqa.selenium.firefox.FirefoxDriver.PROFILE;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSortedMap;

import org.openqa.selenium.remote.AbstractDriverOptions;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.TreeMap;

/**
 * Manage firefox specific settings in a way that geckodriver can understand.
 * <p>
 * An example of usage:
 * <pre>
 *    FirefoxOptions options = new FirefoxOptions()
 *      .addPreference("browser.startup.page", 1)
 *      .addPreference("browser.startup.homepage", "https://www.google.co.uk");
 *    WebDriver driver = new FirefoxDriver(options);
 * </pre>
 */
public class FirefoxOptions extends AbstractDriverOptions<FirefoxOptions> {

  public final static String FIREFOX_OPTIONS = "moz:firefoxOptions";

  private List<String> args = new ArrayList<>();
  private Map<String, Object> preferences = new HashMap<>();
  private FirefoxDriverLogLevel logLevel;
  private Binary binary;
  private boolean legacy;
  private FirefoxProfile profile;

  public FirefoxOptions() {
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
        throw new WebDriverException(String.format(
            "Firefox profile '%s' named in system property '%s' not found",
            profileName, FirefoxDriver.SystemProperty.BROWSER_PROFILE));
      }
      setProfile(profile);
    }

    String forceMarionette = System.getProperty(FirefoxDriver.SystemProperty.DRIVER_USE_MARIONETTE);
    if (forceMarionette != null) {
      setLegacy(!Boolean.getBoolean(FirefoxDriver.SystemProperty.DRIVER_USE_MARIONETTE));
    }

    setCapability(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX);
    setAcceptInsecureCerts(true);
  }

  public FirefoxOptions(Capabilities source) {
    // We need to initialize all our own fields before calling.
    super();
    source.asMap().forEach((key, value)-> {
      if (value != null) {
        setCapability(key, value);
      }
    });

    // If `source` has options, we need to mirror those into this instance. This may be either a
    // Map (if we're constructing from a serialized instance) or another FirefoxOptions. *sigh*
    Object raw = source.getCapability(FIREFOX_OPTIONS);
    if (raw == null) {
      return;
    }

    if (raw instanceof FirefoxOptions) {
      FirefoxOptions that = (FirefoxOptions) raw;

      addArguments(that.args);
      that.preferences.forEach(this::addPreference);
      setLegacy(that.legacy);

      if (that.logLevel != null) { setLogLevel(that.logLevel); }
      if (that.binary != null) { setCapability(BINARY, that.binary.asCapability()); }

      if (that.profile != null) { setProfile(that.profile); }
    } else if (raw instanceof Map) {
      Map<?, ?> that = (Map<?, ?>) raw;
      if (that.containsKey("args")) {
        Object value = that.get("args");
        if (value instanceof String) {
          addArguments((String) that.get("args"));
        } else if (value instanceof List<?>) {
          addArguments((List<String>) that.get("args"));
        } else {
          // last resort
          addArguments(that.get("args").toString());
        }
      }
      if (that.containsKey("prefs")) {
        Map<String, Object> prefs = (Map<String, Object>) that.get("prefs");
        preferences.putAll(prefs);
      }
      if (that.containsKey("binary")) { setBinary((String) that.get("binary")); }
      if (that.containsKey("log")) {
        Map<?, ?> logStruct = (Map<?, ?>) that.get("log");
        Object rawLevel = logStruct.get("level");
        if (rawLevel instanceof String) {
          setLogLevel(FirefoxDriverLogLevel.fromString((String) rawLevel));
        } else if (rawLevel instanceof FirefoxDriverLogLevel) {
          setLogLevel((FirefoxDriverLogLevel) rawLevel);
        }
      }
      if (that.containsKey("profile")) {
        Object value = that.get("profile");
        if (value instanceof String) {
          try {
            setProfile(FirefoxProfile.fromJson((String) value));
          } catch (IOException e) {
            throw new WebDriverException(e);
          }
        } else if (value instanceof FirefoxProfile) {
          setProfile((FirefoxProfile) value);
        } else {
          throw new WebDriverException(
              "In FirefoxOptions, don't know how to convert profile: " + that);
        }
      }
    }
  }

  public FirefoxOptions setLegacy(boolean legacy) {
    setCapability(MARIONETTE, !legacy);
    return this;
  }

  public boolean isLegacy() {
    return legacy;
  }

  public FirefoxOptions setBinary(FirefoxBinary binary) {
    setCapability(BINARY, binary);
    return this;
  }

  public FirefoxOptions setBinary(Path path) {
    setCapability(BINARY, path);
    return this;
  }

  public FirefoxOptions setBinary(String path) {
    setCapability(BINARY, path);
    return this;
  }

  /**
   * Constructs a {@link FirefoxBinary} and returns that to be used, and because of this is only
   * useful when actually starting firefox.
   */
  public FirefoxBinary getBinary() {
    return getBinaryOrNull().orElseGet(FirefoxBinary::new);
  }

  public Optional<FirefoxBinary> getBinaryOrNull() {
    return Optional.ofNullable(binary).map(Binary::asBinary);
  }

  public FirefoxOptions setProfile(FirefoxProfile profile) {
    setCapability(FirefoxDriver.PROFILE, profile);
    return this;
  }

  public FirefoxProfile getProfile() {
    return profile;
  }

  public FirefoxOptions addArguments(String... arguments) {
    addArguments(ImmutableList.copyOf(arguments));
    return this;
  }

  public FirefoxOptions addArguments(List<String> arguments) {
    args.addAll(arguments);
    return this;
  }

  public FirefoxOptions addPreference(String key, Object value) {
    preferences.put(requireNonNull(key), value);
    return this;
  }

  public FirefoxOptions setLogLevel(FirefoxDriverLogLevel logLevel) {
    this.logLevel = Objects.requireNonNull(logLevel, "Log level must be set");
    return this;
  }

  public FirefoxOptions setHeadless(boolean headless) {
    args.remove("-headless");
    if (headless) {
      args.add("-headless");
    }
    return this;
  }

  @Override
  public void setCapability(String key, Object value) {
    switch (key) {
      case BINARY:
        binary = new Binary(requireNonNull(value, "Binary value cannot be null"));
        value = binary.asCapability();
        break;

      case MARIONETTE:
        if (value instanceof Boolean) {
          legacy = !(Boolean) value;
        }
        break;

      case PROFILE:
        if (value instanceof FirefoxProfile) {
          profile = (FirefoxProfile) value;
        } else if (value instanceof String) {
          try {
            profile = FirefoxProfile.fromJson((String) value);
          } catch (IOException e) {
            throw new WebDriverException(e);
          }
          value = profile;
        } else {
          throw new WebDriverException("Unexpected value for profile: " + value);
        }
        break;

      default:
        // Do nothing
    }
    super.setCapability(key, value);
  }

  @Override
  public Map<String, Object> asMap() {
    TreeMap<String, Object> toReturn = new TreeMap<>(super.asMap());

    ImmutableSortedMap.Builder<String, Object> w3cOptions = ImmutableSortedMap.naturalOrder();
    w3cOptions.put("args", args);

    if (binary != null) {
      w3cOptions.put("binary", binary.asPath());
    }

    if (logLevel != null) {
      w3cOptions.put("log", ImmutableMap.of("level", logLevel));
    }

    if (profile != null) {
      preferences.forEach(profile::setPreference);
      try {
        w3cOptions.put("profile", profile.toJson());
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    } else {
      w3cOptions.put("prefs", new HashMap<>(preferences));
    }

    toReturn.put(FIREFOX_OPTIONS, w3cOptions.build());

    return toReturn;
  }

  @Override
  public FirefoxOptions merge(Capabilities capabilities) {
    super.merge(capabilities);
    return this;
  }

  @Override
  protected int amendHashCode() {
    return Objects.hash(
        args,
        preferences,
        logLevel,
        binary,
        legacy,
        profile);
  }

  private class Binary {
    private String path;
    private FirefoxBinary binary;

    public Binary(Object value) {
      if (value instanceof FirefoxBinary) {
        this.binary = (FirefoxBinary) value;
        binary.amendOptions(FirefoxOptions.this);
        return;
      }

      if (value instanceof Path || value instanceof String) {
        this.path = value.toString().replace('\\', '/');
        return;
      }

      throw new IllegalArgumentException("Unrecognised type for binary: " + value);
    }

    FirefoxBinary asBinary() {
      return binary == null ? new FirefoxBinary(new File(path)) : binary;
    }

    Object asCapability() {
      return binary == null ? path : binary;
    }

    String asPath() {
      return binary == null ? path : binary.getPath();
    }

    @Override
    public boolean equals(Object o) {
      if (this == o) {
        return true;
      }

      if (!(o instanceof Binary)) {
        return false;
      }

      Binary that = (Binary) o;
      return Objects.equals(this.path, that.path) &&
             Objects.equals(this.binary, that.binary);
    }

    @Override
    public int hashCode() {
      return Objects.hash(path, binary);
    }
  }
}
