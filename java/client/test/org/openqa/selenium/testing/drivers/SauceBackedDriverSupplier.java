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

package org.openqa.selenium.testing.drivers;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.UnreachableBrowserException;

import java.util.function.Supplier;

public class SauceBackedDriverSupplier implements Supplier<WebDriver> {

  private final Capabilities capabilities;

  public SauceBackedDriverSupplier(Capabilities caps) {
    this.capabilities = caps;
  }

  @Override
  public WebDriver get() {
    if (!SauceDriver.shouldUseSauce()) {
      return null;
    }

    // Make several attempt to init a driver
    UnreachableBrowserException lastException = null;
    for (int i = 0; i < 3; i++) {
      System.out.println("Attempt to start a new session " + i);
      try {
        SauceDriver driver = new SauceDriver(capabilities);
        driver.setFileDetector(new LocalFileDetector());
        System.out.println("Session started");
        return driver;
      } catch (UnreachableBrowserException ex) {
        System.out.println("Session is not started " + ex.getMessage());
        lastException = ex;
        try {
          System.out.println("Waiting 5 sec before the next attempt");
          Thread.sleep(5000);
        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
          throw new RuntimeException(e);
        }
      }
    }

    // Fallback, all atempts were unsuccessfull
    throw lastException;
  }
}
