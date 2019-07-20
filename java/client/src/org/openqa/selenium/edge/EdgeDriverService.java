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
package org.openqa.selenium.edge;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Manages the life and death of the EdgeDriver (MicrosoftWebDriver or MSEdgeDriver).
 */
public abstract class EdgeDriverService extends DriverService {

  /**
   * System property that defines the location of the EdgeDriver executable that will be used by
   * the default service.
   */
  public static final String EDGE_DRIVER_EXE_PROPERTY = "webdriver.edge.driver";

  /**
   * System property that defines the default location where MicrosoftWebDriver output is logged.
   */
  public static final String EDGE_DRIVER_LOG_PROPERTY = "webdriver.edge.logfile";

  /**
   * Boolean system property that defines whether the MicrosoftWebDriver executable should be started
   * with verbose logging.
   */
  public static final String EDGE_DRIVER_VERBOSE_LOG_PROPERTY = "webdriver.edge.verboseLogging";

  /**
   * @param executable The EdgeDriver executable.
   * @param port Which port to start the EdgeDriver on.
   * @param args The arguments to the launched server.
   * @param environment The environment for the launched server.
   * @throws IOException If an I/O error occurs.
   */
  public EdgeDriverService(
      File executable,
      int port,
      List<String> args,
      Map<String, String> environment) throws IOException {
    super(executable, port, ImmutableList.copyOf(args), ImmutableMap.copyOf(environment));
  }

  public static abstract class Builder<DS extends EdgeDriverService, B extends EdgeDriverService.Builder<?, ?>>
      extends DriverService.Builder<DS, B> {

    public abstract boolean isLegacy();
    public abstract EdgeDriverService.Builder withVerbose(boolean verbose);

  }
}
