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

package org.openqa.selenium.ie;

import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.base.Objects;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.JsonElement;

import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.File;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Class to manage options specific to {@link InternetExplorerDriver}.
 *
 * <p>Example usage:
 * <pre><code>
 * InternetExplorerOptions options = new InternetExplorerOptions()
 * options.setEnsureCleanSession(true);
 * options.setIgnoreZoomSetting(true);
 *
 * // For use with InternetExplorerDriver:
 * InternetExplorerDriver driver = new InternetExplorerDriver(options);
 *
 * // or alternatively:
 * DesiredCapabilities capabilities = DesiredCapabilities.ie();
 * capabilities.setCapability(InternetExplorerOptions.CAPABILITY, options);
 * InternetExplorerDriver driver = new InternetExplorerDriver(capabilities);
 *
 * // For use with RemoteWebDriver:
 * DesiredCapabilities capabilities = DesiredCapabilities.ie();
 * capabilities.setCapability(InternetExplorerOptions.CAPABILITY, options);
 * RemoteWebDriver driver = new RemoteWebDriver(
 *     new URL("http://localhost:4444/wd/hub"), capabilities);
 * </code></pre>
 *
 * @since Since IEDriverServer v3.4.0
 */
public class InternetExplorerOptions {

  /**
   * Key used to store a set of InternetExplorerOptions in a {@link DesiredCapabilities}
   * object.
   */
  public static final String CAPABILITY = "chromeOptions";

  private static final String INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS = "ignoreProtectedModeSettings";
  private static final String IGNORE_ZOOM_SETTING = "ignoreZoomSetting";
  private static final String INITIAL_BROWSER_URL = "initialBrowserUrl";
  private static final String ENABLE_PERSISTENT_HOVERING = "enablePersistentHover";
  private static final String ELEMENT_SCROLL_BEHAVIOR = "elementScrollBehavior";
  private static final String REQUIRE_WINDOW_FOCUS = "requireWindowFocus";
  private static final String BROWSER_ATTACH_TIMEOUT = "browserAttachTimeout";
  private static final String IE_SWITCHES = "ie.browserCommandLineSwitches";
  private static final String FORCE_CREATE_PROCESS = "ie.forceCreateProcessApi";
  private static final String IE_USE_PRE_PROCESS_PROXY = "ie.usePerProcessProxy";
  private static final String IE_ENSURE_CLEAN_SESSION = "ie.ensureCleanSession";
  private static final String FORCE_SHELL_WINDOWS = "ie.forceShellWindowsApi";
  private static final String FILE_UPLOAD_DIALOG_TIMEOUT = "ie.fileUploadDialogTimeout";
  private static final String HAS_NATIVE_EVENTS = "nativeEvents";

  private boolean hasNativeEvents = true;
  private boolean ignoreProtectedModeSettings;
  private boolean ignoreZoomSetting;
  private boolean requireWindowFocus;
  private boolean ensureCleanSession;
  private boolean usePerProcessProxy;
  private boolean forceCreateProcessApi;
  private boolean forceShellWindowsApi;
  private boolean enablePersistentHover = true;
  private int fileUploadDialogTimeout = 0;
  private int browserAttachTimeout = 0;
  private String initialBrowserUrl;
  private String browserCommandLineSwitches;
  private Map<String, Object> experimentalOptions = Maps.newHashMap();

  /**
   * Sets a value indicating whether the driver session should use 
   * native events.
   *
   * @param hasNativeEvents true to enable native events; otherwise false.
   */
  public void setHasHativeEvents(boolean hasNativeEvents) {
    this.hasNativeEvents = hasNativeEvents;
  }

  /**
   * Sets a value indicating whether the driver session should ignore 
   * the requirement that the browser's Protected Mode settings be set
   * to the same value for all zones, introducing flakiness into the 
   * driver automation code.
   *
   * @param introduceFlakiness true to ignore settings and introduce flakiness; otherwise false.
   */
  public void setIntroduceFlakinessByIgnoringSecurityDomains(boolean introduceFlakiness) {
    this.ignoreProtectedModeSettings = introduceFlakiness;
  }

