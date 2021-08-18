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

import com.google.auto.service.AutoService;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.ALL_ROLES;
import static org.openqa.selenium.grid.log.LoggingOptions.DEFAULT_CONFIGURE_LOGGING;
import static org.openqa.selenium.grid.log.LoggingOptions.DEFAULT_HTTP_LOGS;
import static org.openqa.selenium.grid.log.LoggingOptions.DEFAULT_LOG_LEVEL;
import static org.openqa.selenium.grid.log.LoggingOptions.DEFAULT_PLAIN_LOGS;
import static org.openqa.selenium.grid.log.LoggingOptions.DEFAULT_STRUCTURED_LOGS;
import static org.openqa.selenium.grid.log.LoggingOptions.DEFAULT_TRACING_ENABLED;
import static org.openqa.selenium.grid.log.LoggingOptions.LOGGING_SECTION;

@SuppressWarnings("FieldMayBeFinal")
@AutoService(HasRoles.class)
public class LoggingFlags implements HasRoles {

  @Parameter(
    description = "Configure logging",
    hidden = true,
    names = "--configure-logging",
    arity = 1)
  @ConfigValue(section = LOGGING_SECTION, name = "enable", example = "true")
  private Boolean configureLogging = DEFAULT_CONFIGURE_LOGGING;

  @Parameter(description = "Use structured logs", names = "--structured-logs", arity = 1)
  @ConfigValue(section = LOGGING_SECTION, name = "structured-logs", example = "false")
  private Boolean structuredLogs = DEFAULT_STRUCTURED_LOGS;

  @Parameter(description = "Use plain log lines", names = "--plain-logs", arity = 1)
  @ConfigValue(section = LOGGING_SECTION, name = "plain-logs", example = "true")
  private Boolean plainLogs = DEFAULT_PLAIN_LOGS;

  @Parameter(description = "Enable trace collection", hidden = true, names = "--tracing", arity = 1)
  @ConfigValue(section = LOGGING_SECTION, name = "tracing", example = "true")
  private Boolean enableTracing = DEFAULT_TRACING_ENABLED;

  @Parameter(description = "Enable http logging. Tracing should be enabled to log http logs.", hidden = true, names = "--http-logs", arity = 1)
  @ConfigValue(section = LOGGING_SECTION, name = "http-logs", example = "true")
  private Boolean httpLogs = DEFAULT_HTTP_LOGS;

  @Parameter(description = "File to write out logs. "
                           + "Ensure the file path is compatible with the operating system's file path.\n"
                           + "Windows path example : \\\\path\\to\\file\\gridlog.log OR "
                           + "C:\\path\\path\\to\\file\\gridlog.log \n"
                           + "Linux/Unix/MacOS path example : /path/to/file/gridlog.log \n"
    , names = "--log", arity = 1)
  @ConfigValue(section = LOGGING_SECTION, name = "log-file", example = {"'\\\\path\\to\\file\\gridlog.log'",
                                                                        "'C:\\path\\path\\to\\file\\gridlog.log'",
                                                                        "'/path/to/file/gridlog.log'"})
  private String logFile;

  @Parameter(description = "Log encoding", names = "--log-encoding", arity = 1)
  @ConfigValue(section = LOGGING_SECTION, name = "log-encoding", example = "UTF-8")
  private String logEncoding;

  @Parameter(description =
    "Log level. Default logging level is INFO. Log levels are described here " +
    "https://docs.oracle.com/javase/7/docs/api/java/util/logging/Level.html",
    names = "--log-level", arity = 1)
  @ConfigValue(section = LOGGING_SECTION, name = "log-level", example = "INFO")
  private String logLevel = DEFAULT_LOG_LEVEL;

  @Override
  public Set<Role> getRoles() {
    return ALL_ROLES;
  }
}
