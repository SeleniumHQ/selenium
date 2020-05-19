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
import org.openqa.selenium.edgehtml.EdgeHtmlDriverService;
import org.openqa.selenium.edgehtml.EdgeHtmlOptions;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.html5.RemoteLocationContext;
import org.openqa.selenium.remote.html5.RemoteWebStorage;

import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.logging.Logger;

/**
 * Customized RemoteWebDriver that will communicate with a service that lives and dies with the
 * entire test suite. We do not use {@link org.openqa.selenium.edgehtml.EdgeHtmlDriver} since that starts and stops the service
 * with each instance (and that is too expensive for our purposes).
 */
public class TestEdgeHtmlDriver extends RemoteWebDriver implements WebStorage, LocationContext {
  private final static Logger LOG = Logger.getLogger(TestEdgeHtmlDriver.class.getName());

  private static EdgeHtmlDriverService service;
  private RemoteWebStorage webStorage;
  private RemoteLocationContext locationContext;

  public TestEdgeHtmlDriver(Capabilities capabilities) {
    super(getServiceUrl(capabilities), new EdgeHtmlOptions());
    webStorage = new RemoteWebStorage(getExecuteMethod());
    locationContext = new RemoteLocationContext(getExecuteMethod());
  }

  private static URL getServiceUrl(Capabilities capabilities) {
    try {
      if (service == null) {
        Path logFile = Files.createTempFile("edgehtmldriver", ".log");

        EdgeHtmlDriverService.Builder builder = new EdgeHtmlDriverService.Builder();
        service = builder.withVerbose(true).withLogFile(logFile.toFile()).build();
        LOG.info("edgedriver will log to " + logFile);
        service.start();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> service.stop()));
      }
      return service.getUrl();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public <X> X getScreenshotAs(OutputType<X> target) {
    // Get the screenshot as base64.
    String base64 = (String) execute(DriverCommand.SCREENSHOT).getValue();
    // ... and convert it.
    return target.convertFromBase64Png(base64);
  }

  @Override
  public LocalStorage getLocalStorage() {
    return webStorage.getLocalStorage();
  }

  @Override
  public SessionStorage getSessionStorage() {
    return webStorage.getSessionStorage();
  }

  @Override
  public Location location() {
    return locationContext.location();
  }

  @Override
  public void setLocation(Location location) {
    locationContext.setLocation(location);
  }
}
