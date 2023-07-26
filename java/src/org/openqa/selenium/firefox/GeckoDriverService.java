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

package org.openqa.selenium.firefox;

import static java.util.Collections.unmodifiableList;
import static java.util.Collections.unmodifiableMap;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.remote.Browser.FIREFOX;

import com.google.auto.service.AutoService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.service.DriverService;

/** Manages the life and death of an GeckoDriver */
public class GeckoDriverService extends FirefoxDriverService {

  public static final String GECKO_DRIVER_NAME = "geckodriver";

  /**
   * System property that defines the location of the GeckoDriver executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String GECKO_DRIVER_EXE_PROPERTY = "webdriver.gecko.driver";

  /**
   * System property that defines the location of the file where GeckoDriver should write log
   * messages to.
   */
  public static final String GECKO_DRIVER_LOG_PROPERTY = "webdriver.firefox.logfile";

  /**
   * System property that defines the {@link FirefoxDriverLogLevel} for GeckoDriver logs. See {@link
   * Builder#withLogLevel(FirefoxDriverLogLevel)}
   */
  public static final String GECKO_DRIVER_LOG_LEVEL_PROPERTY = "webdriver.firefox.logLevel";

  /**
   * Boolean system property to disable truncation of long log lines. See {@link
   * Builder#withTruncatedLogs(Boolean)}
   */
  public static final String GECKO_DRIVER_LOG_NO_TRUNCATE = "webdriver.firefox.logTruncate";

  /**
   * System property that defines the location of the directory in which to create profiles See
   * {@link Builder#withProfileRoot(File)}
   */
  public static final String GECKO_DRIVER_PROFILE_ROOT = "webdriver.firefox.profileRoot";

  /**
   * @param executable The GeckoDriver executable.
   * @param port Which port to start the GeckoDriver on.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   * @deprecated use {@link GeckoDriverService#GeckoDriverService(File, int, Duration, List, Map)}
   */
  @Deprecated
  public GeckoDriverService(
      File executable, int port, List<String> args, Map<String, String> environment)
      throws IOException {
    super(
        executable,
        port,
        DEFAULT_TIMEOUT,
        unmodifiableList(new ArrayList<>(args)),
        unmodifiableMap(new HashMap<>(environment)));
  }

  /**
   * @param executable The GeckoDriver executable.
   * @param port Which port to start the GeckoDriver on.
   * @param timeout Timeout waiting for driver server to start.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public GeckoDriverService(
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
    return GECKO_DRIVER_NAME;
  }

  public String getDriverProperty() {
    return GECKO_DRIVER_EXE_PROPERTY;
  }

  @Override
  public Capabilities getDefaultDriverOptions() {
    return new FirefoxOptions();
  }

  /**
   * Configures and returns a new {@link GeckoDriverService} using the default configuration. In
   * this configuration, the service will use the GeckoDriver executable identified by the {@link
   * org.openqa.selenium.remote.service.DriverFinder#getPath(DriverService, Capabilities)}. Each
   * service created by this method will be configured to use a free port on the current system.
   *
   * @return A new GeckoDriverService using the default configuration.
   */
  public static GeckoDriverService createDefaultService() {
    return new Builder().build();
  }

  /**
   * @param caps Capabilities instance - this is not used
   * @return default GeckoDriverService
   * @deprecated use {@link GeckoDriverService#createDefaultService()}
   */
  @Deprecated
  static GeckoDriverService createDefaultService(Capabilities caps) {
    return createDefaultService();
  }

  @Override
  protected void waitUntilAvailable() {
    PortProber.waitForPortUp(getUrl().getPort(), (int) getTimeout().toMillis(), MILLISECONDS);
  }

  @Override
  protected boolean hasShutdownEndpoint() {
    return false;
  }

