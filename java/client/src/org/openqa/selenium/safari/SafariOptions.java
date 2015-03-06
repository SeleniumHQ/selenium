/*
 Copyright 2013 Selenium committers

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

package org.openqa.selenium.safari;

import com.google.common.base.Objects;
import com.google.common.base.Optional;
import com.google.common.collect.ImmutableList;
import com.google.gson.JsonObject;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

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
 * DesiredCapabilities capabilities = DesiredCapabilities.safari();
 * capabilities.setCapability(SafariOptions.CAPABILITY, options);
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/wd/hub"), capabilities);
 * </code></pre>
 */
public class SafariOptions {

  /**
   * Key used to store SafariOptions in a {@link DesiredCapabilities} object.
   */
  public static final String CAPABILITY = "safari.options";

  private static class Option {
    private Option() {}  // Utility class.

    private static final String CLEAN_SESSION = "cleanSession";
    private static final String PORT = "port";
  }

  /**
   * @see #setPort(int)
   */
  private int port = 0;

  /**
   * @see #setUseCleanSession(boolean)
   */
  private boolean useCleanSession = false;

  /**
   * Construct a {@link SafariOptions} instance from given capabilites.
   * When the {@link #CAPABILITY} capability is set, all other capabilities will be ignored!
   *
   * @param capabilities Desired capabilities from which the options are derived.
   * @throws WebDriverException If an error occurred during the reconstruction of the options
   */
  public static SafariOptions fromCapabilities(Capabilities capabilities)
      throws WebDriverException {
    Object cap = capabilities.getCapability(SafariOptions.CAPABILITY);
    if (cap instanceof SafariOptions) {
      return (SafariOptions) cap;
    } else if (cap instanceof Map) {
      try {
        return SafariOptions.fromJsonMap((Map) cap);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    } else {
      return new SafariOptions();
    }
  }

  // Setters

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public void addExtensions(File... paths) {}

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public void addExtensions(List<File> paths) {}

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public void setDataDir(File dataDir) {}

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public void setDriverExtension(File driverExtension) {}

  /**
   * Set the port the {@link SafariDriverServer} should be started on. Defaults to 0, in which case
   * the server selects a free port.
   *
   * @param port The port the {@link SafariDriverServer} should be started on,
   *    or 0 if the server should select a free port.
   */
  public void setPort(int port) {
    this.port = port;
  }

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public void setSkipExtensionInstallation(boolean skipExtensionInstallation) {}

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
  public void setUseCleanSession(boolean useCleanSession) {
    this.useCleanSession = useCleanSession;
  }

  // Getters

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public Optional<File> getDataDir() {
    return Optional.absent();
  }

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public List<File> getExtensions() {
    return ImmutableList.of();
  }

  /**
   * @return The port the {@link SafariDriverServer} should be started on.
   *    If 0, the server should select a free port.
   * @see #setPort(int)
   */
  public int getPort() {
    return port;
  }

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public boolean getSkipExtensionInstallation() {
    return false;
  }

  /** @deprecated This method is now a no-op and will be removed in 2.46.0. */
  public boolean getUseCustomDriverExtension() {
    return false;
  }

  /**
   * @return Whether the SafariDriver should erase all session data before launching Safari.
   * @see #setUseCleanSession(boolean)
   */
  public boolean getUseCleanSession() {
    return useCleanSession;
  }

  // (De)serialization of the options

  /**
   * Converts this instance to its JSON representation.
   *
   * @return The JSON representation of the options.
   * @throws IOException If an error occurred while reading the Safari extension files.
   */
  public JsonObject toJson() throws IOException {
    JsonObject options = new JsonObject();
    options.addProperty(Option.PORT, port);
    options.addProperty(Option.CLEAN_SESSION, useCleanSession);
    return options;
  }

  /**
   * Parse a Map and reconstruct the {@link SafariOptions}.
   * A temporary directory is created to hold all Safari extension files.
   *
   * @param options A Map derived from the output of {@link #toJson()}.
   * @return A {@link SafariOptions} instance associated with these extensions.
   * @throws IOException If an error occurred while writing the safari extensions to a
   *    temporary directory.
   */
  @SuppressWarnings("unchecked")
  private static SafariOptions fromJsonMap(Map options) throws IOException {
    SafariOptions safariOptions = new SafariOptions();

    Number port = (Number) options.get(Option.PORT);
    if (port != null) {
      safariOptions.setPort(port.intValue());
    }

    Boolean useCleanSession = (Boolean) options.get(Option.CLEAN_SESSION);
    if (useCleanSession != null) {
      safariOptions.setUseCleanSession(useCleanSession);
    }
    return safariOptions;
  }

  /**
   * Returns DesiredCapabilities for Safari with these options included as
   * capabilities. This does not copy the object. Further changes will be
   * reflected in the returned capabilities.
   *
   * @return DesiredCapabilities for Safari with these extensions.
   */
  DesiredCapabilities toCapabilities() {
    DesiredCapabilities capabilities = DesiredCapabilities.safari();
    capabilities.setCapability(CAPABILITY, this);
    return capabilities;
  }

  @Override
  public boolean equals(Object other) {
    if (!(other instanceof SafariOptions)) {
      return false;
    }
    SafariOptions that = (SafariOptions) other;
    return this.port == that.port
        && this.useCleanSession == that.useCleanSession;
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(this.port, this.useCleanSession);
  }
}
