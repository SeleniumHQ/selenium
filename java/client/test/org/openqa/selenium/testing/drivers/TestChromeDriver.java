/*
Copyright 2011 WebDriver committers
Copyright 2011 Software Freedom Conservancy

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

import com.google.common.base.Throwables;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.IOException;
import java.net.URL;
import java.util.Arrays;

/**
 * Customized RemoteWebDriver that will communicate with a service that lives and dies with the
 * entire test suite. We do not use {@link org.openqa.selenium.chrome.ChromeDriver} since that starts and stops the service
 * with each instance (and that is too expensive for our purposes).
 */
public class TestChromeDriver extends RemoteWebDriver {
  private static ChromeDriverService service;

  public TestChromeDriver() {
    super(chromeWithExtensionsDisabled(null));
  }

  public TestChromeDriver(Capabilities capabilities) {
    super(getServiceUrl(), chromeWithExtensionsDisabled(capabilities));
  }

  private static URL getServiceUrl() {
    if (service == null && !SauceDriver.shouldUseSauce()) {
      service = ChromeDriverService.createDefaultService();
      try {
        service.start();
      } catch (IOException e) {
        throw Throwables.propagate(e);
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

  private static DesiredCapabilities chromeWithExtensionsDisabled(
      Capabilities originalCapabilities) {
    DesiredCapabilities capabilities = DesiredCapabilities.chrome();
    capabilities.setCapability("chrome.switches", Arrays
        .asList("--disable-extensions"));

    if (originalCapabilities != null) {
      capabilities.merge(originalCapabilities);
    }
    
    return capabilities;
  }
}