  /** Builder used to configure new {@link GeckoDriverService} instances. */
  @AutoService(DriverService.Builder.class)
  public static class Builder
      extends FirefoxDriverService.Builder<GeckoDriverService, GeckoDriverService.Builder> {

    private FirefoxBinary firefoxBinary;
    private String allowHosts;
    private FirefoxDriverLogLevel logLevel;
    private Boolean logTruncate;
    private File profileRoot;

    @Override
    public int score(Capabilities capabilities) {
      int score = 0;

      if (FIREFOX.is(capabilities)) {
        score++;
      }

      if (capabilities.getCapability(FirefoxOptions.FIREFOX_OPTIONS) != null) {
        score++;
      }

      return score;
    }

    /**
     * Sets which browser executable the builder will use.
     *
     * @param firefoxBinary The browser executable to use.
     * @return A self reference.
     * @deprecated use {@link FirefoxOptions#setBinary(Path)}
     */
    @Deprecated
    public Builder usingFirefoxBinary(FirefoxBinary firefoxBinary) {
      Require.nonNull("Firefox binary", firefoxBinary);
      this.firefoxBinary = firefoxBinary;
      return this;
    }

    /**
     * Values of the Host header to allow for incoming requests.
     *
     * @param allowHosts Space-separated list of host names.
     * @return A self reference.
     */
    public Builder withAllowHosts(String allowHosts) {
      this.allowHosts = allowHosts;
      return this;
    }

    /**
     * @param logLevel which log events to record.
     * @return A self reference.
     */
    public Builder withLogLevel(FirefoxDriverLogLevel logLevel) {
      this.logLevel = logLevel;
      return this;
    }

    /**
     * @param truncate whether to truncate long lines in the log. Log lines are truncated by
     *     default; setting "false" removes truncation
     * @return A self reference.
     */
    public Builder withTruncatedLogs(Boolean truncate) {
      this.logTruncate = truncate;
      return this;
    }

    /**
     * This is necessary when you do not have permissions to write to the default directory.
     *
     * @param root location to store temporary profiles Defaults to the system temporary directory.
     * @return A self reference.
     */
    public GeckoDriverService.Builder withProfileRoot(File root) {
      this.profileRoot = root;
      return this;
    }

    @Override
    protected void loadSystemProperties() {
      if (logLevel == null) {
        String logFilePath = System.getProperty(GECKO_DRIVER_LOG_LEVEL_PROPERTY);
        if (logFilePath != null) {
          this.logLevel = FirefoxDriverLogLevel.fromString(logFilePath);
        }
      }
      if (logTruncate == null) {
        logTruncate = !Boolean.getBoolean(GECKO_DRIVER_LOG_NO_TRUNCATE);
      }
      if (profileRoot == null) {
        String profileRootFromProperty = System.getProperty(GECKO_DRIVER_PROFILE_ROOT);
        if (profileRootFromProperty != null) {
          profileRoot = new File(profileRootFromProperty);
        }
      }
    }

    @Override
    protected List<String> createArgs() {
      List<String> args = new ArrayList<>();
      args.add(String.format("--port=%d", getPort()));

      int wsPort = PortProber.findFreePort();
      args.add(String.format("--websocket-port=%d", wsPort));

      args.add("--allow-origins");
      args.add(String.format("http://127.0.0.1:%d", wsPort));
      args.add(String.format("http://localhost:%d", wsPort));
      args.add(String.format("http://[::1]:%d", wsPort));

      if (logLevel != null) {
        args.add("--log");
        args.add(logLevel.toString());
      }
      if (logTruncate != null && logTruncate.equals(Boolean.FALSE)) {
        args.add("--log-no-truncate");
      }
      if (profileRoot != null) {
        args.add("--profile-root");
        args.add(profileRoot.getAbsolutePath());
      }

      // deprecated
      if (firefoxBinary != null) {
        args.add("--binary");
        args.add(firefoxBinary.getPath());
      }

      if (allowHosts != null) {
        args.add("--allow-hosts");
        args.addAll(Arrays.asList(allowHosts.split(" ")));
      }
      return unmodifiableList(args);
    }

    @Override
    protected GeckoDriverService createDriverService(
        File exe, int port, Duration timeout, List<String> args, Map<String, String> environment) {
      try {
        GeckoDriverService service = new GeckoDriverService(exe, port, timeout, args, environment);
        service.sendOutputTo(getLogOutput(GECKO_DRIVER_LOG_PROPERTY));
        return service;
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
