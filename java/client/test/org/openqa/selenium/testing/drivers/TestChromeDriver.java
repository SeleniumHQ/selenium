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
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.DriverCommand;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

/**
 * Customized RemoteWebDriver that will communicate with a service that lives and dies with the
 * entire test suite. We do not use {@link org.openqa.selenium.chrome.ChromeDriver} since that starts and stops the service
 * with each instance (and that is too expensive for our purposes).
 */
public class TestChromeDriver extends ChromeDriver {
  private final static Logger LOG = Logger.getLogger(TestChromeDriver.class.getName());

  public TestChromeDriver(Capabilities capabilities) {
    super(getService(), chromeWithCustomCapabilities(capabilities));
  }

  private static ChromeDriverService getService() {
    try {
      Path logFile = Files.createTempFile("chromedriver", ".log");
      ChromeDriverService service = new ChromeDriverService.Builder()
          .withVerbose(true)
          .withLogFile(logFile.toFile())
          .build();
      LOG.info("chromedriver will log to " + logFile);
      service.start();
      // Fugly.
      Runtime.getRuntime().addShutdownHook(new Thread(service::stop));
      return service;
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private static ChromeOptions chromeWithCustomCapabilities(Capabilities originalCapabilities) {
    ChromeOptions options = new ChromeOptions();
    options.addArguments("disable-extensions", "disable-infobars", "disable-breakpad");
    Map<String, Object> prefs = new HashMap<>();
    prefs.put("exit_type", "None");
    prefs.put("exited_cleanly", true);
    options.setExperimentalOption("prefs", prefs);
    String chromePath = System.getProperty("webdriver.chrome.binary");
    if (chromePath != null) {
      options.setBinary(new File(chromePath));
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
