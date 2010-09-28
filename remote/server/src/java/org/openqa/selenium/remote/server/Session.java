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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Platform;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.browserlaunchers.CapabilityType;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.html5.DatabaseStorage;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.events.EventFiringWebDriver;

import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class Session {
  private final EventFiringWebDriver driver;
  private final KnownElements knownElements;
  private final ThreadPoolExecutor executor;
  private final Capabilities capabilities;
  private volatile String base64EncodedImage;
  private final BrowserCreator browserCreator;



  public Session(final DriverFactory factory, final Capabilities capabilities) throws Exception {
    this.knownElements = new KnownElements();
    browserCreator = new BrowserCreator(factory, capabilities);
    final FutureTask<EventFiringWebDriver> webDriverFutureTask =
        new FutureTask<EventFiringWebDriver>(browserCreator);
    executor = new ThreadPoolExecutor(1, 1,
                                    600L, TimeUnit.SECONDS,
                                    new LinkedBlockingQueue<Runnable>());

    // Ensure that the browser is created on the single thread.
    this.driver = execute(webDriverFutureTask);
    this.capabilities = browserCreator.getCapabilityDescription();
  }

  public void close(){
    executor.shutdown();
  }

  public <X> X execute(FutureTask<X> future) throws Exception {
    executor.execute(future);
    return future.get();
  }

  public WebDriver getDriver() {
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
      EventFiringWebDriver wrappedDriver = new EventFiringWebDriver(rawDriver);
      if (!isAndroid) {
      	wrappedDriver.register(new SnapshotScreenListener(Session.this));
      }
      return wrappedDriver;
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
      } else if (instance instanceof DatabaseStorage) {
        caps.setCapability(CapabilityType.SUPPORTS_SQL_DATABASE, true);
      } else if (instance instanceof LocationContext) {
        caps.setCapability(CapabilityType.SUPPORTS_LOCATION_CONTEXT, true);
      } else if (instance instanceof ApplicationCache) {
        caps.setCapability(CapabilityType.SUPPORTS_APPLICATION_CACHE, true);
      } else if (instance instanceof BrowserConnection) {
        caps.setCapability(CapabilityType.SUPPORTS_BROWSER_CONNECTION, true);
      } else if (instance instanceof WebStorage) {
        caps.setCapability(CapabilityType.SUPPORTS_WEB_STORAGE, true);
      }
      if (instance instanceof FindsByCssSelector) {
        caps.setCapability(CapabilityType.SUPPORTS_FINDING_BY_CSS, true);
      }
      return caps;
    }
  }

}
