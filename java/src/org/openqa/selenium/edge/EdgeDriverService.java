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
import static org.openqa.selenium.edge.EdgeOptions.WEBVIEW2_BROWSER_NAME;
import static org.openqa.selenium.remote.Browser.EDGE;

import com.google.auto.service.AutoService;
import com.google.common.io.ByteStreams;
import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chromium.ChromiumDriverLogLevel;
import org.openqa.selenium.remote.service.DriverService;

/** Manages the life and death of the MSEdgeDriver */
public class EdgeDriverService extends DriverService {

  public static final String EDGE_DRIVER_NAME = "msedgedriver";

  /**
   * System property that defines the location of the MSEdgeDriver executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String EDGE_DRIVER_EXE_PROPERTY = "webdriver.edge.driver";

  /** System property that toggles the formatting of the timestamps of the logs */
  public static final String EDGE_DRIVER_READABLE_TIMESTAMP = "webdriver.edge.readableTimestamp";

  /**
   * System property that defines the location of the file where MSEdgeDriver should write log
   * messages to.
   */
  public static final String EDGE_DRIVER_LOG_PROPERTY = "webdriver.edge.logfile";

  /** System property that defines the log level when MSEdgeDriver output is logged. */
  public static final String EDGE_DRIVER_LOG_LEVEL_PROPERTY = "webdriver.edge.loglevel";

  /** System property that defines the {@link ChromiumDriverLogLevel} for MSEdgeDriver logs. */
  public static final String EDGE_DRIVER_APPEND_LOG_PROPERTY = "webdriver.edge.appendLog";

  /**
   * Boolean system property that defines whether the MSEdgeDriver executable should be started with
   * verbose logging.
   */
  public static final String EDGE_DRIVER_VERBOSE_LOG_PROPERTY = "webdriver.edge.verboseLogging";

  /**
   * Boolean system property that defines whether the MSEdgeDriver executable should be started in
   * silent mode.
   */
  public static final String EDGE_DRIVER_SILENT_OUTPUT_PROPERTY = "webdriver.edge.silentOutput";

  /**
   * System property that defines comma-separated list of remote IPv4 addresses which are allowed to
   * connect to MSEdgeDriver.
   */
  public static final String EDGE_DRIVER_ALLOWED_IPS_PROPERTY = "webdriver.edge.withAllowedIps";

  /**
   * System property that defines whether the MSEdgeDriver executable should check for build version
   * compatibility between MSEdgeDriver and the browser.
   */
  public static final String EDGE_DRIVER_DISABLE_BUILD_CHECK = "webdriver.edge.disableBuildCheck";

  /**
   * @param executable The MSEdgeDriver executable.
   * @param port Which port to start the MSEdgeDriver on.
   * @param timeout Timeout waiting for driver server to start.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public EdgeDriverService(
      File executable,
      int port,
      Duration timeout,
      List<String> args,
      Map<String, String> environment)
      throws IOException {
    super(
        executable,
        port,
        timeout,
        unmodifiableList(new ArrayList<>(args)),
        unmodifiableMap(new HashMap<>(environment)));
  }

  public String getDriverName() {
    return EDGE_DRIVER_NAME;
  }

  public String getDriverProperty() {
    return EDGE_DRIVER_EXE_PROPERTY;
  }

  @Override
  public Capabilities getDefaultDriverOptions() {
    return new EdgeOptions();
  }

  /**
   * Configures and returns a new {@link EdgeDriverService} using the default configuration. In this
   * configuration, the service will use the MSEdgeDriver executable identified by the {@link
   * org.openqa.selenium.remote.service.DriverFinder#getPath(DriverService, Capabilities)}. Each
   * service created by this method will be configured to use a free port on the current system.
   *
   * @return A new EdgeDriverService using the default configuration.
   */
  public static EdgeDriverService createDefaultService() {
    return new Builder().build();
  }

  /** Builder used to configure new {@link EdgeDriverService} instances. */
  @SuppressWarnings({"rawtypes", "RedundantSuppression"})
  @AutoService(DriverService.Builder.class)
  public static class Builder extends DriverService.Builder<EdgeDriverService, Builder> {

    private Boolean disableBuildCheck;
    private Boolean readableTimestamp;
    private Boolean appendLog;
    private Boolean verbose;
    private Boolean silent;
    private String allowedListIps;
    private ChromiumDriverLogLevel logLevel;

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (EDGE.is(capabilities)) {
        score++;
      }

