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

package org.openqa.selenium.grid.log;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.ALL_ROLES;

@AutoService(HasRoles.class)
public class LoggingFlags implements HasRoles {

  @Parameter(description = "Configure logging", hidden = true, names = "--configure-logging", arity = 1)
  @ConfigValue(section = "logging", name = "enable", example = "true")
  private Boolean configureLogging = true;

  @Parameter(description = "Use structured logs", names = "--structured-logs")
  @ConfigValue(section = "logging", name = "structured-logs", example = "false")
  private Boolean structuredLogs = false;

  @Parameter(description = "Use plain log lines", names = "--plain-logs", arity = 1)
  @ConfigValue(section = "logging", name = "plain-logs", example = "true")
  private Boolean plainLogs = true;

  @Parameter(description = "Enable trace collection", hidden = true, names = "--tracing", arity = 1)
  @ConfigValue(section = "logging", name = "tracing", example = "true")
  private Boolean enableTracing = true;

  @Parameter(description = "File to write out logs", hidden = true, names = "--log", arity = 1)
  @ConfigValue(section = "logging", name = "log-file", example = "true")
  private String logFile;

  @Override
  public Set<Role> getRoles() {
    return ALL_ROLES;
  }
}
