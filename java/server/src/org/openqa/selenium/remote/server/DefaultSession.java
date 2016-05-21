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

import com.google.common.annotations.VisibleForTesting;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.mobile.NetworkConnection;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.support.events.EventFiringWebDriver;

import java.io.File;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

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
   * Happens-before the exexutor and is thereafter thread-confined to the executor thread.
   */
  private final KnownElements knownElements;
  private final ThreadPoolExecutor executor;
  private final Capabilities capabilities; // todo: Investigate memory model implications of map
  private final Clock clock;
  // elements inside capabilities.
  private volatile String base64EncodedImage;
  private volatile long lastAccess;
  private volatile Thread inUseWithThread = null;
  private TemporaryFilesystem tempFs;

  // This method is to avoid constructor escape of partially constructed session object
  public static Session createSession(DriverFactory factory, SessionId sessionId,
                                      Capabilities capabilities) throws Exception {
    return createSession(factory, new SystemClock(), sessionId, capabilities);
  }

  // This method is to avoid constructor escape of partially constructed session object
  public static Session createSession(DriverFactory factory, Clock clock, SessionId sessionId,
                                      Capabilities capabilities) throws Exception {
    File tmpDir = new File(System.getProperty("java.io.tmpdir"), sessionId.toString());
    if (!tmpDir.mkdir()) {
      throw new WebDriverException("Cannot create temp directory: " + tmpDir);
    }
    TemporaryFilesystem tempFs = TemporaryFilesystem.getTmpFsBasedOn(tmpDir);

    return new DefaultSession(factory, tempFs, clock, sessionId, capabilities);
  }

  @VisibleForTesting
  public static Session createSession(DriverFactory factory, TemporaryFilesystem tempFs, Clock clock,
                                      SessionId sessionId, Capabilities capabilities)
      throws Exception {
    return new DefaultSession(factory, tempFs, clock, sessionId, capabilities);
  }

  private DefaultSession(final DriverFactory factory, TemporaryFilesystem tempFs, Clock clock,
                         SessionId sessionId, final Capabilities capabilities) throws Exception {
    this.knownElements = new KnownElements();
    this.sessionId = sessionId;
    this.tempFs = tempFs;
    this.clock = clock;
    final BrowserCreator browserCreator = new BrowserCreator(factory, capabilities);
    final FutureTask<EventFiringWebDriver> webDriverFutureTask =
        new FutureTask<>(browserCreator);
    executor = new ThreadPoolExecutor(1, 1,
                                      600L, TimeUnit.SECONDS,
                                      new LinkedBlockingQueue<Runnable>());

    // Ensure that the browser is created on the single thread.
    EventFiringWebDriver initialDriver = execute(webDriverFutureTask);

    if (!isQuietModeEnabled(browserCreator, capabilities)) {
      // Memo to self; this is not a constructor escape of "this" - probably ;)
      initialDriver.register(new SnapshotScreenListener(this));
    }

    this.driver = initialDriver;
    this.capabilities = browserCreator.getCapabilityDescription();
    updateLastAccessTime();
  }

  private static boolean isQuietModeEnabled(BrowserCreator browserCreator, Capabilities capabilities) {
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

  /**
   * Touches the session.
   */
  public void updateLastAccessTime() {
    lastAccess = clock.now();
  }

  public boolean isTimedOut(long timeout) {
    return timeout > 0 && (lastAccess + timeout) < clock.now();
  }

  public void close() {
    executor.shutdown();
    if (tempFs != null) {
      tempFs.deleteTemporaryFiles();
      tempFs.deleteBaseDir();
    }
  }


  public <X> X execute(final FutureTask<X> future) throws Exception {
/*    if (executor.isShutdown()) {
         throw new WebDriverException(sessionId + " is closed for further execution");
    } */
    executor.execute(new Runnable() {
      public void run() {
        inUseWithThread = Thread.currentThread();
        inUseWithThread.setName("Session " + sessionId + " processing inside browser");
        try {
          future.run();
        } finally {
          inUseWithThread = null;
          Thread.currentThread().setName("Session " + sessionId + " awaiting client");
        }
      }
    });
    return future.get();
  }

  public WebDriver getDriver() {
    updateLastAccessTime();
    return driver;
  }

  public KnownElements getKnownElements() {
    return knownElements;
  }

  public Capabilities getCapabilities() {
    return capabilities;
  }

  public void attachScreenshot(String base64EncodedImage) {
    this.base64EncodedImage = base64EncodedImage;
  }

  public String getAndClearScreenshot() {
    String temp = this.base64EncodedImage;
    base64EncodedImage = null;
    return temp;
  }

  private class BrowserCreator implements Callable<EventFiringWebDriver> {

    private final DriverFactory factory;
    private final Capabilities capabilities;
    private volatile Capabilities describedCapabilities;
    private volatile boolean isAndroid = false;

    BrowserCreator(DriverFactory factory, Capabilities capabilities) {
      this.factory = factory;
      this.capabilities = capabilities;
    }

    public EventFiringWebDriver call() throws Exception {
      WebDriver rawDriver = factory.newInstance(capabilities);
      Capabilities actualCapabilities = capabilities;
      if (rawDriver instanceof HasCapabilities) {
        actualCapabilities = ((HasCapabilities) rawDriver).getCapabilities();
        isAndroid = actualCapabilities.getPlatform().is(Platform.ANDROID);
      }
      describedCapabilities = getDescription(rawDriver, actualCapabilities);
      return new EventFiringWebDriver(rawDriver);
    }

    public Capabilities getCapabilityDescription() {
      return describedCapabilities;
    }

    public boolean isAndroid() {
      return isAndroid;
    }

    private DesiredCapabilities getDescription(WebDriver instance, Capabilities capabilities) {
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
      return caps;
    }
  }

  public SessionId getSessionId() {
    return sessionId;
  }

  public TemporaryFilesystem getTemporaryFileSystem() {
    return tempFs;
  }

  public boolean isInUse() {
    return inUseWithThread != null;
  }

  public void interrupt() {
    Thread threadToStop = inUseWithThread;
    if (threadToStop != null) {
      synchronized (threadToStop) {
        threadToStop.interrupt();
      }
    }
  }
}
