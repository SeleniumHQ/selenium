/*
 Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.chrome;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.browserlaunchers.DriverService;

import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * Manages the life and death of a chromedriver server.
 */
public class ChromeDriverService extends DriverService {

  /**
   * System property that defines the location of the chromedriver executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String CHROME_DRIVER_EXE_PROPERTY = "webdriver.chrome.driver";

  /**
   *
   * @param executable The chromedriver executable.
   * @param port Which port to start the chromedriver on.
   * @param environment The environment for the launched server.
   * @param logFile Optional file to dump logs to.
   * @throws IOException If an I/O error occurs.
   */
  private ChromeDriverService(File executable, int port,
      ImmutableMap<String, String> environment, File logFile) throws IOException {
    super(executable, port, environment, logFile);
  }

  /**
   * Configures and returns a new {@link ChromeDriverService} using the default configuration. In
   * this configuration, the service will use the chromedriver executable identified by the
   * {@link #CHROME_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new ChromeDriverService using the default configuration.
   */
  public static ChromeDriverService createDefaultService() {
    File exe = findExecutable("chromedriver", CHROME_DRIVER_EXE_PROPERTY,
      "http://code.google.com/p/selenium/wiki/ChromeDriver",
      "http://code.google.com/p/chromedriver/downloads/list");
    return new Builder().usingChromeDriverExecutable(exe).usingAnyFreePort().build();
  }

  /**
   * Builder used to configure new {@link ChromeDriverService} instances.
   */
  public static class Builder extends DriverService.Builder {

    /**
     * Sets which chromedriver executable the builder will use.
     *
     * @param file The executable to use.
     * @return A self reference.
     */
    public Builder usingChromeDriverExecutable(File file) {
      usingDriverExecutable(file);
      return this;
    }

    /**
     * Sets which port the chromedriver server should be started on. A value of 0 indicates that any
     * free port may be used.
     *
     * @param port The port to use; must be non-negative.
     * @return A self reference.
     */
    public Builder usingPort(int port) {
      super.usingPort(port);
      return this;
    }

    /**
     * Configures the chromedriver server to start on any available port.
     *
     * @return A self reference.
     */
    public Builder usingAnyFreePort() {
      super.usingAnyFreePort();
      return this;
    }

    /**
     * Defines the environment for the launched chromedriver server. These
     * settings will be inherited by every browser session launched by the
     * server.
     *
     * @param environment A map of the environment variables to launch the
     *     server with.
     * @return A self reference.
     */
    @Beta
    public Builder withEnvironment(Map<String, String> environment) {
      super.withEnvironment(environment);
      return this;
    }
    
    public Builder withLogFile(File logFile) {
      super.withLogFile(logFile);
      return this;
    }

    /**
     * Creates a new binary to manage the chromedriver server. Before creating a new binary, the
     * builder will check that either the user defined the location of the chromedriver executable
     * through {@link #usingChromeDriverExecutable(File) the API} or with the
     * {@code webdriver.chrome.driver} system property.
     *
     * @return The new binary.
     */
    public ChromeDriverService build() {
      return (ChromeDriverService) super.build();
    }

    protected DriverService buildDriverService() throws IOException {
      return new ChromeDriverService(exe, port, environment, logFile);
    }
  }
}
