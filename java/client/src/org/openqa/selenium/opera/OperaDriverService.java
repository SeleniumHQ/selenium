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
 * Manages the life and death of a operadriver server.
 */
public class OperaDriverService extends DriverService {

  /**
   * System property that defines the location of the operadriver executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String OPERA_DRIVER_EXE_PROPERTY = "webdriver.opera.driver";

  /**
   * System property that defines the location of the log that will be written by
   * the {@link #createDefaultService() default service}.
   */
  public final static String OPERA_DRIVER_LOG_PROPERTY = "webdriver.opera.logfile";

  /**
   * Boolean system property that defines whether the OperaDriver executable should be started
   * with verbose logging.
   */
  public static final String OPERA_DRIVER_VERBOSE_LOG_PROPERTY =
      "webdriver.opera.verboseLogging";

  /**
   * Boolean system property that defines whether the OperaDriver executable should be started
   * in silent mode.
   */
  public static final String OPERA_DRIVER_SILENT_OUTPUT_PROPERTY =
      "webdriver.opera.silentOutput";

  /**
   *
   * @param executable The operadriver executable.
   * @param port Which port to start the operadriver on.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public OperaDriverService(File executable, int port, ImmutableList<String> args,
                            ImmutableMap<String, String> environment) throws IOException {
    super(executable, port, args, environment);
  }

  /**
   * Configures and returns a new {@link OperaDriverService} using the default configuration. In
   * this configuration, the service will use the operadriver executable identified by the
   * {@link #OPERA_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new OperaDriverService using the default configuration.
   */
  public static OperaDriverService createDefaultService() {
    return new Builder().build();
  }

  /**
   * Builder used to configure new {@link OperaDriverService} instances.
   */
  @AutoService(DriverService.Builder.class)
  public static class Builder extends DriverService.Builder<
      OperaDriverService, OperaDriverService.Builder> {

    private boolean verbose = Boolean.getBoolean(OPERA_DRIVER_VERBOSE_LOG_PROPERTY);
    private boolean silent = Boolean.getBoolean(OPERA_DRIVER_SILENT_OUTPUT_PROPERTY);

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (BrowserType.OPERA_BLINK.equals(capabilities.getBrowserName())) {
        score++;
      }

      if (BrowserType.OPERA.equals(capabilities.getBrowserName())) {
        score++;
      }

      if (capabilities.getCapability(OperaOptions.CAPABILITY) != null) {
        score++;
      }

      return score;
    }

    /**
     * Configures the driver server verbosity.
     *
     * @param verbose true for verbose output, false otherwise.
     * @return A self reference.
    */
    public Builder withVerbose(boolean verbose) {
      this.verbose = verbose;
      return this;
    }

    /**
     * Configures the driver server for silent output.
     *
     * @param silent true for silent output, false otherwise.
     * @return A self reference.
    */
    public Builder withSilent(boolean silent) {
      this.silent = silent;
      return this;
    }

    @Override
    protected File findDefaultExecutable() {
      return findExecutable("operadriver", OPERA_DRIVER_EXE_PROPERTY,
                            "https://github.com/operasoftware/operachromiumdriver",
                            "https://github.com/operasoftware/operachromiumdriver/releases");
    }

    @Override
    protected ImmutableList<String> createArgs() {
      if (getLogFile() == null) {
        String logFilePath = System.getProperty(OPERA_DRIVER_LOG_PROPERTY);
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

      return argsBuilder.build();
    }

    @Override
    protected OperaDriverService createDriverService(File exe, int port,
                                                      ImmutableList<String> args,
                                                      ImmutableMap<String, String> environment) {
      try {
        return new OperaDriverService(exe, port, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
