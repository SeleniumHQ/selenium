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

import static org.openqa.selenium.remote.CapabilityType.PROXY;

public class InternetExplorerDriver extends RemoteWebDriver implements TakesScreenshot {

  /**
   * Setting this capability will make your tests unstable and hard to debug.
   */
  public final static String INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS =
      "ignoreProtectedModeSettings";

  private WindowsProxyManager proxyManager;

  public InternetExplorerDriver() {
    assertOnWindows();

    setup(DesiredCapabilities.internetExplorer(), 0);
  }

  public InternetExplorerDriver(Capabilities capabilities) {
    assertOnWindows();

    proxyManager = new WindowsProxyManager(true, "webdriver-ie", 0, 0);
    prepareProxy(capabilities);
    setup(capabilities, 0);
  }

  public InternetExplorerDriver(int port) {
    assertOnWindows();

    setup(DesiredCapabilities.internetExplorer(), port);
  }

  public InternetExplorerDriver(InternetExplorerDriverService service) {
    this(service, DesiredCapabilities.internetExplorer());
  }

  public InternetExplorerDriver(InternetExplorerDriverService service, Capabilities capabilities) {
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

  private void setup(Capabilities capabilities, int port) {
    setupService(port);
    startSession(capabilities);
  }

  private void setupService(int port) {
    try {
      InternetExplorerDriverService service = new InternetExplorerDriverService.Builder()
        .usingPort(port).build();
      setCommandExecutor(new DriverCommandExecutor(service));
    } catch (IllegalStateException ex) {
      throw Throwables.propagate(ex);
    }
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