  /**
   * Sets a value indicating whether the driver session should ignore 
   * the zoom setting of the browser.
   *
   * @param ignoreZoomSetting true to ignore the zoom setting; otherwise false.
   */
  public void setIgnoreZoomSetting(boolean ignoreZoomSetting) {
    this.ignoreZoomSetting = ignoreZoomSetting;
  }

  /**
   * Sets a value indicating whether the driver session should require 
   * focus of the window to interact with the browser.
   *
   * @param requireWindowFocus true to require window focus; otherwise false.
   */
  public void setRequireWindowFocus(boolean requireWindowFocus) {
    this.requireWindowFocus = requireWindowFocus;
  }

  /**
   * Sets a value indicating whether the driver session should clear 
   * the browser's cache before starting.
   *
   * @param ensureCleanSession true to clear the browser cache; otherwise false.
   */
  public void setEnsureCleanSession(boolean ensureCleanSession) {
    this.ensureCleanSession = ensureCleanSession;
  }

  /**
   * Sets a value indicating whether the driver session should use 
   * proxy settings only for this instance of Internet Explorer.
   *
   * @param usePerProcessProxy true to use the proxy settings for only
   *        this browser instance; otherwise false.
   */
  public void setUsePerProcessProxy(boolean usePerProcessProxy) {
    this.usePerProcessProxy = usePerProcessProxy;
  }

  /**
   * Sets a value indicating whether the driver session should use 
   * the CreateProcess API in launching the browser.
   *
   * @param forceCreateProcess true to use force the use of the CreateProcess
   *        API to launch the browser; otherwise false.
   */
  public void setForceCreateProcess(boolean forceCreateProcess) {
    this.forceCreateProcessApi = forceCreateProcess;
  }

  /**
   * Sets a value indicating whether the driver session should use the 
   * ShellWindows API in locating and attaching to the launched browser.
   *
   * @param forceShellWindows true to use force the use of the ShellWindows
   *        API to connect to the browser; otherwise false.
   */
  public void setForceShellWindows(boolean forceShellWindows) {
    this.forceShellWindowsApi = forceShellWindows;
  }

  /**
   * Sets a value indicating whether the driver session should continuously 
   * send messages to the browser during mouse movements.
   *
   * @param enablePersistentHover true to use continuously send messages
   *        to the browser; otherwise false.
   */
  public void setEnablePersistentHover(boolean enablePersistentHover) {
    this.enablePersistentHover = enablePersistentHover;
  }

  /**
   * Sets a value indicating how long the driver should look for the file
   * selection dialog when attempting to upload a file.
   *
   * @param fileUploadDialogTimeout the amount of time, in milliseconds, to
   *        wait for the file selection dialog to appear.
   */
  public void setFileUploadDialogTimeout(int fileUploadDialogTimeout) {
    this.fileUploadDialogTimeout = fileUploadDialogTimeout;
  }

  /**
   * Sets a value indicating how long the driver should attempt to attach
   * to a newly launched instance of the browser.
   *
   * @param browserAttachTimeout the amount of time, in milliseconds, to
   *       attempt to attach to the browser.
   */
  public void setBrowserAttachTimeout(int browserAttachTimeout) {
    this.browserAttachTimeout = browserAttachTimeout;
  }

  /**
   * Sets a value indicating the URL the browser should load when the browser
   * instance is launched.
   *
   * @param initialBrowserUrl the initial URL loaded when the driver launches
   *        the browser.
   */
  public void setInitialBrowserUrl(String initialBrowserUrl) {
    checkNotNull(initialBrowserUrl);
    this.initialBrowserUrl = initialBrowserUrl;
  }

