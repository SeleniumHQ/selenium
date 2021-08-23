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
package org.openqa.selenium.edge;

import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Manages the life and death of the EdgeDriver (MicrosoftWebDriver or MSEdgeDriver).
 */
public class EdgeDriverService extends DriverService {

  /**
   * System property that defines the location of the EdgeDriver executable that will be used by
   * the default service.
   */
  public static final String EDGE_DRIVER_EXE_PROPERTY = "webdriver.edge.driver";

  /**
   * System property that defines the default location where MicrosoftWebDriver output is logged.
   */
  public static final String EDGE_DRIVER_LOG_PROPERTY = "webdriver.edge.logfile";

  /**
   * Boolean system property that defines whether the MicrosoftWebDriver executable should be started
   * with verbose logging.
   */
  public static final String EDGE_DRIVER_VERBOSE_LOG_PROPERTY = "webdriver.edge.verboseLogging";

  /**
   * Boolean system property that defines whether the MSEdgeDriver executable should be started
   * in silent mode.
   */
  public static final String EDGE_DRIVER_SILENT_OUTPUT_PROPERTY = "webdriver.edge.silentOutput";

  /**
   * System property that defines comma-separated list of remote IPv4 addresses which are
   * allowed to connect to MSEdgeDriver.
   */
  public static final String EDGE_DRIVER_ALLOWED_IPS_PROPERTY = "webdriver.edge.withAllowedIps";

  /**
   * System property that defines whether the MSEdgeDriver executable should check for build
   * version compatibility between MSEdgeDriver and the browser.
   */
  public static final String EDGE_DRIVER_DISABLE_BUILD_CHECK = "webdriver.edge.disableBuildCheck";

  /**
   * @param executable  The EdgeDriver executable.
   * @param port        Which port to start the EdgeDriver on.
   * @param timeout     Timeout waiting for driver server to start.
   * @param args        The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public EdgeDriverService(
    File executable,
    int port,
    Duration timeout,
    List<String> args,
    Map<String, String> environment) throws IOException {
    super(executable, port, timeout,
          unmodifiableList(new ArrayList<>(args)),
          unmodifiableMap(new HashMap<>(environment)));
  }

  /**
   * Configures and returns a new {@link EdgeDriverService} using the default configuration. In
   * this configuration, the service will use the MSEdgeDriver executable identified by the
   * {@link #EDGE_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new ChromiumEdgeDriverService using the default configuration.
   */
  public static EdgeDriverService createDefaultService() {
    return new EdgeDriverService.Builder().build();
  }

  /**
   * Builder used to configure new {@link EdgeDriverService} instances.
   */
  @AutoService(DriverService.Builder.class)
  public static class Builder extends DriverService.Builder<
    EdgeDriverService, EdgeDriverService.Builder> {

    private boolean verbose = Boolean.getBoolean(EDGE_DRIVER_VERBOSE_LOG_PROPERTY);
    private boolean silent = Boolean.getBoolean(EDGE_DRIVER_SILENT_OUTPUT_PROPERTY);
    private String allowedListIps = System.getProperty(EDGE_DRIVER_ALLOWED_IPS_PROPERTY);
    private boolean disableBuildCheck = Boolean.getBoolean(EDGE_DRIVER_DISABLE_BUILD_CHECK);

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (BrowserType.EDGE.equals(capabilities.getBrowserName())) {
        score++;
      }

      Object useChromium = capabilities.getCapability(EdgeOptions.USE_CHROMIUM);
      if (Objects.equals(useChromium, false)) {
        score--;
      }

      if (capabilities.getCapability(EdgeOptions.CAPABILITY) != null) {
        score++;
      }

      return score;
    }

    /**
     * Configures the driver server verbosity.
     *
     * @param verbose whether verbose output is used
     * @return A self reference.
     */
    public EdgeDriverService.Builder withVerbose(boolean verbose) {
      this.verbose = verbose;
      return this;
    }

    /**
     * Configures the driver server for silent output.
     *
     * @param silent whether silent output is used
     * @return A self reference.
     */
    public EdgeDriverService.Builder withSilent(boolean silent) {
      this.silent = silent;
      return this;
    }

    /**
     * Configures the comma-separated list of remote IPv4 addresses which are allowed to connect
     * to the driver server.
     *
     * @param allowedListIps Comma-separated list of remote IPv4 addresses.
     * @return A self reference.
     */
    public EdgeDriverService.Builder withAllowedListIps(String allowedListIps) {
      this.allowedListIps = allowedListIps;
      return this;
    }

    @Override
    protected File findDefaultExecutable() {
      return findExecutable(
        "msedgedriver", EDGE_DRIVER_EXE_PROPERTY,
        "https://docs.microsoft.com/en-us/microsoft-edge/webdriver-chromium/",
        "https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/");
    }

    @Override
    protected List<String> createArgs() {
      if (getLogFile() == null) {
        String logFilePath = System.getProperty(EDGE_DRIVER_LOG_PROPERTY);
        if (logFilePath != null) {
          withLogFile(new File(logFilePath));
        }
      }

      List<String> args = new ArrayList<>();
      args.add(String.format("--port=%d", getPort()));
      if (getLogFile() != null) {
        args.add(String.format("--log-path=%s", getLogFile().getAbsolutePath()));
      }
      if (verbose) {
        args.add("--verbose");
      }
      if (silent) {
        args.add("--silent");
      }
      if (allowedListIps != null) {
        args.add(String.format("--whitelisted-ips=%s", allowedListIps));
      }
      if (disableBuildCheck) {
        args.add("--disable-build-check");
      }

      return unmodifiableList(args);
    }

    @Override
    protected EdgeDriverService createDriverService(
        File exe,
        int port,
        Duration timeout,
        List<String> args,
        Map<String, String> environment) {
      try {
        return new EdgeDriverService(exe, port, timeout, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
