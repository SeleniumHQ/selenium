/*
 Copyright 2011 Selenium committers
 Copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium.chrome;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.Files;

import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
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

  private File binary;
  private List<String> args = Lists.newArrayList();
  private List<File> extensionFiles = Lists.newArrayList();
  private Map<String, Object> experimentalOptions = Maps.newHashMap();

  /**
   * Sets the path to the Chrome executable. This path should exist on the
   * machine which will launch Chrome. The path should either be absolute or
   * relative to the location of running ChromeDriver server.
   *
   * @param path Path to Chrome executable.
   */
  public void setBinary(File path) {
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
   * Sets an experimental option.  Useful for new ChromeDriver options not yet
   * exposed through the {@link ChromeOptions} API.
   *
   * @param name Name of the experimental option.
   * @param value Value of the experimental option, which must be convertible
   *     to JSON.
   */
  public void setExperimentalOptions(String name, Object value) {
    experimentalOptions.put(checkNotNull(name), value);
  }

  /**
   * Converts this instance to its JSON representation.
   *
   * @return The JSON representation of these options.
   * @throws IOException If an error occurs while reading the
   *     {@link #addExtensions(java.util.List) extension files} from disk.
   * @throws JSONException If an error occurs while encoding these options as
   *     JSON.
   */
  public JSONObject toJson() throws IOException, JSONException {
    JSONObject options = new JSONObject(experimentalOptions);

    if (binary != null) {
      options.put("binary", binary.getPath());
    }

    options.put("args", ImmutableList.copyOf(args));

    List<String> extensions = Lists.newArrayListWithExpectedSize(
        extensionFiles.size());
    for (File path : extensionFiles) {
      String encoded = new Base64Encoder().encode(Files.toByteArray(path));
      extensions.add(encoded);
    }
    options.put("extensions", extensions);

    return options;
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

    // chromeOptions is only recognized by chromedriver 17.0.963.0 or newer.
    // Provide backwards compatibility for capabilities supported by older
    // versions of chromedriver.
    // TODO: remove this once the deprecated capabilities are no longer supported.
    capabilities.setCapability("chrome.switches", args);
    if (binary != null) {
      capabilities.setCapability("chrome.binary", binary.getPath());
    }

    return capabilities;
  }
}
