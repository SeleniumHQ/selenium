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

package org.openqa.selenium.grid.node.relay;

import static org.openqa.selenium.grid.config.StandardGridRoles.NODE_ROLE;
import static org.openqa.selenium.grid.node.relay.RelayOptions.RELAY_SECTION;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.NonSplittingSplitter;
import org.openqa.selenium.grid.config.Role;

@SuppressWarnings("unused")
@AutoService(HasRoles.class)
public class RelayFlags implements HasRoles {

  @Parameter(
      names = {"--service-configuration"},
      description =
          "Configuration for the service where calls will be relayed to. "
              + "It is recommended to provide this type of configuration through a toml config "
              + "file to improve readability. Command line example: "
              + "--service-configuration max-sessions=2 "
              + "stereotype='{\"browserName\": \"safari\", \"platformName\": \"iOS\", "
              + "\"appium:platformVersion\": \"14.5\"}}'",
      arity = 4,
      variableArity = true,
      splitter = NonSplittingSplitter.class)
  @ConfigValue(
      section = RELAY_SECTION,
      name = "configs",
      prefixed = true,
      example =
          "\n"
              + "max-sessions = 2\n"
              + "stereotype = \"{\\\"browserName\\\": \\\"safari\\\", \\\"platformName\\\":"
              + " \\\"iOS\\\", \\\"appium:platformVersion\\\": \\\"14.5\\\" }}\"")
  public List<String> driverConfiguration;

  @Parameter(
      names = {"--service-url"},
      description =
          "URL for connecting to the service that supports WebDriver commands, "
              + "like an Appium server or a cloud service.")
  @ConfigValue(section = RELAY_SECTION, name = "url", example = "\"http://localhost:4723\"")
  private String serviceUrl;

  @Parameter(
      names = {"--service-host"},
      description = "Host name where the service that supports WebDriver commands is running")
  @ConfigValue(section = RELAY_SECTION, name = "host", example = "\"localhost\"")
  private String serviceHost;

  @Parameter(
      names = {"--service-port"},
      description = "Port where the service that supports WebDriver commands is running")
  @ConfigValue(section = RELAY_SECTION, name = "port", example = "4723")
  private Integer servicePort;

  @Parameter(
      names = {"--service-status-endpoint"},
      description =
          "Endpoint to query the WebDriver service status, an HTTP 200 response " + "is expected")
  @ConfigValue(section = RELAY_SECTION, name = "status-endpoint", example = "\"/status\"")
  private String serviceStatusEndpoint;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(NODE_ROLE);
  }
}
