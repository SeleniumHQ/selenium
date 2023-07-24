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

package org.openqa.selenium.ie;

import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;
import static org.openqa.selenium.remote.Browser.IE;

import com.google.auto.service.AutoService;
import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.service.DriverService;

/** Manages the life and death of an IEDriverServer. */
public class InternetExplorerDriverService extends DriverService {

  public static final String IE_DRIVER_NAME = "IEDriverServer";

  /**
   * System property that defines the location of the IEDriverServer executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String IE_DRIVER_EXE_PROPERTY = "webdriver.ie.driver";

  /**
   * System property that defines the location of the file where IEDriverServer should write log
   * messages to.
   */
  public static final String IE_DRIVER_LOGFILE_PROPERTY = "webdriver.ie.driver.logfile";

  /**
   * System property that defines the {@link InternetExplorerDriverLogLevel} for IEDriverServer
   * logs.
   */
  public static final String IE_DRIVER_LOGLEVEL_PROPERTY = "webdriver.ie.driver.loglevel";

  /** System property that defines host to which will be bound IEDriverServer. */
  public static final String IE_DRIVER_HOST_PROPERTY = "webdriver.ie.driver.host";

  /** System property that defines path to which will be extracted IEDriverServer library. */
  public static final String IE_DRIVER_EXTRACT_PATH_PROPERTY = "webdriver.ie.driver.extractpath";

  /** System property that defines logging to stdout for IEDriverServer. */
  public static final String IE_DRIVER_SILENT_PROPERTY = "webdriver.ie.driver.silent";

  /**
   * @param executable The IEDriverServer executable.
   * @param port Which port to start the IEDriverServer on.
   * @param timeout Timeout waiting for driver server to start.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public InternetExplorerDriverService(
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
    return IE_DRIVER_NAME;
  }

  public String getDriverProperty() {
    return IE_DRIVER_EXE_PROPERTY;
  }

  @Override
  public Capabilities getDefaultDriverOptions() {
    return new InternetExplorerOptions();
  }

  /**
   * Configures and returns a new {@link InternetExplorerDriverService} using the default
   * configuration. In this configuration, the service will use the IEDriverServer executable
   * identified by the {@link org.openqa.selenium.remote.service.DriverFinder#getPath(DriverService,
   * Capabilities)}. Each service created by this method will be configured to use a free port on
   * the current system.
   *
   * @return A new InternetExplorerDriverService using the default configuration.
   */
  public static InternetExplorerDriverService createDefaultService() {
    return new Builder().build();
  }

  /** Builder used to configure new {@link InternetExplorerDriverService} instances. */
  @AutoService(DriverService.Builder.class)
  public static class Builder
      extends DriverService.Builder<
          InternetExplorerDriverService, InternetExplorerDriverService.Builder> {

    private InternetExplorerDriverLogLevel logLevel;
    private String host = null;
    private File extractPath = null;
    private Boolean silent = null;

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (IE.is(capabilities)) {
        score++;
      }

      if (capabilities.getCapability(InternetExplorerOptions.IE_OPTIONS) != null) {
        score++;
      }

      return score;
    }

    /**
     * Configures the logging level for the driver server.
     *
     * @param logLevel A level of the log verbosity.
     * @return A self reference.
     */
    public Builder withLogLevel(InternetExplorerDriverLogLevel logLevel) {
      this.logLevel = logLevel;
      return this;
    }

    /**
     * Configures the host to which the driver server bound.
     *
     * @param host A host name.
     * @return A self reference.
     */
    public Builder withHost(String host) {
      this.host = host;
      return this;
    }

    /**
     * Configures path to which the driver server library will be extracted.
     *
     * @param extractPath A path.
     * @return A self reference.
     */
    public Builder withExtractPath(File extractPath) {
      this.extractPath = extractPath;
      return this;
    }

    /**
     * Configures silence in stdout of the driver server by unlogged messages.
     *
     * @param silent To be silent in stdout or not.
     * @return A self reference.
     */
    public Builder withSilent(Boolean silent) {
      this.silent = silent;
      return this;
    }

    @Override
    protected void loadSystemProperties() {
      if (getLogFile() == null) {
        String logFilePath = System.getProperty(IE_DRIVER_LOGFILE_PROPERTY);
        if (logFilePath != null) {
          withLogFile(new File(logFilePath));
        }
      }
      if (logLevel == null) {
        String level = System.getProperty(IE_DRIVER_LOGLEVEL_PROPERTY);
        if (level != null) {
          logLevel = InternetExplorerDriverLogLevel.valueOf(level);
        }
      }
      if (host == null) {
        String hostProperty = System.getProperty(IE_DRIVER_HOST_PROPERTY);
        if (hostProperty != null) {
          host = hostProperty;
        }
      }
      if (extractPath == null) {
        String extractPathProperty = System.getProperty(IE_DRIVER_EXTRACT_PATH_PROPERTY);
        if (extractPathProperty != null) {
          extractPath = new File(extractPathProperty);
        }
      }
      if (silent == null) {
        String silentProperty = System.getProperty(IE_DRIVER_SILENT_PROPERTY);
        if (silentProperty != null) {
          silent = Boolean.valueOf(silentProperty);
        }
      }
    }

    @Override
    protected List<String> createArgs() {
      List<String> args = new ArrayList<>();
      args.add(String.format("--port=%d", getPort()));

      if (logLevel != null) {
        args.add(String.format("--log-level=%s", logLevel));
      }
      if (host != null) {
        args.add(String.format("--host=%s", host));
      }
      if (extractPath != null) {
        args.add(String.format("--extract-path=\"%s\"", extractPath.getAbsolutePath()));
      }
      if (silent != null && silent.equals(Boolean.TRUE)) {
        args.add("--silent");
      }

      return unmodifiableList(args);
    }

    @Override
    protected InternetExplorerDriverService createDriverService(
        File exe, int port, Duration timeout, List<String> args, Map<String, String> environment) {
      try {
        InternetExplorerDriverService service =
            new InternetExplorerDriverService(exe, port, timeout, args, environment);
        service.sendOutputTo(getLogOutput(IE_DRIVER_LOGFILE_PROPERTY));
        return service;
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
