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
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;
import static org.openqa.selenium.remote.CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR;
import static org.openqa.selenium.remote.CapabilityType.UNHANDLED_PROMPT_BEHAVIOUR;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.io.Files;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.UnexpectedAlertBehaviour;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

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
 * // For use with RemoteWebDriver:
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/wd/hub"),
 *     new ChromeOptions());
 * </code></pre>
 *
 * @since Since chromedriver v17.0.963.0
 */
public class ChromeOptions extends MutableCapabilities {

  /**
   * Key used to store a set of ChromeOptions in a {@link Capabilities}
   * object.
   */
  public static final String CAPABILITY = "goog:chromeOptions";

  private String binary;
  private List<String> args = Lists.newArrayList();
  private List<File> extensionFiles = Lists.newArrayList();
  private List<String> extensions = Lists.newArrayList();
  private Map<String, Object> experimentalOptions = Maps.newHashMap();

  public ChromeOptions() {
    setCapability(CapabilityType.BROWSER_NAME, BrowserType.CHROME);
  }

  @Override
  public ChromeOptions merge(Capabilities extraCapabilities) {
    super.merge(extraCapabilities);
    return this;
  }

  /**
   * Sets the path to the Chrome executable. This path should exist on the
   * machine which will launch Chrome. The path should either be absolute or
   * relative to the location of running ChromeDriver server.
   *
   * @param path Path to Chrome executable.
   */
  public ChromeOptions setBinary(File path) {
    binary = checkNotNull(path).getPath();
    return this;
  }

  /**
   * Sets the path to the Chrome executable. This path should exist on the
   * machine which will launch Chrome. The path should either be absolute or
   * relative to the location of running ChromeDriver server.
   *
   * @param path Path to Chrome executable.
   */
  public ChromeOptions setBinary(String path) {
    binary = checkNotNull(path);
    return this;
  }

  /**
   * @param arguments The arguments to use when starting Chrome.
   * @see #addArguments(java.util.List)
   */
  public ChromeOptions addArguments(String... arguments) {
    addArguments(ImmutableList.copyOf(arguments));
    return this;
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
  public ChromeOptions addArguments(List<String> arguments) {
    args.addAll(arguments);
    return this;
  }

  /**
   * @param paths Paths to the extensions to install.
   * @see #addExtensions(java.util.List)
   */
  public ChromeOptions addExtensions(File... paths) {
    addExtensions(ImmutableList.copyOf(paths));
    return this;
  }

  /**
   * Adds a new Chrome extension to install on browser startup. Each path should
   * specify a packed Chrome extension (CRX file).
   *
   * @param paths Paths to the extensions to install.
   */
  public ChromeOptions addExtensions(List<File> paths) {
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
  public ChromeOptions addEncodedExtensions(String... encoded) {
    addEncodedExtensions(ImmutableList.copyOf(encoded));
    return this;
  }

  /**
   * Adds a new Chrome extension to install on browser startup. Each string data should
   * specify a Base64 encoded string of packed Chrome extension (CRX file).
   *
   * @param encoded Base64 encoded data of the extensions to install.
   */
  public ChromeOptions addEncodedExtensions(List<String> encoded) {
    for (String extension : encoded) {
      checkNotNull(extension);
    }
    extensions.addAll(encoded);
    return this;
  }

  /**
   * Sets an experimental option.  Useful for new ChromeDriver options not yet
   * exposed through the {@link ChromeOptions} API.
   *
   * @param name Name of the experimental option.
   * @param value Value of the experimental option, which must be convertible
   *     to JSON.
   */
  public ChromeOptions setExperimentalOption(String name, Object value) {
    experimentalOptions.put(checkNotNull(name), value);
    return this;
  }

  /**
   * Returns the value of an experimental option.
   *
   * @param name The option name.
   * @return The option value, or {@code null} if not set.
   * @deprecated Getters are not needed in browser Options classes.
   */
  @Deprecated
  public Object getExperimentalOption(String name) {
    return experimentalOptions.get(checkNotNull(name));
  }

  public ChromeOptions setPageLoadStrategy(PageLoadStrategy strategy) {
    setCapability(PAGE_LOAD_STRATEGY, strategy);
    return this;
  }

  public ChromeOptions setUnhandledPromptBehaviour(UnexpectedAlertBehaviour behaviour) {
    setCapability(UNHANDLED_PROMPT_BEHAVIOUR, behaviour);
    setCapability(UNEXPECTED_ALERT_BEHAVIOUR, behaviour);
    return this;
  }

  public ChromeOptions setAcceptInsecureCerts(boolean acceptInsecureCerts) {
    setCapability(ACCEPT_INSECURE_CERTS, acceptInsecureCerts);
    return this;
  }

  public ChromeOptions setHeadless(boolean headless) {
    args.remove("--headless");
    if (headless) {
      args.add("--headless");
      args.add("--disable-gpu");
    }
    return this;
  }

  /**
   * Returns DesiredCapabilities for Chrome with these options included as
   * capabilities. This does not copy the options. Further changes will be
   * reflected in the returned capabilities.
   *
   * @return DesiredCapabilities for Chrome with these options.
   * @deprecated This class is already an instance of {@link MutableCapabilities}.
   */
  @Deprecated
  MutableCapabilities toCapabilities() {
    return this;
  }

  @Override
  protected int amendHashCode() {
    return Objects.hash(
        args,
        binary,
        experimentalOptions,
        extensionFiles,
        extensions);
  }

  @Override
  public Map<String, ?> asMap() {
    Map<String, Object> toReturn = new TreeMap<>();
    toReturn.putAll(super.asMap());

    Map<String, Object> options = new TreeMap<>();
    experimentalOptions.forEach(options::put);

    if (binary != null) {
      options.put("binary", binary);
    }

    options.put("args", ImmutableList.copyOf(args));

    options.put(
        "extensions",
        extensionFiles.stream()
            .map(file -> {
              try {
                return Base64.getEncoder().encodeToString(Files.toByteArray(file));
              } catch (IOException e) {
                throw new SessionNotCreatedException(e.getMessage(), e);
              }
            })
            .collect(ImmutableList.toImmutableList()));

    toReturn.put(CAPABILITY, options);

    return Collections.unmodifiableMap(toReturn);
  }
}
