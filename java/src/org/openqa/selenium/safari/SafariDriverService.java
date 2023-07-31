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

package org.openqa.selenium.safari;

import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.remote.Browser.SAFARI;

import com.google.auto.service.AutoService;
import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.service.DriverService;

/** Manages the life and death of SafariDriver. */
public class SafariDriverService extends DriverService {

  public static final String SAFARI_DRIVER_NAME = "safaridriver";

  /**
   * System property that defines the location of the safaridriver executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String SAFARI_DRIVER_EXE_PROPERTY = "webdriver.safari.driver";

  private static final String SAFARI_DRIVER_LOGGING = "webdriver.safari.logging";

  private static final File SAFARI_DRIVER_EXECUTABLE = new File("/usr/bin/safaridriver");

  /**
   * @param executable The SafariDriver executable.
   * @param port Which port to start the SafariDriver on.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   * @deprecated use {@link SafariDriverService#SafariDriverService(File, int, Duration, List, Map)}
   */
  @Deprecated
  public SafariDriverService(
      File executable, int port, List<String> args, Map<String, String> environment)
      throws IOException {
    this(executable, port, DEFAULT_TIMEOUT, args, environment);
  }

  /**
   * @param executable The SafariDriver executable.
   * @param port Which port to start the SafariDriver on.
   * @param timeout Timeout waiting for driver server to start.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public SafariDriverService(
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
    return SAFARI_DRIVER_NAME;
  }

  public String getDriverProperty() {
    return SAFARI_DRIVER_EXE_PROPERTY;
  }

  public File getDriverExecutable() {
    return SAFARI_DRIVER_EXECUTABLE;
  }

  @Override
  protected Capabilities getDefaultDriverOptions() {
    return new SafariOptions();
  }

  /**
   * Configures and returns a new {@link SafariDriverService} using the default configuration. In
   * this configuration, the service will use the SafariDriver executable identified by the {@link
   * org.openqa.selenium.remote.service.DriverFinder#getPath(DriverService, Capabilities)}. Each
   * service created by this method will be configured to use a free port on the current system.
   *
   * @return A new SafariDriverService using the default configuration.
   */
  public static SafariDriverService createDefaultService() {
    return new Builder().build();
  }

  @Override
  protected void waitUntilAvailable() {
    try {
      PortProber.waitForPortUp(getUrl().getPort(), (int) getTimeout().toMillis(), MILLISECONDS);
    } catch (RuntimeException e) {
      throw new WebDriverException(e);
    }
  }

  /** Builder used to configure new {@link SafariDriverService} instances. */
  @AutoService(DriverService.Builder.class)
  public static class Builder
      extends DriverService.Builder<SafariDriverService, SafariDriverService.Builder> {

    private Boolean diagnose;

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (SAFARI.is(capabilities)) {
        score++;
      }

      return score;
    }

    public Builder withLogging(Boolean logging) {
      this.diagnose = logging;
      return this;
    }

    @Override
    public Builder withLogFile(File logFile) {
      throw new WebDriverException(
          "Can not set log location for Safari; use withLogging(true) and locate log in"
              + " ~/Library/Logs/com.apple.WebDriver/");
    }

    @Override
    protected void loadSystemProperties() {
      if (diagnose == null) {
        this.diagnose = Boolean.getBoolean(SAFARI_DRIVER_LOGGING);
      }
    }

    @Override
    protected List<String> createArgs() {
      List<String> args = new ArrayList<>(Arrays.asList("--port", String.valueOf(getPort())));
      if (diagnose != null && diagnose.equals(Boolean.TRUE)) {
        args.add("--diagnose");
      }
      return args;
    }

    @Override
    protected SafariDriverService createDriverService(
        File exe, int port, Duration timeout, List<String> args, Map<String, String> environment) {
      try {
        return new SafariDriverService(exe, port, timeout, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
