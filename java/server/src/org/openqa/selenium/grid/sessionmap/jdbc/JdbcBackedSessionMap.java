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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.Closeable;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.logging.Logger;


public class JdbcBackedSessionMap extends SessionMap implements Closeable {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger(JdbcBackedSessionMap.class.getName());
  private static final String separator = "@";
  private final String  tableName;
  private final Connection connection;
  private final String sessionIdCol;
  private final String sessionCapsCol;


  public JdbcBackedSessionMap(Tracer tracer, Connection jdbcConnection, String sessionTableName, String sessionIdCol, String sessionCapsCol)  {
    super(tracer);

    Require.nonNull("JDBC Connection Object", jdbcConnection);
    Require.nonNull("Table name", sessionTableName);
    Require.nonNull("Session id column name", sessionIdCol);
    Require.nonNull("Session caps column name", sessionCapsCol);

    this.connection = jdbcConnection;
    this.tableName = sessionTableName;
    this.sessionIdCol = sessionIdCol;
    this.sessionCapsCol = sessionCapsCol;
  }

  public static SessionMap create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    JdbcSessionMapOptions sessionMapOptions = new JdbcSessionMapOptions(config);
    String tableName = sessionMapOptions.getJdbcTableName();
    String sessionIdColName = sessionMapOptions.getJdbcSessionIdColName();
    String sessionCapsColName = sessionMapOptions.getJdbcSessionCapColName();
    Connection connection;

    try {
      connection = sessionMapOptions.getJdbcConnection();
    } catch (SQLException e) {
      throw new ConfigException(e.toString());
    }

    return new JdbcBackedSessionMap(tracer, connection, tableName, sessionIdColName, sessionCapsColName);
  }
  @Override
  public boolean add(Session session) {
    Require.nonNull("Session to add", session);

    try {
      Statement insertStatement = connection.createStatement();
      int rows = insertStatement.executeUpdate(getInsertSqlForSession(session));

      return rows >= 1;
    } catch (SQLException e) {
      throw new JdbcException(e.getMessage());
    }
  }

  @Override
  public Session get(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    URI uri = null;
    Capabilities caps = null;

    try {
      ResultSet sessions = connection.createStatement().executeQuery(getReadSqlForSession(id));

      while(sessions.next()) {
        String sessionIdAndURI = sessions.getString(sessionIdCol);
        String rawUri = sessionIdAndURI.split(separator)[1];
        String rawCapabilities = sessions.getString(sessionCapsCol);

        caps = rawCapabilities == null ?
                            new ImmutableCapabilities() :
                            JSON.toType(rawCapabilities, Capabilities.class);

        try {
          uri = new URI(rawUri);
        }
        catch (URISyntaxException e) {
          throw new NoSuchSessionException(String.format("Unable to convert session id (%s) to uri: %s", id, rawUri), e);
        }

        sessions.close();
      }

      if (uri == null) {
        throw new NoSuchSessionException("Unable to find URI for session " + id);
      }

      return new Session(id, uri, caps);
    } catch (SQLException e) {
      throw new JdbcException(e.getMessage());
    }
  }

  @Override
  public void remove(SessionId id) {
    Require.nonNull("Session ID", id);

    try {
      connection.createStatement().executeUpdate(getDeleteSqlForSession(id));
    } catch (SQLException e) {
      throw new JdbcException(e.getMessage());
    }
  }

  @Override
  public void close() {
    try {
      connection.close();
    } catch (SQLException e) {
      LOG.warning("SQL exception while closing JDBC Connection:" + e.getMessage());
    }
  }

  private String getInsertSqlForSession(Session session) {
    //"insert into sessions(session_id,session_caps) values('sessionURIStr/SessionURI','caps')"
    return "insert into " + tableName + "(" + sessionIdCol + ", " + sessionCapsCol + ") values (" + sessionUri(session.getId()) + separator + session.getUri().toString() + "\",\"" + JSON.toJson(session.getCapabilities()) + "\")";
  }

  private String getReadSqlForSession(SessionId sessionId) {
    return "select * from " + tableName + "where " + sessionIdCol + " like " + sessionUri(sessionId) + "%";
  }

  private String getDeleteSqlForSession(SessionId sessionId) {
    return "delete from " + tableName + "where " + sessionIdCol + " like " + sessionUri(sessionId) + "%";
  }

  private String sessionUri(SessionId sessionId) {
    Require.nonNull("Session ID", sessionId);

    return "session:" + sessionId.toString() + ":uri";
  }
}
