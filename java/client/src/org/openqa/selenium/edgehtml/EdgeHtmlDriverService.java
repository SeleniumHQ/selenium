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

package org.openqa.selenium.edgehtml;

import static java.util.Collections.unmodifiableList;

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class EdgeHtmlDriverService extends DriverService {

  /**
   * System property that defines the location of the MicrosoftWebDriver executable that will be
   * used by the default service.
   */
  public static final String EDGEHTML_DRIVER_EXE_PROPERTY = "webdriver.edgehtml.driver";

  /**
   * System property that defines the default location where MicrosoftWebDriver output is logged.
   */
  public static final String EDGEHTML_DRIVER_LOG_PROPERTY = "webdriver.edgehtml.logfile";

  /**
   * Boolean system property that defines whether the MicrosoftWebDriver executable should be started
   * with verbose logging.
   */
  public static final String EDGEHTML_DRIVER_VERBOSE_LOG_PROPERTY = "webdriver.edgehtml.verboseLogging";

  public EdgeHtmlDriverService(File executable, int port,
                               List<String> args,
                               Map<String, String> environment) throws IOException {
    super(executable, port, DEFAULT_TIMEOUT, args, environment);
  }

  public EdgeHtmlDriverService(File executable, int port,
                               Duration timeout,
                               List<String> args,
                               Map<String, String> environment) throws IOException {
    super(executable, port, timeout, args, environment);
  }

  /**
   * Configures and returns a new {@link EdgeHtmlDriverService} using the default configuration. In
   * this configuration, the service will use the MicrosoftWebDriver executable identified by the
   * {@link #EDGEHTML_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new EdgeDriverService using the default configuration.
   */
  public static EdgeHtmlDriverService createDefaultService() {
    return new Builder().build();
  }

  @AutoService(DriverService.Builder.class)
  public static class Builder extends DriverService.Builder<
      EdgeHtmlDriverService, EdgeHtmlDriverService.Builder> {

    private boolean verbose = Boolean.getBoolean(EDGEHTML_DRIVER_VERBOSE_LOG_PROPERTY);

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (BrowserType.EDGE.equals(capabilities.getBrowserName())) {
        score++;
      }

      Object useChromium = capabilities.getCapability(EdgeHtmlOptions.USE_CHROMIUM);
      if (useChromium == null || Objects.equals(useChromium, true)) {
        score--;
      }

      return score;
    }

    /**
     * Configures the driver server verbosity.
     *
     * @param verbose whether verbose output is used
     */
    public EdgeHtmlDriverService.Builder withVerbose(boolean verbose) {
      this.verbose = verbose;
      return this;
    }

    @Override
    protected File findDefaultExecutable() {
      return findExecutable("MicrosoftWebDriver", EDGEHTML_DRIVER_EXE_PROPERTY,
                            "https://github.com/SeleniumHQ/selenium/wiki/MicrosoftWebDriver",
                            "http://go.microsoft.com/fwlink/?LinkId=619687");
    }

    @Override
    protected List<String> createArgs() {
      List<String> args = new ArrayList<>();
      args.add(String.format("--port=%d", getPort()));

      if (verbose) {
        args.add("--verbose");
      }

      return unmodifiableList(args);
    }

    @Override
    protected EdgeHtmlDriverService createDriverService(File exe, int port,
                                                        Duration timeout,
                                                        List<String> args,
                                                        Map<String, String> environment) {
      try {
        EdgeHtmlDriverService
            service = new EdgeHtmlDriverService(exe, port, timeout, args, environment);

        if (getLogFile() != null) {
          service.sendOutputTo(new FileOutputStream(getLogFile()));
        } else {
          String logFile = System.getProperty(EDGEHTML_DRIVER_LOG_PROPERTY);
          if (logFile != null) {
            service.sendOutputTo(new FileOutputStream(logFile));
          }
        }

        return service;
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }

}
