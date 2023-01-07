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

package org.openqa.selenium.chrome;

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
import static org.openqa.selenium.remote.Browser.CHROME;

/**
 * Manages the life and death of a ChromeDriver server.
 */
public class ChromeDriverService extends DriverService {

  /**
   * System property that defines the location of the ChromeDriver executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String CHROME_DRIVER_EXE_PROPERTY = "webdriver.chrome.driver";

  /**
   * System property that toggles the formatting of the timestamps of the logs
   */
  public static final String CHROME_DRIVER_READABLE_TIMESTAMP = "webdriver.chrome.readableTimestamp";

  /**
   * System property that defines the default location where ChromeDriver output is logged.
   */
  public static final String CHROME_DRIVER_LOG_PROPERTY = "webdriver.chrome.logfile";

  /**
   * System property that defines the log level when ChromeDriver output is logged.
   */
  public static final String CHROME_DRIVER_LOG_LEVEL_PROPERTY = "webdriver.chrome.loglevel";

  /**
   * Boolean system property that defines whether ChromeDriver should append to existing log file.
   */
  public static final String CHROME_DRIVER_APPEND_LOG_PROPERTY = "webdriver.chrome.appendLog";

  /**
   * Boolean system property that defines whether the ChromeDriver executable should be started
   * with verbose logging.
   */
  public static final String CHROME_DRIVER_VERBOSE_LOG_PROPERTY = "webdriver.chrome.verboseLogging";

  /**
   * Boolean system property that defines whether the ChromeDriver executable should be started
   * in silent mode.
   */
  public static final String CHROME_DRIVER_SILENT_OUTPUT_PROPERTY = "webdriver.chrome.silentOutput";

  /**
   * System property that defines comma-separated list of remote IPv4 addresses which are
   * allowed to connect to ChromeDriver.
   */
  public static final String CHROME_DRIVER_ALLOWED_IPS_PROPERTY = "webdriver.chrome.withAllowedIps";

  /**
   * System property that defines comma-separated list of remote IPv4 addresses which are
   * allowed to connect to ChromeDriver.
   * @deprecated use {@link #CHROME_DRIVER_ALLOWED_IPS_PROPERTY}
   */
  @Deprecated
  public static final String CHROME_DRIVER_WHITELISTED_IPS_PROPERTY = "webdriver.chrome.whitelistedIps";

  /**
   * System property that defines whether the ChromeDriver executable should check for build
   * version compatibility between ChromeDriver and the browser.
   */
  public static final String CHROME_DRIVER_DISABLE_BUILD_CHECK = "webdriver.chrome.disableBuildCheck";

  /**
   * @param executable  The ChromeDriver executable.
   * @param port        Which port to start the ChromeDriver on.
   * @param args        The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public ChromeDriverService(
    File executable,
    int port,
    List<String> args,
    Map<String, String> environment) throws IOException {
    super(executable, port, DEFAULT_TIMEOUT,
      unmodifiableList(new ArrayList<>(args)),
      unmodifiableMap(new HashMap<>(environment)));
  }

  /**
   * @param executable  The ChromeDriver executable.
   * @param port        Which port to start the ChromeDriver on.
   * @param timeout     Timeout waiting for driver server to start.
   * @param args        The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public ChromeDriverService(
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
   * Configures and returns a new {@link ChromeDriverService} using the default configuration. In
   * this configuration, the service will use the ChromeDriver executable identified by the
   * {@link #CHROME_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new ChromeDriverService using the default configuration.
   */
  public static ChromeDriverService createDefaultService() {
    return new Builder().build();
  }

  /**
   * Configures and returns a new {@link ChromeDriverService} using the supplied configuration. In
   * this configuration, the service will use the ChromeDriver executable identified by the
   * {@link #CHROME_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new ChromeDriverService using the supplied configuration from {@link ChromeOptions}.
   */
  public static ChromeDriverService createServiceWithConfig(ChromeOptions options) {
    return new Builder()
      .withLogLevel(options.getLogLevel())
      .build();
  }

  /**
   * Builder used to configure new {@link ChromeDriverService} instances.
   */
  @AutoService(DriverService.Builder.class)
  public static class Builder extends DriverService.Builder<
      ChromeDriverService, ChromeDriverService.Builder> {

    private boolean disableBuildCheck = Boolean.getBoolean(CHROME_DRIVER_DISABLE_BUILD_CHECK);
    private boolean readableTimestamp = Boolean.getBoolean(CHROME_DRIVER_READABLE_TIMESTAMP);
    private boolean appendLog = Boolean.getBoolean(CHROME_DRIVER_APPEND_LOG_PROPERTY);
    private boolean verbose = Boolean.getBoolean(CHROME_DRIVER_VERBOSE_LOG_PROPERTY);
    private boolean silent = Boolean.getBoolean(CHROME_DRIVER_SILENT_OUTPUT_PROPERTY);
    private String allowedListIps = System.getProperty(CHROME_DRIVER_ALLOWED_IPS_PROPERTY,
      System.getProperty(CHROME_DRIVER_WHITELISTED_IPS_PROPERTY));
    private ChromeDriverLogLevel logLevel = ChromeDriverLogLevel.fromString(System.getProperty(CHROME_DRIVER_LOG_LEVEL_PROPERTY));

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (CHROME.is(capabilities.getBrowserName())) {
        score++;
      }

      if (capabilities.getCapability(ChromeOptions.CAPABILITY) != null) {
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
     * @param verbose True for verbose output, false otherwise.
     * @return A self reference.
     */
    @SuppressWarnings("UnusedReturnValue")
    public Builder withVerbose(boolean verbose) {
      if (verbose) {
        this.logLevel = ChromeDriverLogLevel.ALL;
      }
      this.verbose = false;
      return this;
    }

    /**
     * Configures the driver server verbosity.
     *
     * @param logLevel {@link ChromeDriverLogLevel} for desired log level output.
     * @return A self reference.
     */
    public Builder withLogLevel(ChromeDriverLogLevel logLevel) {
      this.verbose = false;
      this.silent = false;
      this.logLevel = logLevel;
      return this;
    }

    /**
     * Configures the driver server for silent output.
     *
     * @param silent True for silent output, false otherwise.
     * @return A self reference.
     */
    public Builder withSilent(boolean silent) {
      if (silent) {
        this.logLevel = ChromeDriverLogLevel.OFF;
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
     * @deprecated use {@link #withAllowedListIps(String)}
     */
    @Deprecated
    public Builder withWhitelistedIps(String allowedListIps) {
      this.allowedListIps = allowedListIps;
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
        "chromedriver", CHROME_DRIVER_EXE_PROPERTY,
        "https://chromedriver.chromium.org/",
        "https://chromedriver.chromium.org/downloads");
    }

    @Override
    protected List<String> createArgs() {
      if (getLogFile() == null) {
        String logFilePath = System.getProperty(CHROME_DRIVER_LOG_PROPERTY);
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
        args.add(String.format("--log-level=%s", logLevel.toString().toUpperCase()));
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
    protected ChromeDriverService createDriverService(
        File exe,
        int port,
        Duration timeout,
        List<String> args,
        Map<String, String> environment) {
      try {
        return new ChromeDriverService(exe, port, timeout, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
