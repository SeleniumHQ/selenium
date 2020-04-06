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
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;

public class ChromiumEdgeDriverService extends EdgeDriverService {

  /**
   * Boolean system property that defines whether the MSEdgeDriver executable should be started
   * in silent mode.
   */
  public static final String EDGE_DRIVER_SILENT_OUTPUT_PROPERTY = "webdriver.edge.silentOutput";

  /**
   * System property that defines comma-separated list of remote IPv4 addresses which are
   * allowed to connect to MSEdgeDriver.
   */
  public final static String EDGE_DRIVER_ALLOWED_IPS_PROPERTY = "webdriver.edge.withAllowedIps";

  public ChromiumEdgeDriverService(
      File executable,
      int port,
      List<String> args,
      Map<String, String> environment) throws IOException {
    super(executable, port, DEFAULT_TIMEOUT, args, environment);
  }

  public ChromiumEdgeDriverService(
      File executable,
      int port,
      Duration timeout,
      List<String> args,
      Map<String, String> environment) throws IOException {
    super(executable, port, timeout, args, environment);
  }

  /**
   * Configures and returns a new {@link ChromiumEdgeDriverService} using the default configuration. In
   * this configuration, the service will use the MSEdgeDriver executable identified by the
   * {@link #EDGE_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new ChromiumEdgeDriverService using the default configuration.
   */
  public static ChromiumEdgeDriverService createDefaultService() {
    return new ChromiumEdgeDriverService.Builder().build();
  }

  /**
   * Builder used to configure new {@link ChromiumEdgeDriverService} instances.
   */
  @AutoService(DriverService.Builder.class)
  public static class Builder extends EdgeDriverService.Builder<
      ChromiumEdgeDriverService, ChromiumEdgeDriverService.Builder> {

    private boolean verbose = Boolean.getBoolean(EDGE_DRIVER_VERBOSE_LOG_PROPERTY);
    private boolean silent = Boolean.getBoolean(EDGE_DRIVER_SILENT_OUTPUT_PROPERTY);
    private String allowedListIps = System.getProperty(EDGE_DRIVER_ALLOWED_IPS_PROPERTY);

    @Override
    public boolean isLegacy() {
      return false;
    }

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (BrowserType.EDGE.equals(capabilities.getBrowserName())) {
        score++;
      }

      if (capabilities.getCapability(EdgeOptions.CAPABILITY) != null) {
        score++;
      }

      if (capabilities.getCapability(EdgeOptions.USE_CHROMIUM) != null &&
          Boolean.parseBoolean(capabilities.getCapability(EdgeOptions.USE_CHROMIUM).toString())) {
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
    @Override
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
    public ChromiumEdgeDriverService.Builder withSilent(boolean silent) {
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
    public ChromiumEdgeDriverService.Builder withAllowedListIps(String allowedListIps) {
      this.allowedListIps = allowedListIps;
      return this;
    }

    @Override
    protected File findDefaultExecutable() {
      return findExecutable(
          "msedgedriver", EDGE_DRIVER_EXE_PROPERTY,
          "https://github.com/SeleniumHQ/selenium/wiki/MicrosoftWebDriver",
          "https://msedgecdn.azurewebsites.net/webdriver/index.html");
    }

    @Override
    protected ImmutableList<String> createArgs() {
      if (getLogFile() == null) {
        String logFilePath = System.getProperty(EDGE_DRIVER_LOG_PROPERTY);
        if (logFilePath != null) {
          withLogFile(new File(logFilePath));
        }
      }

      ImmutableList.Builder<String> argsBuilder = ImmutableList.builder();
      argsBuilder.add(String.format("--port=%d", getPort()));
      if (getLogFile() != null) {
        argsBuilder.add(String.format("--log-path=%s", getLogFile().getAbsolutePath()));
      }
      if (verbose) {
        argsBuilder.add("--verbose");
      }
      if (silent) {
        argsBuilder.add("--silent");
      }
      if (allowedListIps != null) {
        argsBuilder.add(String.format("--whitelisted-ips=%s", allowedListIps));
      }

      return argsBuilder.build();
    }

    @Override
    protected ChromiumEdgeDriverService createDriverService(
        File exe,
        int port,
        Duration timeout,
        ImmutableList<String> args,
        ImmutableMap<String, String> environment) {
      try {
        return new ChromiumEdgeDriverService(exe, port, timeout, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }

}
