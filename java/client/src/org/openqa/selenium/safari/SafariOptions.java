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

package org.openqa.selenium.safari;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.IOException;
import java.util.Map;
import java.util.TreeMap;

/**
 * Class to manage options specific to {@link SafariDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * SafariOptions options = new SafariOptions()
 * options.setUseCleanSession(true);
 *
 * // For use with SafariDriver:
 * SafariDriver driver = new SafariDriver(options);
 *
 * // For use with RemoteWebDriver:
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/wd/hub"),
 *     options);
 * </code></pre>
 */
public class SafariOptions extends MutableCapabilities {

  /**
   * Key used to store SafariOptions in a {@link DesiredCapabilities} object.
   */
  public static final String CAPABILITY = "safari.options";

  private static class Option {
    private Option() {}  // Utility class.

    private static final String CLEAN_SESSION = "cleanSession";
    private static final String TECHNOLOGY_PREVIEW = "technologyPreview";
    private static final String PORT = "port";
  }

  private Map<String, Object> options = new TreeMap<>();

  public SafariOptions() {
    setCapability(Option.PORT, 0);
    setCapability(Option.CLEAN_SESSION, false);
    setCapability(Option.TECHNOLOGY_PREVIEW, false);

    setCapability(CapabilityType.BROWSER_NAME, "safari");
    setCapability(CapabilityType.PLATFORM, Platform.MAC);
  }

  /**
   * Construct a {@link SafariOptions} instance from given capabilites.
   * When the {@link #CAPABILITY} capability is set, all other capabilities will be ignored!
   *
   * @param capabilities Desired capabilities from which the options are derived.
   * @return SafariOptions
   * @throws WebDriverException If an error occurred during the reconstruction of the options
   */
  public static SafariOptions fromCapabilities(Capabilities capabilities)
      throws WebDriverException {
    Object cap = capabilities.getCapability(SafariOptions.CAPABILITY);
    if (cap instanceof SafariOptions) {
      return (SafariOptions) cap;
    } else if (cap instanceof Map) {
      try {
        return SafariOptions.fromJsonMap((Map<?, ?>) cap);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    } else {
      return new SafariOptions();
    }
  }

  // Setters

  /**
   * Set the port the {@link SafariDriverService} should be started on. Defaults to 0, in which case
   * the server selects a free port.
   *
   * @param port The port the {@link SafariDriverService} should be started on,
   *    or 0 if the server should select a free port.
   */
  SafariOptions setPort(int port) {
    options.put(Option.PORT, port);
    return this;
  }

  /**
   * Instruct the SafariDriver to delete all existing session data when starting a new session.
   * This includes browser history, cache, cookies, HTML5 local storage, and HTML5 databases.
   *
   * <p><strong>Warning:</strong> Since Safari uses a single profile for the
   * current user, enabling this capability will permanently erase any existing
   * session data.
   *
   * @param useCleanSession If true, the SafariDriver will erase all existing session data.
   */
  public SafariOptions setUseCleanSession(boolean useCleanSession) {
    options.put(Option.CLEAN_SESSION, useCleanSession);
    return this;
  }

  /**
   * Instruct the SafariDriver to use the Safari Technology Preview if true, otherwise use the
   * release version of Safari. Defaults to using the release version of Safari.
   *
   * @param useTechnologyPreview If true, the SafariDriver will use the Safari Technology Preview,
   *     otherwise will use the release version of Safari.
   */
  public SafariOptions setUseTechnologyPreview(boolean useTechnologyPreview) {
    options.put(Option.TECHNOLOGY_PREVIEW, useTechnologyPreview);
    return this;
  }

  // Getters

  /**
   * @return The port the {@link SafariDriverService} should be started on.
   *    If 0, the server should select a free port.
   * @see #setPort(int)
   */
  public int getPort() {
    return (int) options.getOrDefault(Option.PORT, 0);
  }

  /**
   * @return Whether the SafariDriver should erase all session data before launching Safari.
   * @see #setUseCleanSession(boolean)
   */
  public boolean getUseCleanSession() {
    return (boolean) options.getOrDefault(Option.CLEAN_SESSION, false);
  }

  public boolean getUseTechnologyPreview() {
    return (boolean) options.getOrDefault(Option.TECHNOLOGY_PREVIEW, false);
  }

  // (De)serialization of the options

  /**
   * Parse a Map and reconstruct the {@link SafariOptions}.
   *
   * @return A {@link SafariOptions} instance associated with these extensions.
   */
  private static SafariOptions fromJsonMap(Map<?, ?> options) throws IOException {
    SafariOptions safariOptions = new SafariOptions();

    Number port = (Number) options.get(Option.PORT);
    if (port != null) {
      safariOptions.setPort(port.intValue());
    }

    Boolean useCleanSession = (Boolean) options.get(Option.CLEAN_SESSION);
    if (useCleanSession != null) {
      safariOptions.setUseCleanSession(useCleanSession);
    }

    Boolean useTechnologyPreview = (Boolean) options.get(Option.TECHNOLOGY_PREVIEW);
    if (useTechnologyPreview != null) {
      safariOptions.setUseTechnologyPreview(useTechnologyPreview);
    }

    return safariOptions;
  }

  /**
   * Returns DesiredCapabilities for Safari with these options included as
   * capabilities. This does not copy the object. Further changes will be
   * reflected in the returned capabilities.
   *
   * @return DesiredCapabilities for Safari with these extensions.
   * @deprecated {@code SafariOptions} are already {@link MutableCapabilities}.
   */
  @Deprecated
  MutableCapabilities toCapabilities() {
    return this;
  }
}
