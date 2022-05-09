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

import com.google.auto.service.AutoService;
import com.google.common.io.ByteStreams;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.util.Collections.unmodifiableList;
import static java.util.concurrent.TimeUnit.MILLISECONDS;
import static org.openqa.selenium.remote.Browser.FIREFOX;

/**
 * Manages the life and death of an GeckoDriver aka 'wires'.
 */
public class GeckoDriverService extends FirefoxDriverService {

  /**
   * System property that defines the location of the GeckoDriver executable
   * that will be used by the {@link #createDefaultService() default service}.
   */
  public static final String GECKO_DRIVER_EXE_PROPERTY = "webdriver.gecko.driver";

  /**
   * @param executable The GeckoDriver executable.
   * @param port Which port to start the GeckoDriver on.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public GeckoDriverService(
      File executable,
      int port,
      List<String> args,
      Map<String, String> environment) throws IOException {
    super(executable, port, DEFAULT_TIMEOUT, args, environment);
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
      Map<String, String> environment) throws IOException {
    super(executable, port, timeout, args, environment);
  }

  /**
   * Configures and returns a new {@link GeckoDriverService} using the default configuration. In
   * this configuration, the service will use the GeckoDriver executable identified by the
   * {@link #GECKO_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new GeckoDriverService using the default configuration.
   */
  public static GeckoDriverService createDefaultService() {
    return new Builder().build();
  }

  static GeckoDriverService createDefaultService(Capabilities caps) {
    Builder builder = new Builder();

    Object binary = caps.getCapability(FirefoxDriver.Capability.BINARY);
    if (binary != null) {
      FirefoxBinary actualBinary;
      if (binary instanceof FirefoxBinary) {
        actualBinary = (FirefoxBinary) binary;
      } else if (binary instanceof String) {
        actualBinary = new FirefoxBinary(new File(String.valueOf(binary)));
      } else {
        throw new IllegalArgumentException(
            "Expected binary to be a string or a binary: " + binary);
      }

      builder.usingFirefoxBinary(actualBinary);
    }

    return builder.build();
  }

  @Override
  protected void waitUntilAvailable() {
    PortProber.waitForPortUp(getUrl().getPort(), (int) getTimeout().toMillis(), MILLISECONDS);
  }

  @Override
  protected boolean hasShutdownEndpoint() {
    return false;
  }

  /**
   * Builder used to configure new {@link GeckoDriverService} instances.
   */
  @AutoService(DriverService.Builder.class)
  public static class Builder extends FirefoxDriverService.Builder<
        GeckoDriverService, GeckoDriverService.Builder> {

    private FirefoxBinary firefoxBinary;

    public Builder() {
    }

    @Override
    public int score(Capabilities capabilities) {
      if (capabilities.getCapability(FirefoxDriver.Capability.MARIONETTE) != null
          && ! capabilities.is(FirefoxDriver.Capability.MARIONETTE)) {
        return 0;
      }

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
     */
    public Builder usingFirefoxBinary(FirefoxBinary firefoxBinary) {
      Require.nonNull("Firefox binary", firefoxBinary);
      checkExecutable(firefoxBinary.getFile());
      this.firefoxBinary = firefoxBinary;
      return this;
    }

    @Override
    protected FirefoxDriverService.Builder withOptions(FirefoxOptions options) {
      usingFirefoxBinary(options.getBinary());
      return this;
    }

    @Override
    protected File findDefaultExecutable() {
      return findExecutable(
        "geckodriver", GECKO_DRIVER_EXE_PROPERTY,
        "https://github.com/mozilla/geckodriver",
        "https://github.com/mozilla/geckodriver/releases");
    }

    @Override
    protected List<String> createArgs() {
      List<String> args = new ArrayList<>();
      int wsPort = PortProber.findFreePort();
      args.add(String.format("--port=%d", getPort()));
      args.add(String.format("--websocket-port=%d", wsPort));
      args.add(String.format("--allow-origins=http://localhost:%d", wsPort));
      if (firefoxBinary != null) {
        args.add("-b");
        args.add(firefoxBinary.getPath());
      } else {
        // Read system property for Firefox binary and use those if they are set
        Optional<Executable> executable =
          Optional.ofNullable(FirefoxBinary.locateFirefoxBinaryFromSystemProperty());
        executable.ifPresent(e -> {
          args.add("-b");
          args.add(e.getPath());
        });
      }
      // If the binary stays null, GeckoDriver will be responsible for finding Firefox on the PATH or via a capability.
      return unmodifiableList(args);
    }

    @Override
    protected GeckoDriverService createDriverService(File exe, int port,
                                                     Duration timeout,
                                                     List<String> args,
                                                     Map<String, String> environment) {
      try {
        GeckoDriverService service = new GeckoDriverService(exe, port, timeout, args, environment);
        String firefoxLogFile = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE);
        if (firefoxLogFile != null) { // System property has higher precedence
          switch (firefoxLogFile) {
            case "/dev/stdout":
              service.sendOutputTo(System.out);
              break;
            case "/dev/stderr":
              service.sendOutputTo(System.err);
              break;
            case "/dev/null":
              service.sendOutputTo(ByteStreams.nullOutputStream());
              break;
            default:
              service.sendOutputTo(new FileOutputStream(firefoxLogFile));
              break;
          }
        } else {
          if (getLogFile() != null) {
            service.sendOutputTo(new FileOutputStream(getLogFile()));
          } else {
            service.sendOutputTo(System.err);
          }
        }
        return service;
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
