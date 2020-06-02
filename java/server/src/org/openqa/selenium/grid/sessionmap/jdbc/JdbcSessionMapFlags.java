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

import com.google.auto.service.AutoService;
import com.beust.jcommander.Parameter;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.util.Collections;
import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_MAP_ROLE;


@AutoService(HasRoles.class)
public class JdbcSessionMapFlags implements HasRoles {

  @Parameter(
      names = "--jdbc-url",
      description = "Database URL for making a connection.")
  @ConfigValue(section = "sessions", name = "jdbc-url", example = "\"jdbc:mysql://localhost:3306/TestDatabase\"")
  private String jdbcUrl;

  @Parameter(
      names = "--jdbc-user",
      description = "Username for the user to make a JDBC connection")
  @ConfigValue(section = "sessions", name = "jdbc-user", example = "mytestUser")
  private String username;

  @Parameter(
      names = "--jdbc-password",
      description = "Password for the user to make a JDBC connection")
  @ConfigValue(section = "sessions", name = "jdbc-password", example = "myP@ssw%d")
  private String password;

  @Parameter(
      names = "--jdbc-table",
      description = "Name of the table in database to store sessions in.")
  @ConfigValue(section = "sessions", name = "jdbc-table", example = "myP@ssw%d")
  private String table;

  @Parameter(
      names = "--jdbc-sessionid-column",
      description = "Column name where session id will be stored")
  @ConfigValue(section = "sessions", name = "jdbc-sessionid-column", example = "session_id")
  private String sessionIdColumn;

  @Parameter(
      names = "--jdbc-capabilities-column",
      description = "Column name where session id will be stored")
  @ConfigValue(section = "sessions", name = "jdbc-capabilities-column", example = "capabilities")
  private String sessionCapsColumn;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(SESSION_MAP_ROLE);
  }
}
