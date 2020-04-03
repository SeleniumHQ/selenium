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

package org.openqa.selenium.remote.server;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.mobile.NetworkConnection;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.support.events.EventFiringWebDriver;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;

/**
 * The default session implementation.
 *
 * Thread safety notes:
 *
 * There are basically two different thread types rummaging around in this class: Container listener
 * threads which deliver requests, and the "executor" thread that processes each request. This means
 * there is a minefield of thread constraints/guards, some of which are described in docs for each
 * field.
 */

public class DefaultSession implements Session {

  private static final String QUIET_EXCEPTIONS_KEY = "webdriver.remote.quietExceptions";
  private final SessionId sessionId;
  private final WebDriver driver;
  /**
   * The cache of known elements.
   *
   * Happens-before the executor and is thereafter thread-confined to the executor thread.
   */
  private final KnownElements knownElements;
  private final Map<String, Object> capabilities;
  // elements inside capabilities.
  private volatile String base64EncodedImage;
  private TemporaryFilesystem tempFs;

  public static Session createSession(
      DriverFactory factory,
      TemporaryFilesystem tempFs,
      Capabilities capabilities) {
    return new DefaultSession(factory, tempFs, capabilities);
  }

  private DefaultSession(
      final DriverFactory factory,
      TemporaryFilesystem tempFs,
      final Capabilities capabilities) {
    this.knownElements = new KnownElements();
    this.tempFs = tempFs;
    final BrowserCreator browserCreator = new BrowserCreator(factory, capabilities);

    // Ensure that the browser is created on the single thread.
    EventFiringWebDriver initialDriver = browserCreator.call();

    if (!isQuietModeEnabled(browserCreator, capabilities)) {
      // Memo to self; this is not a constructor escape of "this" - probably ;)
      initialDriver.register(new SnapshotScreenListener(this));
    }

    this.driver = initialDriver;
    this.capabilities = browserCreator.getCapabilityDescription();
    this.sessionId = browserCreator.getSessionId();
  }

  private static boolean isQuietModeEnabled(
      BrowserCreator browserCreator,
      Capabilities capabilities) {
    if (browserCreator.isAndroid()) {
      return true;
    }
    boolean propertySaysQuiet = "true".equalsIgnoreCase(System.getProperty(QUIET_EXCEPTIONS_KEY));
    if (capabilities == null) {
      return propertySaysQuiet;
    }
    if (capabilities.is(QUIET_EXCEPTIONS_KEY)) {
      return true;
    }
    Object cap = capabilities.asMap().get(QUIET_EXCEPTIONS_KEY);
    boolean isExplicitlyDisabledByCapability = cap != null && "false".equalsIgnoreCase(cap.toString());
    return propertySaysQuiet && !isExplicitlyDisabledByCapability;
  }

  @Override
  public void close() {
    try {
      WebDriver driver = getDriver();
      if (driver != null) {
        driver.close();
      }
    } catch (RuntimeException e) {
      // At least we tried.
    }

    if (tempFs != null) {
      tempFs.deleteTemporaryFiles();
      tempFs.deleteBaseDir();
      tempFs = null;
    }
  }

  @Override
  public WebDriver getDriver() {
    return driver;
  }

  @Override
  public KnownElements getKnownElements() {
    return knownElements;
  }

  @Override
  public Map<String, Object> getCapabilities() {
    return capabilities;
  }

  @Override
  public void attachScreenshot(String base64EncodedImage) {
    this.base64EncodedImage = base64EncodedImage;
  }

  @Override
  public String getAndClearScreenshot() {
    String temp = this.base64EncodedImage;
    base64EncodedImage = null;
    return temp;
  }

  private class BrowserCreator implements Callable<EventFiringWebDriver> {

    private final DriverFactory factory;
    private final Capabilities capabilities;
    private volatile Map<String, Object> describedCapabilities;
    private volatile SessionId sessionId;
    private volatile boolean isAndroid = false;

    BrowserCreator(DriverFactory factory, Capabilities capabilities) {
      this.factory = factory;
      this.capabilities = capabilities;
    }

    @Override
    public EventFiringWebDriver call() {
      WebDriver rawDriver = factory.newInstance(capabilities);
      Capabilities actualCapabilities = capabilities;
      if (rawDriver instanceof HasCapabilities) {
        actualCapabilities = ((HasCapabilities) rawDriver).getCapabilities();
        isAndroid = actualCapabilities.getPlatform().is(Platform.ANDROID);
      }
      describedCapabilities = getDescription(rawDriver, actualCapabilities);
      if (rawDriver instanceof RemoteWebDriver) {
        sessionId = ((RemoteWebDriver) rawDriver).getSessionId();
      } else {
        sessionId = new SessionId(UUID.randomUUID().toString());
      }
      return new EventFiringWebDriver(rawDriver);
    }

    public Map<String, Object> getCapabilityDescription() {
      return describedCapabilities;
    }

    public SessionId getSessionId() {
      return sessionId;
    }

    public boolean isAndroid() {
      return isAndroid;
    }

    private Map<String, Object> getDescription(WebDriver instance, Capabilities capabilities) {
      DesiredCapabilities caps = new DesiredCapabilities(capabilities.asMap());
      caps.setJavascriptEnabled(instance instanceof JavascriptExecutor);
      if (instance instanceof TakesScreenshot) {
        caps.setCapability(CapabilityType.TAKES_SCREENSHOT, true);
      }
      if (instance instanceof LocationContext) {
        caps.setCapability(CapabilityType.SUPPORTS_LOCATION_CONTEXT, true);
      }
      if (instance instanceof ApplicationCache) {
        caps.setCapability(CapabilityType.SUPPORTS_APPLICATION_CACHE, true);
      }
      if (instance instanceof NetworkConnection) {
        caps.setCapability(CapabilityType.SUPPORTS_NETWORK_CONNECTION, true);
      }
      if (instance instanceof WebStorage) {
        caps.setCapability(CapabilityType.SUPPORTS_WEB_STORAGE, true);
      }
      if (instance instanceof FindsByCssSelector) {
        caps.setCapability(CapabilityType.SUPPORTS_FINDING_BY_CSS, true);
      }
      if (instance instanceof Rotatable) {
        caps.setCapability(CapabilityType.ROTATABLE, true);
      }
      if (instance instanceof HasTouchScreen) {
        caps.setCapability(CapabilityType.HAS_TOUCHSCREEN, true);
      }
      return caps.asMap();
    }
  }

  @Override
  public SessionId getSessionId() {
    return sessionId;
  }

  @Override
  public TemporaryFilesystem getTemporaryFileSystem() {
    return tempFs;
  }

}
