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

import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.Closeable;
import java.net.URI;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;


public class JdbcBackedSessionMap extends SessionMap implements Closeable {

  private static final Json JSON = new Json();
  private String tableName;
  private final Connection connection;

  public JdbcBackedSessionMap(Tracer tracer, Connection jdbcConnection, String sessionTableName)  {
    super(tracer);

    this.connection = jdbcConnection;
    this.tableName = sessionTableName;
  }

  public static SessionMap create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    SessionMapOptions sessionMapOptions = new SessionMapOptions(config);
    String tableName = sessionMapOptions.getJdbcTableName();
    Connection connection = null;

    try {
      connection = sessionMapOptions.getJdbcConnection();
    } catch (SQLException e) {
      // TODO: Handle SQLException
    }

    return new JdbcBackedSessionMap(tracer, connection, tableName);
  }
  @Override
  public boolean add(Session session) {
    Require.nonNull("Session to add", session);

    try {
      Statement insertStatement = connection.createStatement();
      // TODO: Insert Call
    } catch (SQLException e) {
      // TODO: Handle SQLException
    }
    return true;
  }

  @Override
  public Session get(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    URI uri = getUri(id);

    // TODO: Get Session details

    return new Session(id, uri, null);
  }

  @Override
  public URI getUri(SessionId id) throws NoSuchSessionException {
    // TODO: getUri implementation.
    return null;
  }

  @Override
  public void remove(SessionId id) {
    Require.nonNull("Session ID", id);

    // TODO: Implement remove logic to database.
  }

  @Override
  public void close() {
    try {
      connection.close();
    } catch (SQLException e) {
      e.printStackTrace();
    }
  }
}
