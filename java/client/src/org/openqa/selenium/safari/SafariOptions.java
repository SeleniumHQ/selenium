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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.base.Objects;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.io.Files;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Base64Encoder;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * Class to manage options specific to {@link SafariDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * SafariOptions options = new SafariOptions()
 * // Add an extra extension
 * options.addExtensions(new File("/path/to/extension.safariextz"));
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

  // Bunch of constants used for the serialization and deserialization of the options
  private static final String JSON_KEY_DATADIR = "dataDir";
  private static final String JSON_KEY_EXTENSIONS = "extensions";
  private static final String JSON_KEY_SKIPEXTENSIONINSTALL = "skipExtensionInstallation";
  private static final String JSON_KEY_USECLEANSESSION = "cleanSession";
  private static final String JSON_KEY_USECUSTOMDRIVEREXTENSION = "customDriverExtension";
  private static final String JSON_KEY_PORT = "port";

  /**
   * @see #setDataDir(File)
   */
  private File dataDir;

  /**
   * If {@link #useCustomDriverExtension} is {@code true}, then the first element of this list
   * is the location of the custom Safari Driver extension.
   * @see #setDriverExtension(File)
   * @see #addExtensions(java.util.List)
   */
  private List<File> extensionFiles = Lists.newArrayList();

  /**
   * @see #setPort(int)
   */
  private int port = 0;

  /**
   * @see #setSkipExtensionInstallation(boolean)
   */
  private boolean skipExtensionInstallation = false;

  /**
   * @see #setUseCleanSession(boolean)
   */
  private boolean useCleanSession = false;

  /**
   * If {@code false}, the extension bundled with the jar will be installed.
   * @see #setDriverExtension(File)
   */
  private boolean useCustomDriverExtension = false;

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
    }

    // Backwards-compatiblity / defaults
    SafariOptions options = new SafariOptions();

    options.setUseCleanSession(capabilities.is(SafariDriver.CLEAN_SESSION_CAPABILITY));

    cap = capabilities.getCapability(SafariDriver.DATA_DIR_CAPABILITY);
    if (cap instanceof String) {
      options.setDataDir(new File((String) cap));
    } else if (cap instanceof File) {
      options.setDataDir((File) cap);
    }

    if (capabilities.is(SafariDriver.NO_INSTALL_EXTENSION_CAPABILITY)) {
      options.setSkipExtensionInstallation(true);
    }

    return options;
  }

  // Setters

  /**
   * @param paths Paths to the extensions to install.
   * @see #addExtensions(java.util.List)
   */
  public void addExtensions(File... paths) {
    addExtensions(ImmutableList.copyOf(paths));
  }

  /**
   * Adds a new Safari extension to install on browser startup. Each path should
   * specify a signed Safari extension (safariextz file).
   * Use {@link #setDriverExtension(File)} if you want to install a custom Safari Driver extension.
   *
   * @param paths Paths to the extensions to install.
   */
  public void addExtensions(List<File> paths) {
    for (File path : paths) {
      verifyPathIsSafariextz(path);
    }
    extensionFiles.addAll(paths);
  }

  /**
   * Specifies the location of Safari installation's data directory.
   * The default location is:
   *    <ul>
   *      <li>OS X: /Users/$USER/Library/Safari
   *      <li>Windows: %APPDATA%\Apple Computer\Safari
   *    </ul>
   * @param dataDir A File object pointing to the Safari installation's data directory.
   *    If {@code null}, the default installation location for the current platform will be used.
   */
  public void setDataDir(File dataDir) {
    this.dataDir = dataDir;
  }

  /**
   * Override the SafariDriver Safari extension.
   * By default, the Safari driver extension bundled in the .jar file will be installed.
   * Use this method to install a different SafariDriver Safari extension.
   *
   * @param driverExtension A .safariextz file which is compatible with the SafariDriver.
   *        If {@code null}, the default driver extension is used.
   */
  public void setDriverExtension(File driverExtension) {
    if (this.useCustomDriverExtension) {
      // Only one custom driver extension may exist in the list of extensions.
      // Remove the previous one to avoid having two items in the list.
      extensionFiles.remove(0);
      this.useCustomDriverExtension = false;
    }
    if (driverExtension != null) {
      verifyPathIsSafariextz(driverExtension);
      // Put the extension at the start of the list to make sure that it's installed first.
      extensionFiles.add(0, driverExtension);
      this.useCustomDriverExtension = true;
    }
  }

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

  /**
   * Whether to skip extension installation.
   * This preference takes precedence over the options set by
   * {@link #addExtensions(java.util.List)} and
   * {@link #setDriverExtension(File)}.
   *
   * @param skipExtensionInstallation If true, the installation of extensions is skipped.
   */
  public void setSkipExtensionInstallation(boolean skipExtensionInstallation) {
    this.skipExtensionInstallation = skipExtensionInstallation;
  }

  /**
   * Instruct the SafariDriver to delete all existing session data when starting a new session.
   * This includes browser history, cache, cookies, HTML5 local storage, and HTML5 databases.
   *
   * <p><strong>Warning:</strong> Since Safari uses a single profile for the
   * current user, enabling this capability will permanently erase any existing
   * session data.
   * @param useCleanSession If true, the SafariDriver will erase all existing session data.
   */
  public void setUseCleanSession(boolean useCleanSession) {
    this.useCleanSession = useCleanSession;
  }

  // Getters

  /**
   * @return The location of the data dir where the extensions ought to be installed.
   * @see #setDataDir(File)
   */
  public File getDataDir() {
    return dataDir;
  }

  /**
   * @return List of all added extensions. If a custom SafariDriver extension was set
   *    (using {@link #setDriverExtension(File)}), then it will be the first element of this list.
   * @see #addExtensions(java.util.List)
   */
  public List<File> getExtensions() {
    if (skipExtensionInstallation) return ImmutableList.of();
    return ImmutableList.copyOf(extensionFiles);
  }

  /**
   * @return The port the {@link SafariDriverServer} should be started on.
   *    If 0, the server should select a free port.
   * @see #setPort(int)
   */
  public int getPort() {
    return port;
  }

  /**
   * @return Whether installation of the Safari extensions (including the driver) should be skipped.
   * @see #setSkipExtensionInstallation(boolean)
   */
  public boolean getSkipExtensionInstallation() {
    return skipExtensionInstallation;
  }

  /**
   * @return Whether the SafariDriver Safari extension within the jar file should be installed.
   * @see #setDriverExtension(File)
   * @see #setSkipExtensionInstallation(boolean)
   */
  public boolean getUseCustomDriverExtension() {
    // If extension install is skipped, then it's assumed that a custom driver extension,
    // namely the pre-installed on is used.
    return useCustomDriverExtension || skipExtensionInstallation;
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
  public JSONObject toJson() throws IOException, JSONException {
    JSONObject options = new JSONObject();

    if (dataDir != null) {
      options.put(JSON_KEY_DATADIR, dataDir.getPath());
    }
    options.put(JSON_KEY_EXTENSIONS, extensionsToJson());
    options.put(JSON_KEY_PORT, port);
    options.put(JSON_KEY_SKIPEXTENSIONINSTALL, skipExtensionInstallation);
    options.put(JSON_KEY_USECLEANSESSION, useCleanSession);
    options.put(JSON_KEY_USECUSTOMDRIVEREXTENSION, useCustomDriverExtension);

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
    Object path = options.get(JSON_KEY_DATADIR);
    if (path != null) {
      safariOptions.setDataDir(new File((String) path));
    }

    Object extensions = options.get(JSON_KEY_EXTENSIONS);
    if (extensions != null) {
      safariOptions.addExtensionsFromJsonList((List<Map<String,String>>) extensions);
    }

    Object port = options.get(JSON_KEY_PORT);
    if (port != null) {
      safariOptions.setPort(((Long) port).intValue());
    }

    Object skipExtensionInstallation = options.get(JSON_KEY_SKIPEXTENSIONINSTALL);
    if (skipExtensionInstallation != null) {
      safariOptions.setSkipExtensionInstallation((Boolean) skipExtensionInstallation);
    }

    Object useCleanSession = options.get(JSON_KEY_USECLEANSESSION);
    if (useCleanSession != null) {
      safariOptions.setUseCleanSession((Boolean) useCleanSession);
    }

    Object useCustomDriverExtension = options.get(JSON_KEY_USECUSTOMDRIVEREXTENSION);
    if (useCustomDriverExtension != null) {
      safariOptions.useCustomDriverExtension = (Boolean) useCustomDriverExtension;
    }
    return safariOptions;
  }

  /**
   * Verify that a given path is a file and ends with ".safariextz".
   */
  private void verifyPathIsSafariextz(File path) {
    checkNotNull(path);
    checkArgument(path.exists(), "%s does not exist", path.getAbsolutePath());
    checkArgument(!path.isDirectory(), "%s is a directory", path.getAbsolutePath());
    checkArgument(path.getName().endsWith(".safariextz"),
        "%s does not end with .safariextz", path.getName());
  }

  /**
   * Converts the list of Safari extensions to a JSONArray
   *
   * @throws IOException If an error occurs while reading the
   *     {@link #addExtensions(java.util.List) extension files} from disk.
   * @return A List of dictionaries with keys "filename" and "contents". 
   *    After JSON-serialization, it looks like
   *    <code>[
   *        { "filename":"name.safariextz", "contents": "file content" },
   *        ...
   *    ]</code>
   */
  private JSONArray extensionsToJson() throws IOException, JSONException {
    // Format:  [{ "filename": "...safariextz data...", "filename2": ... }
    JSONArray extensionsList = new JSONArray();
    for (File path : extensionFiles) {
      JSONObject extensionInfo = new JSONObject();
      extensionInfo.put("filename", path.getName());
      String encoded = new Base64Encoder().encode(Files.toByteArray(path));
      extensionInfo.put("contents", encoded);

      extensionsList.put(extensionInfo);
    }
    return extensionsList;
  }

  /**
   * Parses a list of extension filename-content pairs (expected to be derived from
   * {@link #getJsonSerializableExtensions()}, writes the extensions to a temporary directory
   * and adds them to the SafariOptions instance.
   *
   * @throws IOException If an error occurred while writing the safari extensions to a
   *    temporary directory.
   */
  private void addExtensionsFromJsonList(List<Map<String,String>> extensions) throws IOException {
    File dir = TemporaryFilesystem.getDefaultTmpFS().createTempDir("SafariOptions", "safaridriver");
    for (Map<String,String> extensionInfo : extensions) {
      String path = extensionInfo.get("filename");
      String encoded = extensionInfo.get("contents");
      byte[] decoded = new Base64Encoder().decode(encoded);
      File file = new File(dir, path);
      Files.write(decoded, file);
      this.addExtensions(file);
    }
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

    // Backwards-compatibility
    capabilities.setCapability(SafariDriver.CLEAN_SESSION_CAPABILITY, getUseCleanSession());
    capabilities.setCapability(SafariDriver.DATA_DIR_CAPABILITY, getDataDir());
    capabilities.setCapability(SafariDriver.NO_INSTALL_EXTENSION_CAPABILITY, getSkipExtensionInstallation());

    return capabilities;
  }

  @Override
  public boolean equals(Object other) {
    if (!(other instanceof SafariOptions)) {
      return false;
    }
    SafariOptions that = (SafariOptions) other;
    return Objects.equal(this.dataDir, that.dataDir)
        && Objects.equal(this.extensionFiles, that.extensionFiles)
        && this.port == that.port
        && this.skipExtensionInstallation == that.skipExtensionInstallation
        && this.useCleanSession == that.useCleanSession
        && this.useCustomDriverExtension == that.useCustomDriverExtension;
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(this.dataDir, this.extensionFiles, this.port,
            this.skipExtensionInstallation, this.useCleanSession,
            this.useCustomDriverExtension);
  }
}
