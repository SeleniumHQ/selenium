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
package org.openqa.selenium.edge.edgehtml;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.edge.EdgeDriverService;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class EdgeHTMLDriverService extends EdgeDriverService {

  public EdgeHTMLDriverService(File executable, int port, ImmutableList<String> args,
                               ImmutableMap<String, String> environment) throws IOException {
    super(executable, port, args, environment);
  }

  /**
   * Configures and returns a new {@link EdgeHTMLDriverService} using the default configuration. In
   * this configuration, the service will use the MicrosoftWebDriver executable identified by the
   * {@link #EDGE_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new EdgeDriverService using the default configuration.
   */
  public static EdgeHTMLDriverService createDefaultService() {
    return new Builder().build();
  }

  @AutoService(DriverService.Builder.class)
  public static class Builder extends EdgeDriverService.Builder<
      EdgeHTMLDriverService, EdgeHTMLDriverService.Builder> {

    private boolean verbose = Boolean.getBoolean(EDGE_DRIVER_VERBOSE_LOG_PROPERTY);

    @Override
    public boolean isEdgeHTML() {
      return true;
    }

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (BrowserType.EDGE.equals(capabilities.getBrowserName())) {
        score++;
      }

      return score;
    }

    /**
     * Configures the driver server verbosity.
     *
     * @param verbose True for verbose output, false otherwise.
     * @return A self reference.
     */
    @Override
    public EdgeDriverService.Builder withVerbose(boolean verbose) {
      this.verbose = verbose;
      return this;
    }

    @Override
    protected File findDefaultExecutable() {
      return findExecutable("MicrosoftWebDriver", EDGE_DRIVER_EXE_PROPERTY,
                            "https://github.com/SeleniumHQ/selenium/wiki/MicrosoftWebDriver",
                            "http://go.microsoft.com/fwlink/?LinkId=619687");
    }

    @Override
    protected ImmutableList<String> createArgs() {
      ImmutableList.Builder<String> argsBuilder = ImmutableList.builder();
      argsBuilder.add(String.format("--port=%d", getPort()));

      if (verbose) {
        argsBuilder.add("--verbose");
      }

      return argsBuilder.build();
    }

    @Override
    protected EdgeHTMLDriverService createDriverService(File exe, int port,
                                                        ImmutableList<String> args,
                                                        ImmutableMap<String, String> environment) {
      try {
        EdgeHTMLDriverService
            service = new EdgeHTMLDriverService(exe, port, args, environment);

        if (getLogFile() != null) {
          service.sendOutputTo(new FileOutputStream(getLogFile()));
        } else {
          String logFile = System.getProperty(EDGE_DRIVER_LOG_PROPERTY);
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
