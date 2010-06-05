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
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.browserlaunchers.CapabilityType;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.support.events.EventFiringWebDriver;

import java.util.concurrent.Callable;
import java.util.concurrent.Executor;
import java.util.concurrent.FutureTask;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class Session {
  private final WebDriver driver;
  private KnownElements knownElements = new KnownElements();
  private Capabilities capabilities;
  private Executor executor;
  private volatile String base64EncodedImage;

  public Session(final DriverFactory factory, final Capabilities capabilities) throws Exception {
    executor = new ThreadPoolExecutor(1, 1,
                                    600L, TimeUnit.SECONDS,
                                    new LinkedBlockingQueue<Runnable>());

    // Ensure that the browser is created on the single thread.
    FutureTask<WebDriver> createBrowser = new FutureTask<WebDriver>(new Callable<WebDriver>() {
      public WebDriver call() throws Exception {
        WebDriver rawDriver = factory.newInstance(capabilities);
        if (rawDriver instanceof RemoteWebDriver) {
          describe(rawDriver, ((RemoteWebDriver) rawDriver).getCapabilities()); 
        } else {
          describe(rawDriver, capabilities);
        }
        EventFiringWebDriver driver = new EventFiringWebDriver(rawDriver);
        driver.register(new SnapshotScreenListener(Session.this));
        return driver;
      }
    });
    execute(createBrowser);
    this.driver = createBrowser.get();
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
    if (driver instanceof RemoteWebDriver) {
      return ((RemoteWebDriver) driver).getCapabilities();
    }
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

  private void describe(WebDriver instance, Capabilities capabilities) {
    DesiredCapabilities caps = new DesiredCapabilities(capabilities.asMap());
    caps.setJavascriptEnabled(instance instanceof JavascriptExecutor);
    if (instance instanceof TakesScreenshot) {
      caps.setCapability(CapabilityType.TAKES_SCREENSHOT, true);
    }
    if (instance instanceof FindsByCssSelector) {
      caps.setCapability(CapabilityType.SUPPORTS_FINDING_BY_CSS, true);
    }
    this.capabilities = caps;
  }
}
