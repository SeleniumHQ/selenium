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

import static com.google.common.base.Preconditions.checkNotNull;
import static java.util.concurrent.TimeUnit.SECONDS;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.io.ByteStreams;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

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
      ImmutableList<String> args,
      ImmutableMap<String, String> environment) throws IOException {
    super(executable, port, args, environment);
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

    Object binary = caps.getCapability(FirefoxDriver.BINARY);
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

    return new Builder().build();
  }

  @Override
  protected void waitUntilAvailable() {
    PortProber.waitForPortUp(getUrl().getPort(), 20, SECONDS);
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
    protected boolean isLegacy() {
      return false;
    }

    @Override
    public int score(Capabilities capabilities) {
      if (capabilities.getCapability(FirefoxDriver.MARIONETTE) != null
          && ! capabilities.is(FirefoxDriver.MARIONETTE)) {
        return 0;
      }

      int score = 0;

      if (BrowserType.FIREFOX.equals(capabilities.getBrowserName())) {
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
      checkNotNull(firefoxBinary);
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
    protected ImmutableList<String> createArgs() {
      ImmutableList.Builder<String> argsBuilder = ImmutableList.builder();
      argsBuilder.add(String.format("--port=%d", getPort()));
      if (firefoxBinary != null) {
        argsBuilder.add("-b");
        argsBuilder.add(firefoxBinary.getPath());
      } // else GeckoDriver will be responsible for finding Firefox on the PATH or via a capability.
      return argsBuilder.build();
    }

    @Override
    protected GeckoDriverService createDriverService(File exe, int port,
                                                     ImmutableList<String> args,
                                                     ImmutableMap<String, String> environment) {
      try {
        GeckoDriverService service = new GeckoDriverService(exe, port, args, environment);
        String firefoxLogFile = System.getProperty(FirefoxDriver.SystemProperty.BROWSER_LOGFILE);
        if (firefoxLogFile != null) { // System property has higher precedence
          if ("/dev/stdout".equals(firefoxLogFile)) {
            service.sendOutputTo(System.out);
          } else if ("/dev/stderr".equals(firefoxLogFile)) {
            service.sendOutputTo(System.err);
          } else if ("/dev/null".equals(firefoxLogFile)) {
            service.sendOutputTo(ByteStreams.nullOutputStream());
          } else {
            service.sendOutputTo(new FileOutputStream(firefoxLogFile));
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
