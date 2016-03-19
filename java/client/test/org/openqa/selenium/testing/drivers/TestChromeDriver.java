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
import org.openqa.selenium.OutputType;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.File;
import java.io.IOException;
import java.net.URL;

/**
 * Customized RemoteWebDriver that will communicate with a service that lives and dies with the
 * entire test suite. We do not use {@link org.openqa.selenium.chrome.ChromeDriver} since that starts and stops the service
 * with each instance (and that is too expensive for our purposes).
 */
public class TestChromeDriver extends RemoteWebDriver {
  private static ChromeDriverService service;

  public TestChromeDriver() {
    super(chromeWithCustomCapabilities(null));
  }

  public TestChromeDriver(Capabilities capabilities) {
    super(getServiceUrl(), chromeWithCustomCapabilities(capabilities));
  }

  private static URL getServiceUrl() {
    if (service == null && !SauceDriver.shouldUseSauce()) {
      service = ChromeDriverService.createDefaultService();
      try {
        service.start();
      } catch (IOException e) {
        throw new RuntimeException(e);
      }

      // Fugly.
      Runtime.getRuntime().addShutdownHook(new Thread() {
        @Override
        public void run() {
          service.stop();
        }
      });
    }
    return service.getUrl();
  }

  private static DesiredCapabilities chromeWithCustomCapabilities(
      Capabilities originalCapabilities) {
    ChromeOptions options = new ChromeOptions();
    options.addArguments("disable-extensions");
    String chromePath = System.getProperty("webdriver.chrome.binary");
    if (chromePath != null) {
      options.setBinary(new File(chromePath));
    }

    DesiredCapabilities capabilities = DesiredCapabilities.chrome();
    capabilities.setCapability(ChromeOptions.CAPABILITY, options);

    if (originalCapabilities != null) {
      capabilities.merge(originalCapabilities);
    }

    return capabilities;
  }

  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

}
