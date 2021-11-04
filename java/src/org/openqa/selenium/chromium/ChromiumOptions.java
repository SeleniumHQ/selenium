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

package org.openqa.selenium.chromium;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AbstractDriverOptions;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Stream;

import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;
import static java.util.stream.Collectors.toList;

/**
 * Class to manage options specific to {@link ChromiumDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * ChromeOptions options = new ChromeOptions()
 * options.addExtensions(new File("/path/to/extension.crx"))
 * options.setBinary(new File("/path/to/chrome"));
 *
 * // For use with ChromeDriver:
 * ChromeDriver driver = new ChromeDriver(options);
 *
 * // For use with RemoteWebDriver:
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/"),
 *     new ChromeOptions());
 * </code></pre>
 *
 * @since Since chromedriver v17.0.963.0
 */
public class ChromiumOptions<T extends ChromiumOptions<?>> extends AbstractDriverOptions<ChromiumOptions<?>> {

  private String binary;
  private final List<String> args = new ArrayList<>();
  private final List<File> extensionFiles = new ArrayList<>();
  private final List<String> extensions = new ArrayList<>();
  private final Map<String, Object> experimentalOptions = new HashMap<>();
  private Map<String, Object> androidOptions = new HashMap<>();

  private final String capabilityName;

  public ChromiumOptions(String capabilityType, String browserType, String capability) {
    this.capabilityName = capability;
    setCapability(capabilityType, browserType);
  }

  /**
   * Sets the path to the Chrome executable. This path should exist on the
   * machine which will launch Chrome. The path should either be absolute or
   * relative to the location of running ChromeDriver server.
   *
   * @param path Path to Chrome executable.
   */
  public T setBinary(File path) {
    binary = Require.nonNull("Path to the chrome executable", path).getPath();
    return (T) this;
  }

  /**
   * Sets the path to the Chrome executable. This path should exist on the
   * machine which will launch Chrome. The path should either be absolute or
   * relative to the location of running ChromeDriver server.
   *
   * @param path Path to Chrome executable.
   */
  public T setBinary(String path) {
    binary = Require.nonNull("Path to the chrome executable", path);
    return (T) this;
  }

  /**
   * @param arguments The arguments to use when starting Chrome.
   * @see #addArguments(List)
   */
  public T addArguments(String... arguments) {
    addArguments(Arrays.asList(arguments));
    return (T) this;
  }

  /**
   * Adds additional command line arguments to be used when starting Chrome.
   * For example:
   * <pre><code>
   *   options.setArguments(
   *       "load-extension=/path/to/unpacked_extension",
   *       "allow-outdated-plugins");
   * </code></pre>
   *
   * <p>Each argument may contain an option "--" prefix: "--foo" or "foo".
   * Arguments with an associated value should be delimited with an "=":
   * "foo=bar".
   *
   * @param arguments The arguments to use when starting Chrome.
   */
  public T addArguments(List<String> arguments) {
    args.addAll(arguments);
    return (T) this;
  }

  /**
   * @param paths Paths to the extensions to install.
   * @see #addExtensions(List)
   */
  public T addExtensions(File... paths) {
    addExtensions(Arrays.asList(paths));
    return (T) this;
  }

  /**
   * Adds a new Chrome extension to install on browser startup. Each path should
   * specify a packed Chrome extension (CRX file).
   *
   * @param paths Paths to the extensions to install.
   */
  public T addExtensions(List<File> paths) {
    paths.forEach(path -> Require.argument("Extension", path).isFile());
    extensionFiles.addAll(paths);
    return (T) this;
  }

  /**
   * @param encoded Base64 encoded data of the extensions to install.
   * @see #addEncodedExtensions(List)
   */
  public T addEncodedExtensions(String... encoded) {
    addEncodedExtensions(Arrays.asList(encoded));
    return (T) this;
  }

