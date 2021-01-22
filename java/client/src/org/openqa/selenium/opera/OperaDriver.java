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

package org.openqa.selenium.opera;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.remote.FileDetector;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.html5.RemoteLocationContext;
import org.openqa.selenium.remote.html5.RemoteWebStorage;
import org.openqa.selenium.remote.service.DriverCommandExecutor;

/**
 * A {@link WebDriver} implementation that controls a Blink-based Opera browser running on the local
 * machine. It requires an <code>operadriver</code> executable to be available in PATH.
 *
 * @see <a href="https://github.com/operasoftware/operachromiumdriver">operadriver</a>
 */
public class OperaDriver extends RemoteWebDriver
    implements LocationContext, WebStorage {

  private RemoteLocationContext locationContext;
  private RemoteWebStorage webStorage;

  /**
   * Creates a new OperaDriver using the {@link OperaDriverService#createDefaultService default}
   * server configuration.
   *
   * @see #OperaDriver(OperaDriverService, OperaOptions)
   */
  public OperaDriver() {
    this(OperaDriverService.createDefaultService(), new OperaOptions());
  }

  /**
   * Creates a new OperaDriver instance. The {@code service} will be started along with the driver,
   * and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @see #OperaDriver(OperaDriverService, OperaOptions)
   */
  public OperaDriver(OperaDriverService service) {
    this(service, new OperaOptions());
  }

  /**
   * Creates a new OperaDriver instance. The {@code capabilities} will be passed to the
   * chromedriver service.
   *
   * @param capabilities The capabilities required from the OperaDriver.
   * @see #OperaDriver(OperaDriverService, Capabilities)
   * @deprecated Use {@link #OperaDriver(OperaOptions)} instead.
   */
  @Deprecated
  public OperaDriver(Capabilities capabilities) {
    this(OperaDriverService.createDefaultService(), capabilities);
  }

  /**
   * Creates a new OperaDriver instance with the specified options.
   *
   * @param options The options to use.
   * @see #OperaDriver(OperaDriverService, OperaOptions)
   */
  public OperaDriver(OperaOptions options) {
    this(OperaDriverService.createDefaultService(), options);
  }

  /**
   * Creates a new OperaDriver instance with the specified options. The {@code service} will be
   * started along with the driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param options The options to use.
   */
  public OperaDriver(OperaDriverService service, OperaOptions options) {
    this(service, (Capabilities) options);
  }

  /**
   * Creates a new OperaDriver instance. The {@code service} will be started along with the
   * driver, and shutdown upon calling {@link #quit()}.
   *
   * @param service The service to use.
   * @param capabilities The capabilities required from the OperaDriver.
   * @deprecated Use {@link #OperaDriver(OperaDriverService, OperaOptions)} instead.
   */
  @Deprecated
  public OperaDriver(OperaDriverService service, Capabilities capabilities) {
    super(new DriverCommandExecutor(service), capabilities);
    locationContext = new RemoteLocationContext(getExecuteMethod());
    webStorage = new  RemoteWebStorage(getExecuteMethod());
  }

  @Override
  public void setFileDetector(FileDetector detector) {
    throw new WebDriverException(
        "Setting the file detector only works on remote webdriver instances obtained " +
        "via RemoteWebDriver");
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
