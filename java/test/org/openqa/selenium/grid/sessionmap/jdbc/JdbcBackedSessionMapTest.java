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

import static java.util.UUID.randomUUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class JdbcBackedSessionMapTest {
  private static Connection connection;
  private static EventBus bus;
  private static final Tracer tracer = DefaultTestTracer.createTracer();

  @BeforeAll
  public static void createDB() throws SQLException {
    bus = new GuavaEventBus();
    connection = DriverManager.getConnection("jdbc:hsqldb:mem:testdb", "SA", "");
    Statement createStatement = connection.createStatement();
    createStatement.executeUpdate(
        "create table sessions_map (session_ids varchar(50), session_uri varchar(30),"
            + " session_stereotype varchar(300), session_caps varchar(300), session_start"
            + " varchar(128));");
  }

  @AfterAll
  public static void killDBConnection() throws SQLException {
    if (connection != null) {
      connection.close();
      connection = null;
    }
    if (bus != null) {
      bus.close();
      bus = null;
    }
  }

  @Test
  void shouldThrowNoSuchSessionExceptionIfSessionDoesNotExists() {
    SessionMap sessions = getSessionMap();
    UUID sessionId = randomUUID();
    assertThatThrownBy(() -> sessions.get(new SessionId(sessionId)))
        .isInstanceOf(NoSuchSessionException.class)
        .hasMessageStartingWith("Unable to find session with id: " + sessionId);
  }

  @Test
  void shouldThrowIllegalArgumentExceptionIfConnectionObjectIsNull() {
    assertThatThrownBy(() -> new JdbcBackedSessionMap(tracer, null, bus))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("JDBC Connection Object must be set");
  }

  @Test
  void shouldThrowNoSuchSessionExceptionIfTableDoesNotExist() throws SQLException {
    Connection connection2 = DriverManager.getConnection("jdbc:hsqldb:mem:testdb2", "SA", "");
    SessionMap sessions = new JdbcBackedSessionMap(tracer, connection2, bus);
    UUID sessionId = randomUUID();

    assertThatThrownBy(() -> sessions.get(new SessionId(sessionId)))
        .isInstanceOf(JdbcException.class)
        .hasMessageContaining("object not found: SESSIONS_MAP");
  }

  @Test
  void canCreateAJdbcBackedSessionMap() throws URISyntaxException {
    SessionMap sessions = getSessionMap();

    Session expected =
        new Session(
            new SessionId(randomUUID()),
            new URI("http://example.com/foo"),
            new ImmutableCapabilities("foo", "bar"),
            new ImmutableCapabilities("key", "value"),
            Instant.now());
    sessions.add(expected);

    SessionMap reader = getSessionMap();

    Session seen = reader.get(expected.getId());

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  void shouldBeAbleToRemoveSessions() throws URISyntaxException {
    SessionMap sessions = getSessionMap();

    Session expected =
        new Session(
            new SessionId(randomUUID()),
            new URI("http://example.com/foo"),
            new ImmutableCapabilities("foo", "bar"),
            new ImmutableCapabilities("key", "value"),
            Instant.now());
    sessions.add(expected);
    SessionId sessionId = expected.getId();

    SessionMap reader = getSessionMap();

    reader.remove(sessionId);

    assertThatThrownBy(() -> reader.get(sessionId))
        .isInstanceOf(NoSuchSessionException.class)
        .hasMessageStartingWith("Unable to find session with id: " + sessionId);
  }

  private JdbcBackedSessionMap getSessionMap() {
    return new JdbcBackedSessionMap(tracer, connection, bus);
  }
}
