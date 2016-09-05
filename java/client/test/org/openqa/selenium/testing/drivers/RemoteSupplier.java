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

import com.google.common.base.Supplier;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.IOException;

public class RemoteSupplier implements Supplier<WebDriver> {

  private static OutOfProcessSeleniumServer server = new OutOfProcessSeleniumServer();
  private static volatile boolean started;
  private Capabilities desiredCapabilities;
  private Capabilities requiredCapabilities;

  public RemoteSupplier(Capabilities desiredCapabilities,
      Capabilities requiredCapabilities) {
    this.desiredCapabilities = desiredCapabilities;
   this.requiredCapabilities = requiredCapabilities;
  }

  public WebDriver get() {
    if (desiredCapabilities == null || !Boolean.getBoolean("selenium.browser.remote")) {
      return null;
    }

    if (!started) {
      startServer();
    }

    RemoteWebDriver driver = new RemoteWebDriver(
        server.getWebDriverUrl(), desiredCapabilities, requiredCapabilities);
    driver.setFileDetector(new LocalFileDetector());
    return driver;
  }

  private synchronized  void startServer() {
    if (started) {
      return;
    }

    try {
      server.start();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    started = true;
  }
}
