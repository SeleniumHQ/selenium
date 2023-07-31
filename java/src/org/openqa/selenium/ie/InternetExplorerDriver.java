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

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.RemoteWebDriverBuilder;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.service.DriverCommandExecutor;
import org.openqa.selenium.remote.service.DriverFinder;

public class InternetExplorerDriver extends RemoteWebDriver {

  /** Capability that defines whether to ignore the browser zoom level or not. */
  public static final String IGNORE_ZOOM_SETTING = "ignoreZoomSetting";

  /**
   * Capability that defines to use whether to use native or javascript events during operations.
   *
   * @deprecated Non W3C compliant
   */
  @Deprecated public static final String NATIVE_EVENTS = "nativeEvents";

  /** Capability that defines the initial URL to be used when IE is launched. */
  public static final String INITIAL_BROWSER_URL = "initialBrowserUrl";

  /** Capability that defines how elements are scrolled into view in the InternetExplorerDriver. */
  public static final String ELEMENT_SCROLL_BEHAVIOR = "elementScrollBehavior";

  /**
   * Capability that defines which behaviour will be used if an unexpected Alert is found.
   *
   * @deprecated Use {@link CapabilityType#UNHANDLED_PROMPT_BEHAVIOUR}
   */
  public static final String UNEXPECTED_ALERT_BEHAVIOR = "unexpectedAlertBehaviour";

  /** Capability that defines to use or not cleanup of element cache on document loading. */
  public static final String ENABLE_ELEMENT_CACHE_CLEANUP = "enableElementCacheCleanup";

  /** Capability that defines timeout in milliseconds for attaching to new browser window. */
  public static final String BROWSER_ATTACH_TIMEOUT = "browserAttachTimeout";

  /**
   * Capability that defines to ignore browser protected mode settings during starting by
   * IEDriverServer.
   *
   * <p>Setting this capability will make your tests unstable and hard to debug.
   */
  public static final String INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS =
      "ignoreProtectedModeSettings";

  /** Capability that defines to use persistent hovering or not. */
  public static final String ENABLE_PERSISTENT_HOVERING = "enablePersistentHover";

  /** Capability that defines to focus to browser window or not before operation. */
  public static final String REQUIRE_WINDOW_FOCUS = "requireWindowFocus";

  /** Capability that defines launch API of IE used by IEDriverServer. */
  public static final String FORCE_CREATE_PROCESS = "ie.forceCreateProcessApi";

  /**
   * Capability that defines to clean or not browser cache before launching IE by IEDriverServer.
   */
  public static final String IE_ENSURE_CLEAN_SESSION = "ie.ensureCleanSession";

  /**
   * Capability that defines setting the proxy information for a single IE process without affecting
   * the proxy settings of other instances of IE.
   */
  public static final String IE_USE_PER_PROCESS_PROXY = "ie.usePerProcessProxy";

  /** Capability that defines used IE CLI switches when {@link #FORCE_CREATE_PROCESS} is enabled. */
  public static final String IE_SWITCHES = "ie.browserCommandLineSwitches";

  public InternetExplorerDriver() {
    this(
        InternetExplorerDriverService.createDefaultService(),
        new InternetExplorerOptions(),
        ClientConfig.defaultConfig());
  }

  public InternetExplorerDriver(InternetExplorerOptions options) {
    this(
        InternetExplorerDriverService.createDefaultService(),
        options,
        ClientConfig.defaultConfig());
  }

  public InternetExplorerDriver(InternetExplorerDriverService service) {
    this(service, new InternetExplorerOptions(), ClientConfig.defaultConfig());
  }

  public InternetExplorerDriver(
      InternetExplorerDriverService service, InternetExplorerOptions options) {
    this(service, options, ClientConfig.defaultConfig());
  }

  /**
   * Creates a new InternetExplorerDriver instance with the specified options. The {@code service}
   * will be started along with the driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param options The options required from InternetExplorerDriver.
   */
  public InternetExplorerDriver(
      InternetExplorerDriverService service,
      InternetExplorerOptions options,
      ClientConfig clientConfig) {
    if (options == null) {
      options = new InternetExplorerOptions();
    }
    if (service == null) {
      service = InternetExplorerDriverService.createDefaultService();
    }
    if (service.getExecutable() == null) {
      String path = DriverFinder.getPath(service, options).getDriverPath();
      service.setExecutable(path);
    }
    if (clientConfig == null) {
      clientConfig = ClientConfig.defaultConfig();
    }

    run(service, options, clientConfig);
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new InternetExplorerOptions());
  }

  private void run(
      InternetExplorerDriverService service, Capabilities capabilities, ClientConfig clientConfig) {
    assertOnWindows();

    setCommandExecutor(new DriverCommandExecutor(service, clientConfig));

    startSession(capabilities);
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained "
            + "via RemoteWebDriver");
  }

  protected void assertOnWindows() {
    Platform current = Platform.getCurrent();
    if (!current.is(Platform.WINDOWS)) {
      throw new WebDriverException(
          String.format(
              "You appear to be running %s. The IE driver only runs on Windows.", current));
    }
  }
}
