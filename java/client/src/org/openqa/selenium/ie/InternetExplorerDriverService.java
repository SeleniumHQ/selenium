/*
 Copyright 2011 Software Freedom Conservancy.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

package org.openqa.selenium.ie;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.browserlaunchers.DriverService;

import java.io.File;
import java.io.IOException;

/**
 * Manages the life and death of an IEDriverServer.
 */
public class InternetExplorerDriverService extends DriverService {

  /**
   * System property that defines the location of the IEDriverServer executable that will be used by
   * the {@link #createDefaultService() default service}.
   */
  public static final String IE_DRIVER_EXE_PROPERTY = "webdriver.ie.driver";

  /**
   *
   * @param executable The IEDriverServer executable.
   * @param port Which port to start the IEDriverServer on.
   * @param environment The environment for the launched server.
   * @param logFile Optional file to dump logs to.
   * @throws IOException If an I/O error occurs.
   */
  private InternetExplorerDriverService(File executable, int port,
      ImmutableMap<String, String> environment, File logFile) throws IOException {
    super(executable, port, environment, logFile);
  }

  /**
   * Configures and returns a new {@link InternetExplorerDriverService} using the default configuration. In
   * this configuration, the service will use the IEDriverServer executable identified by the
   * {@link #IE_DRIVER_EXE_PROPERTY} system property. Each service created by this method will
   * be configured to use a free port on the current system.
   *
   * @return A new InternetExplorerDriverService using the default configuration.
   */
  public static InternetExplorerDriverService createDefaultService() {
    File exe = findExecutable("IEDriverServer", IE_DRIVER_EXE_PROPERTY,
      "http://code.google.com/p/selenium/wiki/InternetExplorerDriver",
      "http://code.google.com/p/selenium/downloads/list");
    return (InternetExplorerDriverService) new Builder().usingDriverExecutable(exe).usingAnyFreePort().build();
  }

  /**
   * Builder used to configure new {@link InternetExplorerDriverService} instances.
   */
  public static class Builder extends DriverService.Builder {

    protected DriverService buildDriverService() throws IOException {
      return new InternetExplorerDriverService(exe, port, environment, logFile);
    }
  }
}