  /**
   * Sets a value indicating the switches to use on the browser command line
   * when launching the browser using the CreateProcess API.
   *
   * @param browserCommandLineSwitches the switches to use on the command line
   *        when launching the browser with the CreateProcess API.
   */
  public void setBrowserCommandLineSwitches(String browserCommandLineSwitches) {
    checkNotNull(browserCommandLineSwitches);
    this.browserCommandLineSwitches = browserCommandLineSwitches;
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
    
    if (!nativeEvents) {
      options.put(HAS_NATIVE_EVENTS, nativeEvents);
    }

    if (ignoreProtectedModeSettings) {
      options.put(INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS, ignoreProtectedModeSettings);
    }

    if (ignoreZoomSetting) {
      options.put(IGNORE_ZOOM_SETTING, ignoreZoomSetting);
    }

    if (requireWindowFocus) {
      options.put(REQUIRE_WINDOW_FOCUS, requireWindowFocus);
    }

    if (ensureCleanSession) {
      options.put(IE_ENSURE_CLEAN_SESSION, ensureCleanSession);
    }

    if (usePerProcessProxy) {
      options.put(IE_USE_PRE_PROCESS_PROXY, usePerProcessProxy);
    }

    if (forceCreateProcess) {
      options.put(FORCE_CREATE_PROCESS, forceCreateProcessApi);
    }

    if (forceShellWindows) {
      options.put(FORCE_SHELL_WINDOWS, forceShellWindowsApi);
    }

    if (!enablePersistentHover) {
      options.put(ENABLE_PERSISTENT_HOVERING, enablePersistentHover);
    }

    if (fileUploadDialogTimeout > 0) {
      options.put(FILE_UPLOAD_DIALOG_TIMEOUT, fileUploadDialogTimeout);
    }

    if (browserAttachTimeout > 0) {
      options.put(BROWSER_ATTACH_TIMEOUT, browserAttachTimeout);
    }

    if (intitalBrowserUrl != null && !"".equals(initialBrowserUrl)) {
      options.put(INITIAL_BROWSER_URL, initialBrowserUrl);
    }

    if (browserCommandLineSwitches != null && !"".equals(browserCommandLineSwitches)) {
      options.put(IE_SWITCHES, browserCommandLineSwitches);)
    }

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
    DesiredCapabilities capabilities = DesiredCapabilities.ie();
    capabilities.setCapability(CAPABILITY, this);
    return capabilities;
  }

  @Override
  public boolean equals(Object other) {
    if (!(other instanceof InternetExplorerOptions)) {
      return false;
    }
    InternetExplorerOptions that = (InternetExplorerOptions) other;
    return Objects.equal(this.hasNativeEvents, that.hasNativeEvents)
        && Objects.equal(this.ignoreProtectedModeSettings, that.ignoreProtectedModeSettings)
        && Objects.equal(this.ignoreZoomSetting, that.ignoreZoomSetting)
        && Objects.equal(this.requireWindowFocus, that.requireWindowFocus)
        && Objects.equal(this.ensureCleanSession, that.ensureCleanSession)
        && Objects.equal(this.usePerProcessProxy, that.usePerProcessProxy)
        && Objects.equal(this.forceCreateProcessApi, that.forceCreateProcessApi)
        && Objects.equal(this.forceShellWindowsApi, that.forceShellWindowsApi)
        && Objects.equal(this.enablePersistentHover, that.enablePersistentHover)
        && Objects.equal(this.fileUploadDialogTimeout, that.fileUploadDialogTimeout)
        && Objects.equal(this.browserAttachTimeout, that.browserAttachTimeout)
        && Objects.equal(this.initialBrowserUrl, that.initialBrowserUrl)
        && Objects.equal(this.browserCommandLineSwitches, that.browserCommandLineSwitches);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(this.hasNativeEvents, this.ignoreProtectedModeSettings,
        this.ignoreZoomSetting, this.requireWindowFocus, this.ensureCleanSession,
        this.usePerProcessProxy, this.forceCreateProcessApi, this.forceShellWindowsApi,
        this.enablePersistentHover, this.fileUploadDialogTimeout, this.browserAttachTimeout,
        this.initialBrowserUrl, this.browserCommandLineSwitches);
  }
}
