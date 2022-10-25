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

import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.internal.Require;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.NoSuchElementException;

public class JdbcSessionMapOptions {

  private static final String SESSIONS_SECTION = "sessions";

  private final String jdbcUrl;
  private final String jdbcUser;
  private final String jdbcPassword;

  public JdbcSessionMapOptions(Config config) {
    Require.nonNull("Config", config);

    try {
      this.jdbcUrl = config.get(SESSIONS_SECTION, "jdbc-url").orElse("");
      this.jdbcUser = config.get(SESSIONS_SECTION, "jdbc-user").orElse("");
      this.jdbcPassword = config.get(SESSIONS_SECTION, "jdbc-password").orElse("");

      if (jdbcUrl.isEmpty()) {
        throw new JdbcException(
          "Missing JDBC Url value. Add sessions option value --jdbc-url <url-value>");
      }
    } catch (NoSuchElementException e) {
      throw new JdbcException(
        "Missing session options. Check and add all the following options \n "
        + "--jdbc-url <url> \n --jdbc-user <user> \n --jdbc-password <password>");
    }
  }

  public Connection getJdbcConnection() throws SQLException {
    return DriverManager.getConnection(jdbcUrl, jdbcUser, jdbcPassword);
  }

  public String getJdbcUrl() {
    return jdbcUrl;
  }

  public String getJdbcUser() {
    return jdbcUser;
  }
}
