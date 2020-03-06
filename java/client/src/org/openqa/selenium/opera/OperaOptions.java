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

package org.openqa.selenium.opera;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static org.openqa.selenium.remote.BrowserType.OPERA_BLINK;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_NAME;

import com.google.common.collect.ImmutableList;
import com.google.common.io.Files;

import org.openqa.selenium.remote.AbstractDriverOptions;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Class to manage options specific to {@link OperaDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * OperaOptions options = new OperaOptions()
 * options.addExtensions(new File("/path/to/extension.crx"))
 * options.setBinary(new File("/path/to/chrome"));
 *
 * // For use with OperaDriver:
 * OperaDriver driver = new OperaDriver(options);
 *
 * // For use with RemoteWebDriver:
 * OperaOptions options = new OperaOptions();
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/wd/hub"), options);
 * </code></pre>
 */
public class OperaOptions extends AbstractDriverOptions<OperaOptions> {

  /**
   * Key used to store a set of OperaOptions in a {@link org.openqa.selenium.Capabilities}
   * object.
   */
  public static final String CAPABILITY = "operaOptions";

  private String binary;
  private List<String> args = new ArrayList<>();
  private List<File> extensionFiles = new ArrayList<>();
  private List<String> extensions = new ArrayList<>();
  private Map<String, Object> experimentalOptions = new HashMap<>();

  public OperaOptions() {
    setCapability(BROWSER_NAME, OPERA_BLINK);
  }

  @Override
  public OperaOptions merge(Capabilities extraCapabilities) {
    super.merge(extraCapabilities);
    return this;
  }

  /**
   * Sets the path to the Opera executable. This path should exist on the
   * machine which will launch Opera. The path should either be absolute or
   * relative to the location of running OperaDriver server.
   *
   * @param path Path to Opera executable.
   */
  public OperaOptions setBinary(File path) {
    binary = checkNotNull(path).getPath();
    return this;
  }

  /**
   * Sets the path to the Opera executable. This path should exist on the
   * machine which will launch Opera. The path should either be absolute or
   * relative to the location of running OperaDriver server.
   *
   * @param path Path to Opera executable.
   */
  public OperaOptions setBinary(String path) {
    binary = checkNotNull(path);
    return this;
  }

  /**
   * @param arguments The arguments to use when starting Opera.
   * @see #addArguments(java.util.List)
   */
  public OperaOptions addArguments(String... arguments) {
    addArguments(ImmutableList.copyOf(arguments));
    return this;
  }

  /**
   * Adds additional command line arguments to be used when starting Opera.
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
   * @param arguments The arguments to use when starting Opera.
   */
  public OperaOptions addArguments(List<String> arguments) {
    args.addAll(arguments);
    return this;
  }

  /**
   * @param paths Paths to the extensions to install.
   * @see #addExtensions(java.util.List)
   */
  public OperaOptions addExtensions(File... paths) {
    addExtensions(ImmutableList.copyOf(paths));
    return this;
  }

  /**
   * Adds a new Opera extension to install on browser startup. Each path should
   * specify a packed Opera extension (CRX file).
   *
   * @param paths Paths to the extensions to install.
   */
  public OperaOptions addExtensions(List<File> paths) {
    for (File path : paths) {
      checkNotNull(path);
      checkArgument(path.exists(), "%s does not exist", path.getAbsolutePath());
      checkArgument(!path.isDirectory(), "%s is a directory",
          path.getAbsolutePath());
    }
    extensionFiles.addAll(paths);
    return this;
  }

  /**
   * @param encoded Base64 encoded data of the extensions to install.
   * @see #addEncodedExtensions(java.util.List)
   */
  public OperaOptions addEncodedExtensions(String... encoded) {
    addEncodedExtensions(ImmutableList.copyOf(encoded));
    return this;
  }

  /**
   * Adds a new Opera extension to install on browser startup. Each string data should
   * specify a Base64 encoded string of packed Opera extension (CRX file).
   *
   * @param encoded Base64 encoded data of the extensions to install.
   */
  public OperaOptions addEncodedExtensions(List<String> encoded) {
    for (String extension : encoded) {
      checkNotNull(extension);
    }
    extensions.addAll(encoded);
    return this;
  }

  /**
   * Sets an experimental option.  Useful for new OperaDriver options not yet
   * exposed through the {@link OperaOptions} API.
   *
   * @param name Name of the experimental option.
   * @param value Value of the experimental option, which must be convertible
   *     to JSON.
   */
  public OperaOptions setExperimentalOption(String name, Object value) {
    experimentalOptions.put(checkNotNull(name), value);
    return this;
  }

  /**
   * Returns the value of an experimental option.
   *
   * @param name The option name.
   * @return The option value, or {@code null} if not set.
   */
  public Object getExperimentalOption(String name) {
    return experimentalOptions.get(checkNotNull(name));
  }

  @Override
  public Map<String, Object> asMap() {
    Map<String, Object> toReturn = new TreeMap<>(super.asMap());

    Map<String, Object> options = new TreeMap<>();

    for (String key : experimentalOptions.keySet()) {
      options.put(key, experimentalOptions.get(key));
    }

    if (binary != null) {
      options.put("binary", binary);
    }

    options.put("args", ImmutableList.copyOf(args));

    List<String> encoded_extensions = new ArrayList<>(
        extensionFiles.size() + extensions.size());
    for (File path : extensionFiles) {
      try {
        String encoded = Base64.getEncoder().encodeToString(Files.toByteArray(path));

        encoded_extensions.add(encoded);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
    encoded_extensions.addAll(extensions);
    options.put("extensions", encoded_extensions);

    toReturn.put(CAPABILITY, options);

    return Collections.unmodifiableMap(toReturn);
  }
}
