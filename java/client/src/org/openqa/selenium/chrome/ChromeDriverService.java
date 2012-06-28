/*
Copyright 2011-2012 Selenium committers
Copyright 2011-2012 Software Freedom Conservancy

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

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Beta;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.service.DriverService;

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
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  private ChromeDriverService(File executable, int port, ImmutableList<String> args,
      ImmutableMap<String, String> environment) throws IOException {
    super(executable, port, args, environment);
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
    return new Builder().usingDriverExecutable(exe).usingAnyFreePort().build();
  }

  /**
   * Builder used to configure new {@link ChromeDriverService} instances.
   */
  public static class Builder {

    private int port = 0;
    private File exe = null;
    private ImmutableMap<String, String> environment = ImmutableMap.of();
    private File logFile;

    /**
     * A synonym for {@link #usingDriverExecutable(File)}.
     *
     * @param file The executable to use.
     * @return A self reference.
     * @deprecated Use {@link #usingDriverExecutable(File)} instead
     */
    public Builder usingChromeDriverExecutable(File file) {
      return usingDriverExecutable(file);
    }

    /**
     * Sets which driver executable the builder will use.
     *
     * @param file The executable to use.
     * @return A self reference.
     */
    public Builder usingDriverExecutable(File file) {
      checkNotNull(file);
      checkExecutable(file);
      this.exe = file;
      return this;
    }

    /**
     * Sets which port the driver server should be started on. A value of 0 indicates that any
     * free port may be used.
     *
     * @param port The port to use; must be non-negative.
     * @return A self reference.
     */
    public Builder usingPort(int port) {
      checkArgument(port >= 0, "Invalid port number: %d", port);
      this.port = port;
      return this;
    }

    /**
     * Configures the driver server to start on any available port.
     *
     * @return A self reference.
     */
    public Builder usingAnyFreePort() {
      this.port = 0;
      return this;
    }

    /**
     * Defines the environment for the launched driver server. These
     * settings will be inherited by every browser session launched by the
     * server.
     *
     * @param environment A map of the environment variables to launch the
     *     server with.
     * @return A self reference.
     */
    @Beta
    public Builder withEnvironment(Map<String, String> environment) {
      this.environment = ImmutableMap.copyOf(environment);
      return this;
    }

    /**
     * Configures the driver server to write log to the given file.
     *
     * @param logFile A file to write log to.
     * @return A self reference.
     */
    public Builder withLogFile(File logFile) {
      this.logFile = logFile;
      return this;
    }

    /**
     * Creates a new service to manage the driver server. Before creating a new service, the
     * builder will find a port for the server to listen to.
     *
     * @return The new service object.
     */
    public ChromeDriverService build() {
      if (port == 0) {
        port = PortProber.findFreePort();
      }

      checkState(exe != null, "Path to the driver executable not specified");

      try {
        ImmutableList.Builder<String> argsBuilder = ImmutableList.builder();
        argsBuilder.add(String.format("--port=%d", port));
        if (logFile != null) {
          argsBuilder.add(String.format("--log-path=%s", logFile.getAbsolutePath()));
        }

        return new ChromeDriverService(exe, port, argsBuilder.build(), environment);

      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
