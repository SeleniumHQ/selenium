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

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;
import static org.openqa.selenium.remote.Browser.EDGE;

/**
 * Manages the life and death of the MSEdgeDriver
 */
public class EdgeDriverService extends DriverService {

  /**
   * System property that defines the location of the MSEdgeDriver executable that will be used by
   * the default service.
   */
  public static final String EDGE_DRIVER_EXE_PROPERTY = "webdriver.edge.driver";

  /**
   * System property that toggles the formatting of the timestamps of the logs
   */
  public static final String EDGE_DRIVER_READABLE_TIMESTAMP = "webdriver.edge.readableTimestamp";

  /**
   * System property that defines the default location where MSEdgeDriver output is logged.
   */
  public static final String EDGE_DRIVER_LOG_PROPERTY = "webdriver.edge.logfile";

  /**
   * System property that defines the log level when MSEdgeDriver output is logged.
   */
  public static final String EDGE_DRIVER_LOG_LEVEL_PROPERTY = "webdriver.edge.loglevel";

  /**
   * Boolean system property that defines whether MSEdgeDriver should append to existing log file.
   */
  public static final String EDGE_DRIVER_APPEND_LOG_PROPERTY = "webdriver.edge.appendLog";

  /**
   * Boolean system property that defines whether the MSEdgeDriver executable should be started
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
   * @param executable  The MSEdgeDriver executable.
   * @param port        Which port to start the MSEdgeDriver on.
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
    return new Builder().build();
  }

  /**
   * Builder used to configure new {@link EdgeDriverService} instances.
   */
  @AutoService(DriverService.Builder.class)
  public static class Builder extends DriverService.Builder<
    EdgeDriverService, Builder> {

    private boolean disableBuildCheck = Boolean.getBoolean(EDGE_DRIVER_DISABLE_BUILD_CHECK);
    private boolean readableTimestamp = Boolean.getBoolean(EDGE_DRIVER_READABLE_TIMESTAMP);
    private boolean appendLog = Boolean.getBoolean(EDGE_DRIVER_APPEND_LOG_PROPERTY);
    private boolean verbose = Boolean.getBoolean(EDGE_DRIVER_VERBOSE_LOG_PROPERTY);
    private String logLevel = System.getProperty(EDGE_DRIVER_LOG_LEVEL_PROPERTY);
    private boolean silent = Boolean.getBoolean(EDGE_DRIVER_SILENT_OUTPUT_PROPERTY);
    private String allowedListIps = System.getProperty(EDGE_DRIVER_ALLOWED_IPS_PROPERTY);

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (EDGE.is(capabilities)) {
        score++;
      }

      //webview2 - support https://docs.microsoft.com/en-us/microsoft-edge/webview2/how-to/webdriver
      if ("webview2".equalsIgnoreCase(capabilities.getBrowserName())) {
        score++;
      }

      if (capabilities.getCapability(EdgeOptions.CAPABILITY) != null) {
        score++;
      }

      return score;
    }

    /**
     * Configures the driver server appending to log file.
     *
     * @param appendLog True for appending to log file, false otherwise.
     * @return A self reference.
     */
    public Builder withAppendLog(boolean appendLog) {
      this.appendLog = appendLog;
      return this;
    }

    /**
     * Allows the driver to be used with potentially incompatible versions of the browser.
     *
     * @param noBuildCheck True for not enforcing matching versions.
     * @return A self reference.
     */
    public Builder withBuildCheckDisabled(boolean noBuildCheck) {
      this.disableBuildCheck = noBuildCheck;
      return this;
    }

    /**
     * Configures the driver server verbosity.
     *
     * @param verbose whether verbose output is used
     * @return A self reference.
     */
    public Builder withVerbose(boolean verbose) {
      if (verbose) {
        this.logLevel = "ALL";
      }
      this.verbose = false;
      return this;
    }

    /**
     * Configures the driver server log level.
     */
    public Builder withLoglevel(String logLevel) {
      this.verbose = false;
      this.silent = false;
      this.logLevel = logLevel;
      return this;
    }

    /**
     * Configures the driver server for silent output.
     *
     * @param silent whether silent output is used
     * @return A self reference.
     */
    public Builder withSilent(boolean silent) {
      if (silent) {
        this.logLevel = "OFF";
      }
      this.silent = false;
      return this;
    }

    /**
     * Configures the comma-separated list of remote IPv4 addresses which are allowed to connect
     * to the driver server.
     *
     * @param allowedListIps Comma-separated list of remote IPv4 addresses.
     * @return A self reference.
     */
    public Builder withAllowedListIps(String allowedListIps) {
      this.allowedListIps = allowedListIps;
      return this;
    }

    /**
     * Configures the format of the logging for the driver server.
     *
     * @param readableTimestamp Whether the timestamp of the log is readable.
     * @return A self reference.
     */
    public Builder withReadableTimestamp(Boolean readableTimestamp) {
      this.readableTimestamp = readableTimestamp;
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

      // If set in properties and not overwritten by method
      if (verbose) {
        withVerbose(true);
      }
      if (silent) {
        withSilent(true);
      }

      List<String> args = new ArrayList<>();

      args.add(String.format("--port=%d", getPort()));
      if (getLogFile() != null) {
        args.add(String.format("--log-path=%s", getLogFile().getAbsolutePath()));
        // This flag only works when logged to file
        if (readableTimestamp) {
          args.add("--readable-timestamp");
        }
      }
      if (appendLog) {
        args.add("--append-log");
      }
      if (logLevel != null) {
        args.add(String.format("--log-level=%s", logLevel));
      }
      if (allowedListIps != null) {
        args.add(String.format("--allowed-ips=%s", allowedListIps));
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
