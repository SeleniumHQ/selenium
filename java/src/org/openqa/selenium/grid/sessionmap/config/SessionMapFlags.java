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

package org.openqa.selenium.grid.sessionmap.config;

import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_MAP_ROLE;

import com.google.auto.service.AutoService;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.net.URI;
import java.util.Collections;
import java.util.Set;

@AutoService(HasRoles.class)
public class SessionMapFlags implements HasRoles {

  @Parameter(names = {"-s", "--sessions"}, description = "Address of the session map server.")
  @ConfigValue(section = "sessions", name = "host", example = "\"http://localhost:1234\"")
  private URI sessionServer;

  @Parameter(
    names = "--sessions-port",
    description = "Port on which the session map server is listening.")
  @ConfigValue(section = "sessions", name = "port", example = "1234")
  private Integer sessionServerPort;

  @Parameter(
      names = "--sessions-host",
      description = "Host on which the session map server is listening.")
  @ConfigValue(section = "sessions", name = "hostname", example = "\"localhost\"")
  private String sessionServerHost;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(SESSION_MAP_ROLE);
  }
}
