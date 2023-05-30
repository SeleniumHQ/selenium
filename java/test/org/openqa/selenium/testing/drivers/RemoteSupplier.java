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

import java.net.MalformedURLException;
import java.net.URL;
import java.util.function.Supplier;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.Augmenter;
import org.openqa.selenium.remote.LocalFileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;

class RemoteSupplier implements Supplier<WebDriver> {

  private static OutOfProcessSeleniumServer server = new OutOfProcessSeleniumServer();
  private static volatile boolean started;
  private Capabilities desiredCapabilities;

  public RemoteSupplier(Capabilities desiredCapabilities) {
    this.desiredCapabilities = desiredCapabilities;
  }

  @Override
  public WebDriver get() {
    if (desiredCapabilities == null || !Boolean.getBoolean("selenium.browser.remote")) {
      return null;
    }

    String externalServer = System.getProperty("selenium.externalServer");
    URL serverUrl;
    if (externalServer != null) {
      try {
        serverUrl = new URL(externalServer);
      } catch (MalformedURLException e) {
        throw new RuntimeException(e);
      }
    } else {
      if (!started) {
        startServer();
      }
      serverUrl = server.getWebDriverUrl();
    }

    RemoteWebDriver driver = new RemoteWebDriver(serverUrl, desiredCapabilities);
    driver.setFileDetector(new LocalFileDetector());
    return new Augmenter().augment(driver);
  }

  private synchronized void startServer() {
    if (started) {
      return;
    }
    server.start("standalone", "--selenium-manager", "true");
    started = true;
  }
}
