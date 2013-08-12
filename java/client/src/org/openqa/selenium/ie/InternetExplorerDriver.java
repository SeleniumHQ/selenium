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

import com.google.common.base.Predicate;
import com.google.common.base.Throwables;
import com.google.common.collect.Maps;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.WindowsProxyManager;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

import static org.openqa.selenium.remote.CapabilityType.PROXY;

public class InternetExplorerDriver extends RemoteWebDriver implements TakesScreenshot {

  /**
   * Capability that defines to ignore or not browser zoom level.
   */
  public final static String IGNORE_ZOOM_SETTING = "ignoreZoomSetting";

  /**
   * Capability that defines to use native or javascript events during operations..
   */
  public final static String NATIVE_EVENTS = "nativeEvents";

  /**
   * Capability that defines to ignore or not browser zoom level.
   */
  public final static String INITIAL_BROWSER_URL = "initialBrowserUrl";

  /**
   * Capability that defines initial browser URL.
   */
  public final static String ELEMENT_SCROLL_BEHAVIOR = "elementScrollBehavior";

  /**
   * Capability that defines which behaviour will be used if unexpected Alert is found.
   */
  public final static String UNEXPECTED_ALERT_BEHAVIOR = "unexpectedAlertBehaviour";

  /**
   * Capability that defines to use or not cleanup of element cache on document loading.
   */
  public final static String ENABLE_ELEMENT_CACHE_CLEANUP = "enableElementCacheCleanup";

  /**
   * Capability that defines timeout in milliseconds for attaching to new browser window.
   */
  public final static String BROWSER_ATTACH_TIMEOUT = "browserAttachTimeout";

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
  public final static String LOG_FILE = "logFile";

  /**
   * Capability that defines the detalization level the IEDriverServer logs.
   */
  public final static String LOG_LEVEL = "logLevel";

  /**
   * Capability that defines the address of the host adapter on which
   * the IEDriverServer will listen for commands.
   */
  public final static String HOST = "host";

  /**
   * Capability that defines full path to directory to which will be
   * extracted supporting files of the IEDriverServer.
   */
  public final static String EXTRACT_PATH = "extractPath";

  /**
   * Capability that defines suppress or not diagnostic output of the IEDriverServer.
   */
  public final static String SILENT = "silent";

  /**
   * Capability that defines launch API of IE used by IEDriverServer.
   */
  public final static String FORCE_CREATE_PROCESS = "ie.forceCreateProcessApi";

  /**
   * Capability that defines to clean browser cache before launching IE by IEDriverServer.
   */
  public final static String IE_ENSURE_CLEAN_SESSION = "ie.ensureCleanSession";

  /**
   * Capability that defines setting the proxy information for a single IE process
   * without affecting the proxy settings of other instances of IE.
   */
  public final static String IE_USE_PRE_PROCESS_PROXY = "ie.usePerProcessProxy";

  /**
   * Capability that defines used IE CLI switches.
   */
  public final static String IE_SWITCHES = "ie.browserCommandLineSwitches";

  /**
   * @deprecated please set this option as True and allow IEDriverServer sets up proxy.
   * In next releases it will be set to True by default.
   *
   * Capability that defines used proxy setter. Currently it's False by default.
   *
   * False means WindowsProxyManager will be used for setting proxy settings.
   * True means IEDriverServer will be used for setting proxy settings.
   *
   * Be note that using both variants in concurrent drivers at the same node
   * may lead to undefined behaviour.
   */
  @Deprecated
  public final static String IE_SET_PROXY_BY_SERVER = "ie.setProxyByServer";

  /**
   * Port which is used by default.
   */
  private final static int DEFAULT_PORT = 0;

  /**
   * To set proxy by server or not.
   */
  private final boolean setProxyByServer;

  /**
   * Proxy manager.
   */
  private WindowsProxyManager proxyManager;

  public InternetExplorerDriver() {
    this(null, null, null, DEFAULT_PORT);
  }

  public InternetExplorerDriver(Capabilities capabilities) {
    this(null, null, capabilities, DEFAULT_PORT);
  }

  public InternetExplorerDriver(int port) {
    this(null, null, null, port);
  }

  public InternetExplorerDriver(InternetExplorerDriverService service) {
    this(null, service, null, DEFAULT_PORT);
  }

  public InternetExplorerDriver(InternetExplorerDriverService service, Capabilities capabilities) {
    this(null, service, capabilities, DEFAULT_PORT);
  }

  public InternetExplorerDriver(WindowsProxyManager proxy, InternetExplorerDriverService service, Capabilities capabilities, int port) {
    if (capabilities == null) {
      capabilities = DesiredCapabilities.internetExplorer();
    }

    setProxyByServer = useServerForProxy(capabilities);

    if (proxy == null) {
      proxyManager = setupProxy(capabilities);
    } else {
      proxyManager = proxy;
    }
    if (service == null) {
      service = setupService(capabilities, port);
    }
    run(service, capabilities, port);
  }

  private void run(InternetExplorerDriverService service, Capabilities capabilities, int port) {
    assertOnWindows();

    prepareProxy(capabilities);

    setCommandExecutor(new DriverCommandExecutor(service));

    startSession(updateCapabilities(capabilities));
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

      InternetExplorerDriverService service = builder.build();

      return service;

    } catch (IllegalStateException ex) {
      throw Throwables.propagate(ex);
    }
  }

  private WindowsProxyManager setupProxy(Capabilities caps) {
    // do not create proxy manager if it's not requested. see issue 4135
    // also do not create proxy manager if it will be managed by server.
    if (caps == null || caps.getCapability(PROXY) == null || setProxyByServer) {
      return null;
    }

    return new WindowsProxyManager(
      /* boolean customPACappropriate */ true,
      /* String sessionId */ "webdriver-ie",
      /* int port */ 0,
      /* int portDriversShouldContact */ 0);
  }

  private void prepareProxy(Capabilities caps) {
    // do not prepare proxy manager if it will be managed by server.
    if (caps == null || caps.getCapability(PROXY) == null || setProxyByServer) {
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

  /**
   * Determine to use server for setting proxy or not.
   *
   * @param caps capabilties
   * @return to use or not
   */
  private boolean useServerForProxy(Capabilities caps) {
    if (caps == null || caps.getCapability(IE_SET_PROXY_BY_SERVER) == null) {
      return false;
    }

    return (Boolean) caps.getCapability(IE_SET_PROXY_BY_SERVER);
  }

  /**
   * if proxy will be not managed by server overwrite proxy capability so
   * server will do nothing.
   */
  private Capabilities updateCapabilities(Capabilities capabilities) {
    if (capabilities == null || capabilities.getCapability(PROXY) == null || setProxyByServer) {
      return capabilities;
    }

    Proxy proxy = new Proxy();
    proxy.setProxyType(Proxy.ProxyType.SYSTEM);
    ((DesiredCapabilities) capabilities).setCapability(PROXY, proxy);

    return capabilities;
  }

}