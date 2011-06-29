/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote.server;

import java.util.Iterator;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.html5.DatabaseStorage;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.support.events.EventFiringWebDriver;
import sun.misc.Service;

/**
 * The default session implementation.
 *
 * Thread safety notes:
 *
 * There are basically two different thread types rummaging around in this class:
 * Container listener threads which deliver requests, and the "executor" thread that
 * processes each request. This means there is a minefield of thread constraints/guards,
 * some of which are described in docs for each field.
 */

public class DefaultSession implements Session {
  private final SessionId sessionId;
  private final WebDriver driver;
    /**
     * The cache of known elements.
     *
     * Happens-before the exexutor and is thereafter thread-confined to the executor thread.
     */
  private final KnownElements knownElements;
  private final ThreadPoolExecutor executor;
  private final Capabilities capabilities; // todo: Investigate memory model implications of map elements inside capabilities.
  private volatile String base64EncodedImage;
  private volatile long lastAccess;
  private final BrowserCreator browserCreator;

  //This method is to avoid constructor escape of partially constructed session object
  public static Session createSession(final DriverFactory factory,
                                      SessionId sessionId, final Capabilities capabilities) throws Exception {
      return new DefaultSession(factory, sessionId, capabilities);
  }

  private DefaultSession(final DriverFactory factory, SessionId sessionId, final Capabilities capabilities) throws Exception {
    this.knownElements = new KnownElements();
    this.sessionId = sessionId;
    browserCreator = new BrowserCreator(factory, capabilities);
    final FutureTask<EventFiringWebDriver> webDriverFutureTask =
        new FutureTask<EventFiringWebDriver>(browserCreator);
    executor = new ThreadPoolExecutor(1, 1,
                                    600L, TimeUnit.SECONDS,
                                    new LinkedBlockingQueue<Runnable>());

    // Ensure that the browser is created on the single thread.
    EventFiringWebDriver initialDriver = execute(webDriverFutureTask);

    if (!browserCreator.isAndroid()){
      // Memo to self; this is not a constructor escape of "this" - probably ;)
      initialDriver.register(new SnapshotScreenListener(this));
    }

    this.driver = postProcess(initialDriver);
    this.capabilities = browserCreator.getCapabilityDescription();
    updateLastAccessTime();
  }

    private WebDriver postProcess(WebDriver initialDriver )
    {
       @SuppressWarnings( { "unchecked" } )
       Iterator<WebDriverPostProcessor> ps = Service.providers(WebDriverPostProcessor.class);
       WebDriver result = initialDriver;
       while (ps.hasNext()) {
           WebDriverPostProcessor postProcessor = ps.next();
           result = postProcessor.transform(result);
       }
       return result;
    }


    /**
   * Touches the session.
   */
  public void updateLastAccessTime() {
    lastAccess = System.currentTimeMillis();
  }

  public boolean isTimedOut(int timeout){
     return (lastAccess + timeout) < System.currentTimeMillis();
  }

  public void close(){
    executor.shutdown();
  }

  public <X> X execute(FutureTask<X> future) throws Exception {
    executor.execute(future);
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
      if (rawDriver instanceof RemoteWebDriver) {
        actualCapabilities = ((RemoteWebDriver) rawDriver).getCapabilities();
        isAndroid = actualCapabilities.getPlatform().is(Platform.ANDROID);
      }
      describedCapabilities = getDescription( rawDriver, actualCapabilities);
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
      if (instance instanceof DatabaseStorage) {
        caps.setCapability(CapabilityType.SUPPORTS_SQL_DATABASE, true);
      }
      if (instance instanceof LocationContext) {
        caps.setCapability(CapabilityType.SUPPORTS_LOCATION_CONTEXT, true);
      }
      if (instance instanceof ApplicationCache) {
        caps.setCapability(CapabilityType.SUPPORTS_APPLICATION_CACHE, true);
      }
      if (instance instanceof BrowserConnection) {
        caps.setCapability(CapabilityType.SUPPORTS_BROWSER_CONNECTION, true);
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
      return caps;
    }
  }

    public SessionId getSessionId() {
        return sessionId;
    }
}
