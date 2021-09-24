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

import com.google.auto.service.AutoService;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.util.Collections;
import java.util.Set;

@SuppressWarnings("unused")
@AutoService(HasRoles.class)
public class RelayFlags implements HasRoles {

  @Parameter(
    names = {"--service-url"},
    description = "URL for connecting to the service"
  )
  @ConfigValue(section = RELAY_SECTION, name = "url", example = "http://localhost:67853")
  private String serviceUrl;

  @Parameter(
    names = {"--service-host"},
    description = "Host name where the service is running"
  )
  @ConfigValue(section = RELAY_SECTION, name = "host", example = "\"localhost\"")
  private String serviceHost;

  @Parameter(
    names = {"--service-port"},
    description = "Port where the service is running"
  )
  @ConfigValue(section = RELAY_SECTION, name = "port", example = "67853")
  private Integer servicePort;

  @Parameter(
    names = {"--service-status-endpoint"},
    description = "Endpoint to query the service status, an HTTP 200 response is expected"
  )
  @ConfigValue(section = RELAY_SECTION, name = "status-endpoint", example = "\"/status\"")
  private String serviceStatusEndpoint;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(NODE_ROLE);
  }
}