      // webview2 - support
      // https://docs.microsoft.com/en-us/microsoft-edge/webview2/how-to/webdriver
      if (WEBVIEW2_BROWSER_NAME.equalsIgnoreCase(capabilities.getBrowserName())) {
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
     * Configures the driver server log level.
     *
     * @param logLevel {@link ChromiumDriverLogLevel} for desired log level output.
     * @return A self reference.
     */
    public Builder withLoglevel(ChromiumDriverLogLevel logLevel) {
      this.logLevel = logLevel;
      this.silent = false;
      this.verbose = false;
      return this;
    }

    /**
     * Configures the driver server for silent output.
     *
     * @param silent Log no output for true, no changes made if false.
     * @return A self reference.
     */
    public Builder withSilent(boolean silent) {
      if (silent) {
        this.logLevel = ChromiumDriverLogLevel.OFF;
      }
      this.silent = false;
      return this;
    }

    /**
     * Configures the driver server verbosity.
     *
     * @param verbose Log all output for true, no changes made if false.
     * @return A self reference.
     */
    public Builder withVerbose(boolean verbose) {
      if (verbose) {
        this.logLevel = ChromiumDriverLogLevel.ALL;
      }
      this.verbose = false;
      return this;
    }

    /**
     * Configures the comma-separated list of remote IPv4 addresses which are allowed to connect to
     * the driver server.
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
    protected void loadSystemProperties() {
      parseLogOutput(EDGE_DRIVER_LOG_PROPERTY);
      if (disableBuildCheck == null) {
        this.disableBuildCheck = Boolean.getBoolean(EDGE_DRIVER_DISABLE_BUILD_CHECK);
      }
      if (readableTimestamp == null) {
        this.readableTimestamp = Boolean.getBoolean(EDGE_DRIVER_READABLE_TIMESTAMP);
      }
      if (appendLog == null) {
        this.appendLog = Boolean.getBoolean(EDGE_DRIVER_APPEND_LOG_PROPERTY);
      }
      if (verbose == null && Boolean.getBoolean(EDGE_DRIVER_VERBOSE_LOG_PROPERTY)) {
        withVerbose(Boolean.getBoolean(EDGE_DRIVER_VERBOSE_LOG_PROPERTY));
      }
      if (silent == null && Boolean.getBoolean(EDGE_DRIVER_SILENT_OUTPUT_PROPERTY)) {
        withSilent(Boolean.getBoolean(EDGE_DRIVER_SILENT_OUTPUT_PROPERTY));
      }
      if (allowedListIps == null) {
        this.allowedListIps = System.getProperty(EDGE_DRIVER_ALLOWED_IPS_PROPERTY);
      }
      if (logLevel == null && System.getProperty(EDGE_DRIVER_LOG_LEVEL_PROPERTY) != null) {
        String level = System.getProperty(EDGE_DRIVER_LOG_LEVEL_PROPERTY);
        withLoglevel(ChromiumDriverLogLevel.fromString(level));
      }
    }

    @Override
    protected List<String> createArgs() {
      List<String> args = new ArrayList<>();
      args.add(String.format("--port=%d", getPort()));

      // Readable timestamp and append logs only work if log path is specified in args
      // Cannot use logOutput because goog:loggingPrefs requires --log-path get sent
      if (getLogFile() != null) {
        args.add(String.format("--log-path=%s", getLogFile().getAbsolutePath()));
        if (Boolean.TRUE.equals(readableTimestamp)) {
          args.add("--readable-timestamp");
        }
        if (Boolean.TRUE.equals(appendLog)) {
          args.add("--append-log");
        }
        withLogOutput(
            ByteStreams.nullOutputStream()); // Do not overwrite log file in getLogOutput()
      }

      if (logLevel != null) {
        args.add(String.format("--log-level=%s", logLevel.toString().toUpperCase()));
      }
      if (Boolean.TRUE.equals(silent)) {
        args.add("--silent");
      }
      if (Boolean.TRUE.equals(verbose)) {
        args.add("--verbose");
      }
      if (allowedListIps != null) {
        args.add(String.format("--allowed-ips=%s", allowedListIps));
      }
      if (Boolean.TRUE.equals(disableBuildCheck)) {
        args.add("--disable-build-check");
      }

      return unmodifiableList(args);
    }

    @Override
    protected EdgeDriverService createDriverService(
        File exe, int port, Duration timeout, List<String> args, Map<String, String> environment) {
      try {
        return new EdgeDriverService(exe, port, timeout, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
