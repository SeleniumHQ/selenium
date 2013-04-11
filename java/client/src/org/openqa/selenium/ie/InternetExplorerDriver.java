/*
Copyright 2007-2012 Selenium committers
Portions copyright 2011-2012 Software Freedom Conservancy

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

package org.openqa.selenium.ie;

import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

import java.io.File;

import static org.openqa.selenium.remote.CapabilityType.PROXY;

public class InternetExplorerDriver extends RemoteWebDriver implements TakesScreenshot {

  /**
   * Capability that defines to ignore or not browser zoom level.
   */
  public final static String IGNORE_ZOOM_SETTING_CAPABILITY = "ignoreZoomSetting";

  /**
   * Capability that defines to use native or javascript events during operations..
   */
  public final static String NATIVE_EVENTS_CAPABILITY = "nativeEvents";

  /**
   * Capability that defines to ignore or not browser zoom level.
   */
  public final static String INITIAL_BROWSER_URL_CAPABILITY = "initialBrowserUrl";

  /**
   * Capability that defines initial browser URL.
   */
  public final static String ELEMENT_SCROLL_BEHAVIOR_CAPABILITY = "elementScrollBehavior";

  /**
   * Capability that defines which behaviour will be used if unexpected Alert is found.
   */
  public final static String UNEXPECTED_ALERT_BEHAVIOR_CAPABILITY = "unexpectedAlertBehaviour";

  /**
   * Capability that defines to use or not cleanup of element cache on document loading.
   */
  public final static String ENABLE_ELEMENT_CACHE_CLEANUP_CAPABILITY = "enableElementCacheCleanup";

  /**
   * Capability that defines timeout in milliseconds for attaching to new browser window.
   */
  public final static String BROWSER_ATTACH_TIMEOUT_CAPABILITY = "browserAttachTimeout";

  /**
   * Capability that defines to ignore ot not browser
   * protected mode settings during starting by IEDriverServer.
   *
   * Setting this capability will make your tests unstable and hard to debug.
   */
  public final static String INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS =
      "ignoreProtectedModeSettings";

  /**
   * Capability that defines to use persistent hovering or not.
   */
  public final static String ENABLE_PERSISTENT_HOVERING = "enablePersistentHover";

  /**
   * Capability that defines to focus to browser window or not before operation.
   */
  public final static String REQUIRE_WINDOW_FOCUS = "requireWindowFocus";

  /**
   * Capability that defines the location of the file where IEDriverServer
   * should write log messages to.
   */
  public final static String LOG_FILE_CAPABILITY = "driverLogFile";

  /**
   * Capability that defines the detalization level the IEDriverServer logs.
   */
  public final static String LOG_LEVEL_CAPABILITY = "driverLogLevel";

  /**
   * Capability that defines the address of the host adapter on which
   * the IEDriverServer will listen for commands.
   */
  public final static String HOST_CAPABILITY = "driverHost";

  /**
   * Capability that defines full path to directory to which will be
   * extracted supporting files of the IEDriverServer.
   */
  public final static String EXTRACT_PATH_CAPABILITY = "driverExtractPath";

  /**
   * Capability that defines suppress or not diagnostic output of the IEDriverServer.
   */
  public final static String SILENT_CAPABILITY = "driverSilent";

  /**
   * Capability that defines launch API of IE used by IEDriverServer.
   */
  public final static String FORCE_CREATEPROCESS_CAPABILITY = "driverForceCreateprocess";

  /**
   * Capability that defines used IE CLI switches.
   */
  public final static String IE_SWITCHES_CAPABILITY = "driverIESwitches";

  /**
   * Port which is used by default.
   */
  private final static int DEFAULT_PORT = 0;

  /**
   * Proxy manager.
   */
  private WindowsProxyManager proxyManager;

  public InternetExplorerDriver() {
    int port = DEFAULT_PORT;
    Capabilities capabilities = DesiredCapabilities.internetExplorer();
    InternetExplorerDriverService service = setupService(capabilities, port);
    setupProxy(capabilities);
    run(service, capabilities, port);
  }

  public InternetExplorerDriver(Capabilities capabilities) {
    int port = DEFAULT_PORT;
    InternetExplorerDriverService service = setupService(capabilities, port);
    setupProxy(capabilities);
    run(service, capabilities, port);
  }

  public InternetExplorerDriver(int port) {
    Capabilities capabilities = DesiredCapabilities.internetExplorer();
    InternetExplorerDriverService service = setupService(capabilities, port);
    setupProxy(capabilities);
    run(service, capabilities, port);
  }

  public InternetExplorerDriver(InternetExplorerDriverService service) {
    int port = DEFAULT_PORT;
    Capabilities capabilities = DesiredCapabilities.internetExplorer();
    setupProxy(capabilities);
    run(service, capabilities, port);
  }

  public InternetExplorerDriver(InternetExplorerDriverService service, Capabilities capabilities) {
    int port = DEFAULT_PORT;
    setupProxy(capabilities);
    run(service, capabilities, port);
  }

  public InternetExplorerDriver(WindowsProxyManager proxy, InternetExplorerDriverService service, Capabilities capabilities, int port) {
    proxyManager = proxy;
    run(service, capabilities, port);
  }

  private void run(InternetExplorerDriverService service, Capabilities capabilities, int port) {
    assertOnWindows();

    prepareProxy(capabilities);

    setCommandExecutor(new DriverCommandExecutor(service));

    startSession(capabilities);
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = execute(DriverCommand.SCREENSHOT).getValue().toString();

    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

  protected void assertOnWindows() {
    Platform current = Platform.getCurrent();
    if (!current.is(Platform.WINDOWS)) {
      throw new WebDriverException(
          String.format(
              "You appear to be running %s. The IE driver only runs on Windows.", current));
    }
  }

  private InternetExplorerDriverService setupService(Capabilities caps, int port) {
    try {
      InternetExplorerDriverService.Builder builder = new InternetExplorerDriverService.Builder();
      builder.usingPort(port);

      if (caps != null) {
        if (caps.getCapability(LOG_FILE_CAPABILITY) != null) {
          String value = (String) caps.getCapability(LOG_FILE_CAPABILITY);
          if (value != null) {
            builder.withLogFile(new File(value));
          }
        }

        if (caps.getCapability(LOG_LEVEL_CAPABILITY) != null) {
          String value = (String) caps.getCapability(LOG_LEVEL_CAPABILITY);
          if (value != null) {
            builder.withLogLevel(InternetExplorerDriverLogLevel.valueOf(value));
          }
        }

        if (caps.getCapability(HOST_CAPABILITY) != null) {
          String value = (String) caps.getCapability(HOST_CAPABILITY);
          if (value != null) {
            builder.withHost(value);
          }
        }

        if (caps.getCapability(EXTRACT_PATH_CAPABILITY) != null) {
          String value = (String) caps.getCapability(EXTRACT_PATH_CAPABILITY);
          if (value != null) {
            builder.withExtractPath(new File(value));
          }
        }

        if (caps.getCapability(SILENT_CAPABILITY) != null) {
          Boolean value = (Boolean) caps.getCapability(SILENT_CAPABILITY);
          if (value != null) {
            builder.withSilent(value);
          }
        }

        if (caps.getCapability(FORCE_CREATEPROCESS_CAPABILITY) != null) {
          Boolean value = (Boolean) caps.getCapability(FORCE_CREATEPROCESS_CAPABILITY);
          if (value != null) {
            builder.withLaunchApi(value);
          }
        }

        if (caps.getCapability(IE_SWITCHES_CAPABILITY) != null) {
          String value = (String) caps.getCapability(IE_SWITCHES_CAPABILITY);
          if (value != null) {
            builder.withIeSwitches(value);
          }
        }
      }

      InternetExplorerDriverService service = builder.build();

      return service;

    } catch (IllegalStateException ex) {
      throw Throwables.propagate(ex);
    }
  }

  private void setupProxy(Capabilities caps) {
    if (caps == null || caps.getCapability(PROXY) == null) {
      return;
    }

    proxyManager = new WindowsProxyManager(
      /* boolean customPACappropriate */ true,
      /* String sessionId */ "webdriver-ie",
      /* int port */ 0,
      /* int portDriversShouldContact */ 0);
  }

  private void prepareProxy(Capabilities caps) {
    if (caps == null || caps.getCapability(PROXY) == null) {
      return;
    }

    // Because of the way that the proxying is currently implemented,
    // we can only set a single host.
    proxyManager.backupRegistrySettings();
    proxyManager.changeRegistrySettings(caps);

    Thread cleanupThread = new Thread() { // Thread safety reviewed
      @Override
      public void run() {
        proxyManager.restoreRegistrySettings(true);
      }
    };
    Runtime.getRuntime().addShutdownHook(cleanupThread);
  }
}