  /**
   * Adds a new Chrome extension to install on browser startup. Each string data should
   * specify a Base64 encoded string of packed Chrome extension (CRX file).
   *
   * @param encoded Base64 encoded data of the extensions to install.
   */
  public T addEncodedExtensions(List<String> encoded) {
    for (String extension : encoded) {
      Require.nonNull("Encoded extension", extension);
    }
    extensions.addAll(encoded);
    return (T) this;
  }

  /**
   * Sets an experimental option. Useful for new ChromeDriver options not yet
   * exposed through the {@link ChromiumOptions} API.
   *
   * @param name Name of the experimental option.
   * @param value Value of the experimental option, which must be convertible
   *     to JSON.
   */
  public T setExperimentalOption(String name, Object value) {
    experimentalOptions.put(Require.nonNull("Option name", name), value);
    return (T) this;
  }

  public T setHeadless(boolean headless) {
    args.remove("--headless");
    if (headless) {
      args.add("--headless");
    }
    return (T) this;
  }

  public T setAndroidPackage(String androidPackage) {
    Require.nonNull("Android package", androidPackage);
    return setAndroidCapability("androidPackage", androidPackage);
  }

  public T setAndroidActivity(String activity) {
    Require.nonNull("Android activity", activity);
    return setAndroidCapability("androidActivity", activity);
  }

  public T setAndroidDeviceSerialNumber(String serial) {
    Require.nonNull("Android device serial number", serial);
    return setAndroidCapability("androidDeviceSerial", serial);
  }

  public T setUseRunningAndroidApp(boolean useIt) {
    return setAndroidCapability("androidUseRunningApp", useIt);
  }

  /**
   * Process name of the Activity hosting the WebView (as given by ps).
   * If not set, the process name is assumed to be the same as androidPackage.
   */
  public T setAndroidProcess(String processName) {
    Require.nonNull("Android process name", processName);
    return setAndroidCapability("androidProcess", processName);
  }

  private T setAndroidCapability(String name, Object value) {
    Require.nonNull("Name", name);
    Require.nonNull("Value", value);
    Map<String, Object> newOptions = new TreeMap<>(androidOptions);
    newOptions.put(name, value);
    androidOptions = Collections.unmodifiableMap(newOptions);
    return (T) this;
  }

  @Override
  protected Set<String> getExtraCapabilityNames() {
    return Collections.singleton(capabilityName);
  }

  @Override
  protected Object getExtraCapability(String capabilityName) {
    Require.nonNull("Capability name", capabilityName);
    if (!this.capabilityName.equals(capabilityName)) {
      return null;
    }

    Map<String, Object> options = new TreeMap<>();
    experimentalOptions.forEach(options::put);

    if (binary != null) {
      options.put("binary", binary);
    }

    options.put("args", unmodifiableList(new ArrayList<>(args)));

    options.put(
      "extensions",
      unmodifiableList(Stream.concat(
        extensionFiles.stream()
          .map(file -> {
            try {
              return Base64.getEncoder().encodeToString(Files.readAllBytes(file.toPath()));
            } catch (IOException e) {
              throw new SessionNotCreatedException(e.getMessage(), e);
            }
          }),
        extensions.stream()
      ).collect(toList())));

    options.putAll(androidOptions);

    return unmodifiableMap(options);
  }

  protected void mergeInPlace(Capabilities capabilities) {
    Require.nonNull("Capabilities to merge", capabilities);

    capabilities.getCapabilityNames().forEach(name -> setCapability(name, capabilities.getCapability(name)));
    if (capabilities instanceof ChromiumOptions) {
      ChromiumOptions<?> options = (ChromiumOptions<?>) capabilities;
      for (String arg : options.args) {
        if (!args.contains(arg)) {
          addArguments(arg);
        }
      }
      addExtensions(options.extensionFiles);
      addEncodedExtensions(options.extensions);
      if (options.binary != null) {
        setBinary(options.binary);
      }
      options.experimentalOptions.forEach(this::setExperimentalOption);
    }
  }
}
