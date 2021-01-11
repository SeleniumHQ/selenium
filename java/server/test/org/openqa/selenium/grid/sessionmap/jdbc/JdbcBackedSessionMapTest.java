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

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

public class JdbcBackedSessionMapTest {
  private static Connection connection;
  private static EventBus bus;
  private static final Tracer tracer = DefaultTestTracer.createTracer();

  @BeforeClass
  public static void createDB() throws SQLException {
    bus = new GuavaEventBus();
    connection = DriverManager.getConnection("jdbc:hsqldb:mem:testdb", "SA", "");
    Statement createStatement = connection.createStatement();
    createStatement.executeUpdate(
      "create table sessions_map (session_ids varchar(50), session_uri varchar(30), session_stereotype varchar(300), session_caps varchar(300), session_start varchar(128));");
  }

  @AfterClass
  public static void killDBConnection() throws SQLException {
    connection.close();
  }

  @Test(expected = NoSuchSessionException.class)
  public void shouldThrowNoSuchSessionExceptionIfSessionDoesNotExists() {
    SessionMap sessions = getSessionMap();

    sessions.get(new SessionId(UUID.randomUUID()));
  }

  @Test(expected = IllegalArgumentException.class)
  public void shouldThrowIllegalArgumentExceptionIfConnectionObjectIsNull() {
    SessionMap sessions = new JdbcBackedSessionMap(tracer, null, bus);
  }

  @Test(expected = JdbcException.class)
  public void shouldThrowNoSuchSessionExceptionIfTableDoesNotExist() throws SQLException {
    Connection connection2 = DriverManager.getConnection("jdbc:hsqldb:mem:testdb2", "SA", "");

    SessionMap sessions = new JdbcBackedSessionMap(tracer, connection2, bus);

    sessions.get(new SessionId(UUID.randomUUID()));
  }
  @Test
  public void canCreateAJdbcBackedSessionMap() throws URISyntaxException {
    SessionMap sessions = getSessionMap();

    Session expected = new Session(
      new SessionId(UUID.randomUUID()),
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
  public void shouldBeAbleToRemoveSessions() throws URISyntaxException {
    SessionMap sessions = getSessionMap();

    Session expected = new Session(
      new SessionId(UUID.randomUUID()),
      new URI("http://example.com/foo"),
      new ImmutableCapabilities("foo", "bar"),
      new ImmutableCapabilities("key", "value"),
      Instant.now());
    sessions.add(expected);

    SessionMap reader = getSessionMap();

    reader.remove(expected.getId());

    try {
      reader.get(expected.getId());
      fail("Oh noes!");
    } catch (NoSuchSessionException ignored) {
      // This is expected
    }
  }

  private JdbcBackedSessionMap getSessionMap() {
    return new JdbcBackedSessionMap(tracer, connection, bus);
  }

}
