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

package org.openqa.selenium.grid.sessionmap.jdbc;

import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_MAP_ROLE;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import java.util.Collections;
import java.util.Set;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

@AutoService(HasRoles.class)
public class JdbcSessionMapFlags implements HasRoles {

  @Parameter(names = "--jdbc-url", description = "Database URL for making a connection.")
  @ConfigValue(
      section = "sessions",
      name = "jdbc-url",
      example = "\"jdbc:mysql://localhost:3306/TestDatabase\"")
  private String jdbcUrl;

  @Parameter(names = "--jdbc-user", description = "Username for the user to make a JDBC connection")
  @ConfigValue(section = "sessions", name = "jdbc-user", example = "myTestUser")
  private String username;

  @Parameter(
      names = "--jdbc-password",
      description = "Password for the user to make a JDBC connection")
  @ConfigValue(section = "sessions", name = "jdbc-password", example = "hunter2")
  private String password;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(SESSION_MAP_ROLE);
  }
}
