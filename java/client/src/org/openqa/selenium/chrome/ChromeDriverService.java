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
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;

/**
 * Manages the life and death of a ChromeDriver server.
 */
public class ChromeDriverService extends DriverService {

  /**
   * System property that defines the location of the chromedriver executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String CHROME_DRIVER_EXE_PROPERTY = "webdriver.chrome.driver";

  /**
   * System property that defines the location of the log that will be written by
   * the {@link #createDefaultService() default service}.
   */
  public final static String CHROME_DRIVER_LOG_PROPERTY = "webdriver.chrome.logfile";

  /**
   * Boolean system property that defines whether chromedriver should append to existing log file.
   */
  public static final String CHROME_DRIVER_APPEND_LOG_PROPERTY =
      "webdriver.chrome.appendLog";

  /**
   * Boolean system property that defines whether the chromedriver executable should be started
   * with verbose logging.
   */
  public static final String CHROME_DRIVER_VERBOSE_LOG_PROPERTY =
      "webdriver.chrome.verboseLogging";

  /**
   * Boolean system property that defines whether the chromedriver executable should be started
   * in silent mode.
   */
  public static final String CHROME_DRIVER_SILENT_OUTPUT_PROPERTY =
      "webdriver.chrome.silentOutput";

  /**
   * System property that defines comma-separated list of remote IPv4 addresses which are
   * allowed to connect to ChromeDriver.
   */
  public final static String CHROME_DRIVER_WHITELISTED_IPS_PROPERTY =
      "webdriver.chrome.whitelistedIps";

  /**
   * @param executable  The chromedriver executable.
   * @param port        Which port to start the ChromeDriver on.
   * @param args        The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public ChromeDriverService(
      File executable,
      int port,
      ImmutableList<String> args,
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
    return new Builder().build();
  }

  /**
   * Builder used to configure new {@link ChromeDriverService} instances.
   */
  @AutoService(DriverService.Builder.class)
  public static class Builder extends DriverService.Builder<
      ChromeDriverService, ChromeDriverService.Builder> {

    private boolean appendLog = Boolean.getBoolean(CHROME_DRIVER_APPEND_LOG_PROPERTY);
    private boolean verbose = Boolean.getBoolean(CHROME_DRIVER_VERBOSE_LOG_PROPERTY);
    private boolean silent = Boolean.getBoolean(CHROME_DRIVER_SILENT_OUTPUT_PROPERTY);
    private String whitelistedIps = System.getProperty(CHROME_DRIVER_WHITELISTED_IPS_PROPERTY);

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (BrowserType.CHROME.equals(capabilities.getBrowserName())) {
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
     * Configures the driver server verbosity.
     *
     * @param verbose True for verbose output, false otherwise.
     * @return A self reference.
     */
    public Builder withVerbose(boolean verbose) {
      this.verbose = verbose;
      return this;
    }

    /**
     * Configures the driver server for silent output.
     *
     * @param silent True for silent output, false otherwise.
     * @return A self reference.
     */
    public Builder withSilent(boolean silent) {
      this.silent = silent;
      return this;
    }

    /**
     * Configures the comma-separated list of remote IPv4 addresses which are allowed to connect
     * to the driver server.
     *
     * @param whitelistedIps Comma-separated list of remote IPv4 addresses.
     * @return A self reference.
     */
    public Builder withWhitelistedIps(String whitelistedIps) {
      this.whitelistedIps = whitelistedIps;
      return this;
    }

    @Override
    protected File findDefaultExecutable() {
      return findExecutable(
          "chromedriver", CHROME_DRIVER_EXE_PROPERTY,
          "https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver",
          "http://chromedriver.storage.googleapis.com/index.html");
    }

    @Override
    protected ImmutableList<String> createArgs() {
      if (getLogFile() == null) {
        String logFilePath = System.getProperty(CHROME_DRIVER_LOG_PROPERTY);
        if (logFilePath != null) {
          withLogFile(new File(logFilePath));
        }
      }

      ImmutableList.Builder<String> argsBuilder = ImmutableList.builder();
      argsBuilder.add(String.format("--port=%d", getPort()));
      if (getLogFile() != null) {
        argsBuilder.add(String.format("--log-path=%s", getLogFile().getAbsolutePath()));
      }
      if (appendLog) {
        argsBuilder.add("--append-log");
      }
      if (verbose) {
        argsBuilder.add("--verbose");
      }
      if (silent) {
        argsBuilder.add("--silent");
      }
      if (whitelistedIps != null) {
        argsBuilder.add(String.format("--whitelisted-ips=%s", whitelistedIps));
      }

      return argsBuilder.build();
    }

    @Override
    protected ChromeDriverService createDriverService(
        File exe,
        int port,
        ImmutableList<String> args,
        ImmutableMap<String, String> environment) {
      try {
        return new ChromeDriverService(exe, port, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
