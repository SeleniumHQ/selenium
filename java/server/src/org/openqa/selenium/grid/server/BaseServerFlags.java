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

package org.openqa.selenium.grid.server;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.ConfigValue;

public class BaseServerFlags {

  @Parameter(
      names = {"--host"},
      description =  "IP or hostname : usually determined automatically.")
  @ConfigValue(section = "server", name = "hostname")
  private String host;

  @Parameter(description = "Port to listen on.", names = {"-p", "--port"})
  @ConfigValue(section = "server", name = "port")
  private int port;

  @Parameter(description = "Maximum number of listener threads.", names = "--max-threads")
  @ConfigValue(section = "server", name = "max-threads")
  private int maxThreads = Runtime.getRuntime().availableProcessors() * 3;

  @Parameter(description = "Configure logging", hidden = true, arity = 1)
  @ConfigValue(section = "logging", name = "enable")
  private boolean configureLogging = true;

  @Parameter(description = "Use structured logs", names = "--structured-logs")
  @ConfigValue(section = "logging", name = "structured-logs")
  private boolean structuredLogs = false;

  @Parameter(description = "Use plain log lines", names = "--plain-logs", arity = 1)
  @ConfigValue(section = "logging", name = "plain-logs")
  private boolean plainLogs = true;

  public BaseServerFlags(int defaultPort) {
    this.port = defaultPort;
  }
}
