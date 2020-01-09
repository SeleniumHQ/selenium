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
import org.openqa.selenium.opera.OperaDriverService;
import org.openqa.selenium.opera.OperaOptions;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.io.File;
import java.io.IOException;
import java.net.URL;

/**
 * Customized RemoteWebDriver that will communicate with a service that lives and dies with the
 * entire test suite. We do not use {@link org.openqa.selenium.opera.OperaDriver} since that starts and stops the service
 * with each instance (and that is too expensive for our purposes).
 */
public class TestOperaBlinkDriver extends RemoteWebDriver {
  private static OperaDriverService service;

  public TestOperaBlinkDriver(Capabilities capabilities) {
    super(getServiceUrl(), operaWithCustomCapabilities(capabilities));
  }

  private static URL getServiceUrl() {
    if (service == null) {
      service = OperaDriverService.createDefaultService();
      try {
        service.start();
      } catch (IOException e) {
        throw new RuntimeException(e);
      }

      // Fugly.
      Runtime.getRuntime().addShutdownHook(new Thread(() -> service.stop()));
    }
    return service.getUrl();
  }

  private static Capabilities operaWithCustomCapabilities(Capabilities originalCapabilities) {
    OperaOptions options = new OperaOptions();
    options.addArguments("disable-extensions");
    String operaPath = System.getProperty("webdriver.opera.binary");
    if (operaPath != null) {
      options.setBinary(new File(operaPath));
    }

    if (originalCapabilities != null) {
      options.merge(originalCapabilities);
    }

    return options;
  }

  @Override
  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

}
