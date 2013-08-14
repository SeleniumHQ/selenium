/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.testing.drivers;

import com.google.common.base.Supplier;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.UnreachableBrowserException;

public class SauceBackedDriverSupplier implements Supplier<WebDriver> {

  private final Capabilities capabilities;

  public SauceBackedDriverSupplier(Capabilities caps) {
    this.capabilities = caps;
  }

  public WebDriver get() {
    if (!SauceDriver.shouldUseSauce()) {
      return null;
    }

    // Make several attempt to init a driver
    UnreachableBrowserException lastException = null;
    for (int i = 0; i < 3; i++) {
      try {
        SauceDriver driver = new SauceDriver(capabilities);
        driver.setFileDetector(new LocalFileDetector());
        return driver;
      } catch (UnreachableBrowserException ex) {
        lastException = ex;
      }
    }

    // Fallback, all atempts were unsuccessfull
    throw lastException;
  }
}
