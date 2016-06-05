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

package org.openqa.selenium.chrome;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.JsonElement;

import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Class to manage options specific to {@link ChromeDriver}.
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
 * // or alternatively:
 * DesiredCapabilities capabilities = DesiredCapabilities.chrome();
 * capabilities.setCapability(ChromeOptions.CAPABILITY, options);
 * ChromeDriver driver = new ChromeDriver(capabilities);
 *
 * // For use with RemoteWebDriver:
 * DesiredCapabilities capabilities = DesiredCapabilities.chrome();
 * capabilities.setCapability(ChromeOptions.CAPABILITY, options);
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/wd/hub"), capabilities);
 * </code></pre>
 *
 * @since Since chromedriver v17.0.963.0
 */
public class ChromeOptions {

  /**
   * Key used to store a set of ChromeOptions in a {@link DesiredCapabilities}
   * object.
   */
  public static final String CAPABILITY = "chromeOptions";

  private String binary;
  private List<String> args = Lists.newArrayList();
  private List<File> extensionFiles = Lists.newArrayList();
  private List<String> extensions = Lists.newArrayList();
  private Map<String, Object> experimentalOptions = Maps.newHashMap();

  /**
   * Sets the path to the Chrome executable. This path should exist on the
   * machine which will launch Chrome. The path should either be absolute or
   * relative to the location of running ChromeDriver server.
   *
   * @param path Path to Chrome executable.
   */
  public void setBinary(File path) {
    binary = checkNotNull(path).getPath();
  }

  /**
   * Sets the path to the Chrome executable. This path should exist on the
   * machine which will launch Chrome. The path should either be absolute or
   * relative to the location of running ChromeDriver server.
   *
   * @param path Path to Chrome executable.
   */
  public void setBinary(String path) {
    binary = checkNotNull(path);
  }

  /**
   * @param arguments The arguments to use when starting Chrome.
   * @see #addArguments(java.util.List)
   */
  public void addArguments(String... arguments) {
    addArguments(ImmutableList.copyOf(arguments));
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
   * Arguments with an associated value should be delimitted with an "=":
   * "foo=bar".
   *
   * @param arguments The arguments to use when starting Chrome.
   */
  public void addArguments(List<String> arguments) {
    args.addAll(arguments);
  }

  /**
   * @param paths Paths to the extensions to install.
   * @see #addExtensions(java.util.List)
   */
  public void addExtensions(File... paths) {
    addExtensions(ImmutableList.copyOf(paths));
  }

  /**
   * Adds a new Chrome extension to install on browser startup. Each path should
   * specify a packed Chrome extension (CRX file).
   *
   * @param paths Paths to the extensions to install.
   */
  public void addExtensions(List<File> paths) {
    for (File path : paths) {
      checkNotNull(path);
      checkArgument(path.exists(), "%s does not exist", path.getAbsolutePath());
      checkArgument(!path.isDirectory(), "%s is a directory",
          path.getAbsolutePath());
    }
    extensionFiles.addAll(paths);
  }

  /**
   * @param encoded Base64 encoded data of the extensions to install.
   * @see #addEncodedExtensions(java.util.List)
   */
  public void addEncodedExtensions(String... encoded) {
    addEncodedExtensions(ImmutableList.copyOf(encoded));
  }

  /**
   * Adds a new Chrome extension to install on browser startup. Each string data should
   * specify a Base64 encoded string of packed Chrome extension (CRX file).
   *
   * @param encoded Base64 encoded data of the extensions to install.
   */
  public void addEncodedExtensions(List<String> encoded) {
    for (String extension : encoded) {
      checkNotNull(extension);
    }
    extensions.addAll(encoded);
  }

  /**
   * Sets an experimental option.  Useful for new ChromeDriver options not yet
   * exposed through the {@link ChromeOptions} API.
   *
   * @param name Name of the experimental option.
   * @param value Value of the experimental option, which must be convertible
   *     to JSON.
   */
  public void setExperimentalOption(String name, Object value) {
    experimentalOptions.put(checkNotNull(name), value);
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

  /**
   * Converts this instance to its JSON representation.
   *
   * @return The JSON representation of these options.
   * @throws IOException If an error occurs while reading the
   *     {@link #addExtensions(java.util.List) extension files} from disk.
   */
  public JsonElement toJson() throws IOException {
    Map<String, Object> options = Maps.newHashMap();

    for (String key : experimentalOptions.keySet()) {
      options.put(key, experimentalOptions.get(key));
    }

    if (binary != null) {
      options.put("binary", binary);
    }

    options.put("args", ImmutableList.copyOf(args));

    List<String> encoded_extensions = Lists.newArrayListWithExpectedSize(
        extensionFiles.size() + extensions.size());
    for (File path : extensionFiles) {
      String encoded = Base64.getEncoder().encodeToString(Files.toByteArray(path));
      encoded_extensions.add(encoded);
    }
    encoded_extensions.addAll(extensions);
    options.put("extensions", encoded_extensions);

    return new Gson().toJsonTree(options);
  }

  /**
   * Returns DesiredCapabilities for Chrome with these options included as
   * capabilities. This does not copy the options. Further changes will be
   * reflected in the returned capabilities.
   *
   * @return DesiredCapabilities for Chrome with these options.
   */
  DesiredCapabilities toCapabilities() {
    DesiredCapabilities capabilities = DesiredCapabilities.chrome();
    capabilities.setCapability(CAPABILITY, this);
    return capabilities;
  }

  @Override
  public boolean equals(Object other) {
    if (!(other instanceof ChromeOptions)) {
      return false;
    }
    ChromeOptions that = (ChromeOptions) other;
    return Objects.equal(this.binary, that.binary)
        && Objects.equal(this.args, that.args)
        && Objects.equal(this.extensionFiles, that.extensionFiles)
        && Objects.equal(this.experimentalOptions, that.experimentalOptions)
        && Objects.equal(this.extensions, that.extensions);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(this.binary, this.args, this.extensionFiles, this.experimentalOptions,
        this.extensions);
  }
}
