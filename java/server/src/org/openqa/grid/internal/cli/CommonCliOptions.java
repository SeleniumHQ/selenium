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

package org.openqa.grid.internal.cli;

import com.beust.jcommander.Parameter;

import org.openqa.grid.internal.utils.configuration.StandaloneConfiguration;

public abstract class CommonCliOptions {

  @Parameter(
      names = {"--version", "-version"},
      description = "Displays the version and exits."
  )
  // initially defaults to false from boolean primitive type
  public Boolean version = false;

  @Parameter(
      names = {"--help", "-help", "-h"},
      help = true,
      hidden = true,
      description = "Displays this help."
  )
  // Initially defaults to false from boolean primitive type
  public Boolean help = false;

  /**
   * Enable {@code LogLevel.FINE} log messages. Default {@code false}.
   */
  @Parameter(
      names = {"--debug", "-debug"},
      description = "<Boolean> : enables LogLevel.FINE."
  )
  private Boolean debug = false;

  /**
   *   Filename to use for logging. Defaults to {@code null}.
   */
  @Parameter(
      names = "-log",
      description = "<String> filename : the filename to use for logging. If omitted, will log to STDOUT"
  )
  private String log;

  /**
   * Server role. Default determined by configuration type.
   */
  @Parameter(
      names = "-role",
      description = "<String> options are [hub], [node], or [standalone]."
  )
  private String role;

  /**
   * Hostname or IP to use. Defaults to {@code null}. Automatically determined when {@code null}.
   */
  @Parameter(
      names = "-host",
      description =  "<String> IP or hostname : usually determined automatically. Most commonly useful in exotic network configurations (e.g. network with VPN)"
  )
  // initially defaults to null from type
  private String host;

  /**
   * Port to bind to. Default determined by configuration type.
   */
  @Parameter(
      names = {"-port"},
      description = "<Integer> : the port number the server will use."
  )
  private Integer port;

  /**
   * Client timeout. Default 1800 sec.
   */
  @Parameter(
      names = {"-timeout", "-sessionTimeout"},
      description = "<Integer> in seconds : Specifies the timeout before the server automatically kills a session that hasn't had any activity in the last X seconds. The test slot will then be released for another test to use. This is typically used to take care of client crashes. For grid hub/node roles, cleanUpCycle must also be set."
  )
  private Integer timeout;

  /**
   * Browser timeout. Default 0 (indefinite wait).
   */
  @Parameter(
      names = "-browserTimeout",
      description = "<Integer> in seconds : number of seconds a browser session is allowed to hang while a WebDriver command is running (example: driver.get(url)). If the timeout is reached while a WebDriver command is still processing, the session will quit. Minimum value is 60. An unspecified, zero, or negative value means wait indefinitely."
  )
  private Integer browserTimeout;

  @Parameter(
      names = {"-avoidProxy"},
      description = "DO NOT USE: Hack to allow selenium 3.0 server run in SauceLabs",
      hidden = true
  )
  // initially defaults to false from boolean primitive type
  private Boolean avoidProxy;

  /**
   *   Max threads for Jetty. Defaults to {@code null}.
   */
  @Parameter(
      names = {"-jettyThreads", "-jettyMaxThreads"},
      description = "<Integer> : max number of threads for Jetty. An unspecified, zero, or negative value means the Jetty default value (200) will be used."
  )
  private Integer jettyMaxThreads;

  @Parameter(
      names = "-browserSideLog",
      description = "DO NOT USE: Provided for compatibility with 2.0",
      hidden = true
  )
  // initially defaults to false from boolean primitive type
  private Boolean browserSideLog = false;

  @Parameter(
      names = "-captureLogsOnQuit",
      description = "DO NOT USE: Provided for compatibility with 2.0",
      hidden = true
  )
  // initially defaults to false from boolean primitive type
  private Boolean captureLogsOnQuit = false;

  void fillCommonConfiguration(StandaloneConfiguration configuration) {
    if (debug != null) {
      configuration.debug = debug;
    }
    if (log != null) {
      configuration.log = log;
    }
    if (host != null) {
      configuration.host = host;
    } else if (host == null) {
      host = "0.0.0.0"; //default to all IPv4 interfaces
    }
    if (port != null) {
      configuration.port = port;
    }
    if (timeout != null) {
      configuration.timeout = timeout;
    }
    if (browserTimeout != null) {
      configuration.browserTimeout = browserTimeout;
    }
  }

  abstract public StandaloneConfiguration toConfiguration();
}
