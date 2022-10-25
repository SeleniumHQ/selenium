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
import org.openqa.selenium.remote.service.DriverCommandExecutor;

import java.io.File;

public class InternetExplorerDriver extends RemoteWebDriver {

  /**
   * Capability that defines whether to ignore the browser zoom level or not.
   */
  public static final String IGNORE_ZOOM_SETTING = "ignoreZoomSetting";

  /**
   * Capability that defines to use whether to use native or javascript events during operations.
   */
  public static final String NATIVE_EVENTS = CapabilityType.HAS_NATIVE_EVENTS;

  /**
   * Capability that defines the initial URL to be used when IE is launched.
   */
  public static final String INITIAL_BROWSER_URL = "initialBrowserUrl";

  /**
   * Capability that defines how elements are scrolled into view in the InternetExplorerDriver.
   */
  public static final String ELEMENT_SCROLL_BEHAVIOR = CapabilityType.ELEMENT_SCROLL_BEHAVIOR;

  /**
   * Capability that defines which behaviour will be used if an unexpected Alert is found.
   */
  public static final String UNEXPECTED_ALERT_BEHAVIOR = CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR;

  /**
   * Capability that defines to use or not cleanup of element cache on document loading.
   */
  public static final String ENABLE_ELEMENT_CACHE_CLEANUP = "enableElementCacheCleanup";

  /**
   * Capability that defines timeout in milliseconds for attaching to new browser window.
   */
  public static final String BROWSER_ATTACH_TIMEOUT = "browserAttachTimeout";

  /**
   * Capability that defines to ignore browser
   * protected mode settings during starting by IEDriverServer.
   *
   * Setting this capability will make your tests unstable and hard to debug.
   */
  public static final String INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS =
      "ignoreProtectedModeSettings";

  /**
   * Capability that defines to use persistent hovering or not.
   */
  public static final String ENABLE_PERSISTENT_HOVERING = "enablePersistentHover";

  /**
   * Capability that defines to focus to browser window or not before operation.
   */
  public static final String REQUIRE_WINDOW_FOCUS = "requireWindowFocus";

  /**
   * Capability that defines the location of the file where IEDriverServer
   * should write log messages to.
   */
  public static final String LOG_FILE = "logFile";

  /**
   * Capability that defines the detalization level the IEDriverServer logs.
   */
  public static final String LOG_LEVEL = "logLevel";

  /**
   * Capability that defines the address of the host adapter on which
   * the IEDriverServer will listen for commands.
   */
  public static final String HOST = "host";

  /**
   * Capability that defines full path to directory to which will be
   * extracted supporting files of the IEDriverServer.
   */
  public static final String EXTRACT_PATH = "extractPath";

  /**
   * Capability that defines suppress or not diagnostic output of the IEDriverServer.
   */
  public static final String SILENT = "silent";

  /**
   * Capability that defines launch API of IE used by IEDriverServer.
   */
  public static final String FORCE_CREATE_PROCESS = "ie.forceCreateProcessApi";

  /**
   * Capability that defines to clean or not browser cache before launching IE by IEDriverServer.
   */
  public static final String IE_ENSURE_CLEAN_SESSION = "ie.ensureCleanSession";

  /**
   * Capability that defines setting the proxy information for a single IE process
   * without affecting the proxy settings of other instances of IE.
   */
  public static final String IE_USE_PER_PROCESS_PROXY = "ie.usePerProcessProxy";

  /**
   * @deprecated Use {@link #IE_USE_PER_PROCESS_PROXY} (the one without the typo);
   */
  @Deprecated
  public static final String IE_USE_PRE_PROCESS_PROXY = IE_USE_PER_PROCESS_PROXY;

  /**
   * Capability that defines used IE CLI switches when {@link #FORCE_CREATE_PROCESS} is enabled.
   */
  public static final String IE_SWITCHES = "ie.browserCommandLineSwitches";

  public InternetExplorerDriver() {
    this(null, null);
  }

  public InternetExplorerDriver(InternetExplorerOptions options) {
    this(null, options);
  }

  public InternetExplorerDriver(InternetExplorerDriverService service) {
    this(service, null);
  }

  /**
   * Creates a new InternetExplorerDriver instance with the specified options.
   * The {@code service} will be started along with the driver, and shutdown upon
   * calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param options The options required from InternetExplorerDriver.
   */
  public InternetExplorerDriver(InternetExplorerDriverService service,
                                InternetExplorerOptions options) {
    if (options == null) {
      options = new InternetExplorerOptions();
    }
    if (service == null) {
      service = setupService(options);
    }
    run(service, options);
  }

  @Beta
  public static RemoteWebDriverBuilder builder() {
    return RemoteWebDriver.builder().oneOf(new InternetExplorerOptions());
  }

  private void run(InternetExplorerDriverService service, Capabilities capabilities) {
    assertOnWindows();

    setCommandExecutor(new DriverCommandExecutor(service));

    startSession(capabilities);
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  protected void assertOnWindows() {
    Platform current = Platform.getCurrent();
    if (!current.is(Platform.WINDOWS)) {
      throw new WebDriverException(
          String.format(
              "You appear to be running %s. The IE driver only runs on Windows.", current));
    }
  }

  private InternetExplorerDriverService setupService(Capabilities caps) {
    InternetExplorerDriverService.Builder builder = new InternetExplorerDriverService.Builder();

    if (caps != null) {
      if (caps.getCapability(LOG_FILE) != null) {
        String value = (String) caps.getCapability(LOG_FILE);
        if (value != null) {
          builder.withLogFile(new File(value));
        }
      }

      if (caps.getCapability(LOG_LEVEL) != null) {
        String value = (String) caps.getCapability(LOG_LEVEL);
        if (value != null) {
          builder.withLogLevel(InternetExplorerDriverLogLevel.valueOf(value));
        }
      }

      if (caps.getCapability(HOST) != null) {
        String value = (String) caps.getCapability(HOST);
        if (value != null) {
          builder.withHost(value);
        }
      }

      if (caps.getCapability(EXTRACT_PATH) != null) {
        String value = (String) caps.getCapability(EXTRACT_PATH);
        if (value != null) {
          builder.withExtractPath(new File(value));
        }
      }

      if (caps.getCapability(SILENT) != null) {
        Boolean value = (Boolean) caps.getCapability(SILENT);
        if (value != null) {
          builder.withSilent(value);
        }
      }
    }

    return builder.build();
  }
}
