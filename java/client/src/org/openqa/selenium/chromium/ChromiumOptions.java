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

import static java.util.Collections.unmodifiableSet;
import static java.util.Collections.unmodifiableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.AbstractDriverOptions;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashSet;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.Set;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

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
public class ChromiumOptions<T extends ChromiumOptions> extends AbstractDriverOptions<ChromiumOptions> {

  private String binary;
  private Set<String> args;
  private Set<String> extensions;
  private Map<String, Object> googleOptions;
  private final String CAPABILITY;

  public ChromiumOptions(String capabilityType, String browserType, String capability) {
    this.CAPABILITY = capability;
    setCapability(capabilityType, browserType);
  }

  @Override
  @SuppressWarnings("unchecked")
  public void setCapability(String capabilityName, Object value) {
    if(capabilityName.equals(CAPABILITY) && value instanceof Map){
      googleOptions = (Map<String,Object>)value;
      if(googleOptions.containsKey("args") && googleOptions.get("args") instanceof Set)
          args = (Set<String>)googleOptions.get("args");
      if(googleOptions.containsKey("extensions") && googleOptions.get("extensions") instanceof Set)
        extensions = (Set<String>)googleOptions.get("extensions");
    }
    super.setCapability(capabilityName, value);
  }

  @Override
  public T merge(Capabilities extraCapabilities) {
    super.merge(extraCapabilities);
    return (T) this;
  }
  private Map<String,Object> getGoogleOptions(){
      if(googleOptions == null){
        setCapability(CAPABILITY,new HashMap<String,Object>());
      }
      return googleOptions;
  }
  private Set<String> getArgs() {
    if(args == null){
      args = new HashSet<>();
      getGoogleOptions().put("args",args);
    }
    return args;
  }
  private Set<String> getExtensions(){
    if(extensions == null){
      extensions = new HashSet<>();
      getGoogleOptions().put("extensions",extensions);
    }
    return extensions;
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
    getGoogleOptions().put("binary",binary);
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
    getGoogleOptions().put("binary",binary);
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
    getArgs().addAll(arguments);
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
    paths.forEach(file -> {
          try {
            getExtensions().add(Base64.getEncoder().encodeToString(Files.readAllBytes(file.toPath())));
          } catch (IOException e) {
            throw new SessionNotCreatedException(e.getMessage(), e);
          }
    });
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
    getExtensions().addAll(encoded);
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
    getGoogleOptions().put(Require.nonNull("Option name",name),value);
    return (T) this;
  }

  public T setHeadless(boolean headless) {
    getArgs().remove("--headless");
    if (headless) {
      args.add("--headless");
    }
    return (T) this;
  }

  @Override
  protected int amendHashCode() {
    return Objects.hash(
        args,
        binary,
        extensions);
  }

  @Override
  public Map<String, Object> asMap() {
    Map<String, Object> toReturn = new TreeMap<>(super.asMap());
    Map<String, Object> options = new TreeMap<>((Map<String, Object>)toReturn.get(CAPABILITY));
    if(options.containsKey("args"))
      options.put("args", unmodifiableSet(args));
    if(options.containsKey("extensions"))
      options.put("extensions",unmodifiableSet(extensions));
    toReturn.put(CAPABILITY,unmodifiableMap(options));
    return unmodifiableMap(toReturn);
  }
}
