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

import static java.util.concurrent.TimeUnit.SECONDS;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.firefox.internal.Executable;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;

/**
 * Manages the life and death of an GeckoDriver aka 'wires'.
 */
public class GeckoDriverService extends DriverService {

  /**
   * System property that defines the location of the GeckoDriver executable
   * that will be used by the {@link #createDefaultService() default service}.
   */
  public static final String GECKO_DRIVER_EXE_PROPERTY = "webdriver.gecko.driver";

  /**
   *
   * @param executable The GeckoDriver executable.
   * @param port Which port to start the GeckoDriver on.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public GeckoDriverService(File executable, int port, ImmutableList<String> args,
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
    return new Builder().usingAnyFreePort().build();
  }

  @Override
  protected void waitUntilAvailable() throws MalformedURLException {
    PortProber.waitForPortUp(getUrl().getPort(), 20, SECONDS);
  }

  /**
   * Builder used to configure new {@link GeckoDriverService} instances.
   */
  public static class Builder extends DriverService.Builder<
    GeckoDriverService, GeckoDriverService.Builder> {

    private Executable binary;
    public Builder() {
      this(new FirefoxBinary());
    }

    /**
     * @param binary - A custom location where the Firefox binary is available.
     */
    public Builder(FirefoxBinary binary) {
      this.binary = binary.getExecutable();
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
      if (getLogFile() != null) {
        argsBuilder.add(String.format("--log-file=\"%s\"", getLogFile().getAbsolutePath()));
      }
      try {
        argsBuilder.add("-b");
        argsBuilder.add(binary.getPath());
      } catch (WebDriverException e) {
        // Unable to find Firefox. GeckoDriver will be responsible for finding
        // Firefox on the PATH or via a capability.
      }
      return argsBuilder.build();
    }

    @Override
    protected GeckoDriverService createDriverService(File exe, int port,
                                                                ImmutableList<String> args,
                                                                ImmutableMap<String, String> environment) {
      try {
        return new GeckoDriverService(exe, port, args, environment);
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    }
  }
}
