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
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.Closeable;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES_EVENT;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

public class JdbcBackedSessionMap extends SessionMap implements Closeable {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger(JdbcBackedSessionMap.class.getName());
  private static final String TABLE_NAME = "sessions_map";
  private static final String SESSION_ID_COL = "session_ids";
  private static final String SESSION_CAPS_COL = "session_caps";
  private static final String SESSION_STEREOTYPE_COL = "session_stereotype";
  private static final String SESSION_URI_COL = "session_uri";
  private static final String SESSION_START_COL = "session_start";
  private static final String DATABASE_STATEMENT = AttributeKey.DATABASE_STATEMENT.getKey();
  private static final String DATABASE_OPERATION = AttributeKey.DATABASE_OPERATION.getKey();
  private static final String DATABASE_USER = AttributeKey.DATABASE_USER.getKey();
  private static final String DATABASE_CONNECTION_STRING = AttributeKey.DATABASE_CONNECTION_STRING.getKey();
  private static String jdbcUser;
  private static String jdbcUrl;
  private final EventBus bus;
  private final Connection connection;

  public JdbcBackedSessionMap(Tracer tracer, Connection jdbcConnection, EventBus bus)  {
    super(tracer);

    Require.nonNull("JDBC Connection Object", jdbcConnection);
    this.bus = Require.nonNull("Event bus", bus);

    this.connection = jdbcConnection;
    this.bus.addListener(SessionClosedEvent.listener(this::remove));

    this.bus.addListener(NodeRemovedEvent.listener(nodeStatus -> nodeStatus.getSlots().stream()
      .filter(slot -> slot.getSession() != null)
      .map(slot -> slot.getSession().getId())
      .forEach(this::remove)));

    bus.addListener(NodeRestartedEvent.listener(nodeStatus -> this.removeByUri(nodeStatus.getExternalUri())));
  }

  public static SessionMap create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();

    JdbcSessionMapOptions sessionMapOptions = new JdbcSessionMapOptions(config);

    Connection connection;

    try {
      jdbcUser = sessionMapOptions.getJdbcUser();
      jdbcUrl = sessionMapOptions.getJdbcUrl();
      connection = sessionMapOptions.getJdbcConnection();
    } catch (SQLException e) {
      throw new ConfigException(e);
    }

    return new JdbcBackedSessionMap(tracer, connection, bus);
  }

  @Override
  public boolean isReady() {
    try {
      return !connection.isClosed();
    } catch (SQLException throwables) {
      return false;
    }
  }

  @Override
  public boolean add(Session session) {
    Require.nonNull("Session to add", session);

    try (Span span = tracer.getCurrentContext().createSpan(
        "INSERT into  sessions_map (session_ids, session_uri, session_caps, session_start) values (?, ?, ?, ?) ")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      SESSION_ID.accept(span, session.getId());
      SESSION_ID_EVENT.accept(attributeMap, session.getId());
      CAPABILITIES.accept(span, session.getCapabilities());
      CAPABILITIES_EVENT.accept(attributeMap, session.getCapabilities());
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);
      attributeMap.put(AttributeKey.SESSION_URI.getKey(),
                       EventAttribute.setValue(session.getUri().toString()));

      try (PreparedStatement statement = connection.prepareStatement(
          String.format("insert into %1$s (%2$s, %3$s, %4$s, %5$s, %6$s) values (?, ?, ?, ?, ?)",
                        TABLE_NAME,
                        SESSION_ID_COL,
                        SESSION_URI_COL,
                        SESSION_STEREOTYPE_COL,
                        SESSION_CAPS_COL,
                        SESSION_START_COL))) {

        statement.setString(1, session.getId().toString());
        statement.setString(2, session.getUri().toString());
        statement.setString(3, JSON.toJson(session.getStereotype()));
        statement.setString(4, JSON.toJson(session.getCapabilities()));
        statement.setString(5, JSON.toJson(session.getStartTime()));

        String statementStr = statement.toString();
        span.setAttribute(DATABASE_STATEMENT, statementStr);
        span.setAttribute(DATABASE_OPERATION, "insert");
        attributeMap.put(DATABASE_STATEMENT, EventAttribute.setValue(statementStr));
        attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("insert"));

        int rowCount = statement.executeUpdate();
        attributeMap.put("rows.added", EventAttribute.setValue(rowCount));
        span.addEvent("Inserted into the database", attributeMap);
        return rowCount >= 1;
      } catch (SQLException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue("Unable to add session information to the database: " + e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        throw new JdbcException(e);
      }
    }
  }

  @Override
  public Session get(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    URI uri = null;
    Capabilities stereotype = null;
    Capabilities caps = null;
    Instant start = null;
    String rawUri = null;
    Map<String, EventAttributeValue> attributeMap = new HashMap<>();

    try (Span span = tracer.getCurrentContext().createSpan(
        "SELECT * from  sessions_map where session_ids = ?")) {
      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      try (PreparedStatement statement = connection.prepareStatement(
          String.format("select * from %1$s where %2$s = ?",
                        TABLE_NAME,
                        SESSION_ID_COL))) {

        statement.setMaxRows(1);
        statement.setString(1, id.toString());

        String statementStr = statement.toString();
        span.setAttribute(DATABASE_STATEMENT, statementStr);
        span.setAttribute(DATABASE_OPERATION, "select");
        attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("select"));
        attributeMap.put(DATABASE_STATEMENT, EventAttribute.setValue(statementStr));

        try (ResultSet sessions = statement.executeQuery()) {
          if (!sessions.next()) {
            NoSuchSessionException
                exception =
                new NoSuchSessionException("Unable to find session.");
            span.setAttribute("error", true);
            span.setStatus(Status.NOT_FOUND);
            EXCEPTION.accept(attributeMap, exception);
            attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                             EventAttribute.setValue(
                                 "Session id does not exist in the database :" + exception
                                     .getMessage()));
            span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

            throw exception;
          }

          rawUri = sessions.getString(SESSION_URI_COL);

          String rawStereotype = sessions.getString(SESSION_STEREOTYPE_COL);

          stereotype = rawStereotype == null ?
            new ImmutableCapabilities() :
            JSON.toType(rawStereotype, Capabilities.class);

          String rawCapabilities = sessions.getString(SESSION_CAPS_COL);

          caps = rawCapabilities == null ?
                 new ImmutableCapabilities() :
                 JSON.toType(rawCapabilities, Capabilities.class);

          String rawStart = sessions.getString(SESSION_START_COL);
          start = JSON.toType(rawStart, Instant.class);
        }
        CAPABILITIES_EVENT.accept(attributeMap, caps);

        try {
          attributeMap.put(AttributeKey.SESSION_URI.getKey(), EventAttribute.setValue(rawUri));
          uri = new URI(rawUri);
        } catch (URISyntaxException e) {
          span.setAttribute("error", true);
          span.setStatus(Status.INTERNAL);
          EXCEPTION.accept(attributeMap, e);
          attributeMap.put(AttributeKey.SESSION_URI.getKey(), EventAttribute.setValue(rawUri));
          attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                           EventAttribute.setValue("Unable to convert session id to uri: " + e.getMessage()));
          span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

          throw new NoSuchSessionException(
              String.format("Unable to convert session id (%s) to uri: %s", id, rawUri), e);
        }

        span.addEvent("Retrieved session from the database", attributeMap);
        return new Session(id, uri, stereotype, caps, start);
      } catch (SQLException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue("Unable to get session information from the database: " + e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        throw new JdbcException(e);
      }
    }
  }

  @Override
  public void remove(SessionId id) {
    Require.nonNull("Session ID", id);
    try (Span span = tracer.getCurrentContext().createSpan(
        "DELETE from  sessions_map where session_ids = ?")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      try (PreparedStatement statement = connection.prepareStatement(
          String.format("delete from %1$s where %2$s = ?",
                        TABLE_NAME,
                        SESSION_ID_COL))) {

        statement.setString(1, id.toString());
        String statementStr = statement.toString();
        span.setAttribute(DATABASE_STATEMENT, statementStr);
        span.setAttribute(DATABASE_OPERATION, "delete");
        attributeMap.put(DATABASE_STATEMENT, EventAttribute.setValue(statementStr));
        attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("delete"));

        int rowCount = statement.executeUpdate();
        attributeMap.put("rows.deleted", EventAttribute.setValue(rowCount));
        span.addEvent("Deleted session from the database", attributeMap);

      } catch (SQLException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue("Unable to delete session information from the database: " + e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        throw new JdbcException(e.getMessage());
      }
    }
  }

  public void removeByUri(URI sessionUri) {
    Require.nonNull("Session URI", sessionUri);
    try (Span span = tracer.getCurrentContext().createSpan(
      "DELETE from  sessions_map where session_uri = ?")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();

      try (PreparedStatement statement = connection.prepareStatement(
        String.format("delete from %1$s where %2$s = ?",
                      TABLE_NAME,
                      SESSION_URI_COL))) {

        statement.setString(1, sessionUri.toString());
        String statementStr = statement.toString();
        span.setAttribute(DATABASE_STATEMENT, statementStr);
        span.setAttribute(DATABASE_OPERATION, "delete");
        attributeMap.put(DATABASE_STATEMENT, EventAttribute.setValue(statementStr));
        attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("delete"));

        int rowCount = statement.executeUpdate();
        attributeMap.put("rows.deleted", EventAttribute.setValue(rowCount));
        span.addEvent("Deleted session from the database", attributeMap);

      } catch (SQLException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.CANCELLED);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.getKey(),
                         EventAttribute.setValue(
                           "Unable to delete session information from the database: " + e
                             .getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);
        throw new JdbcException(e.getMessage());
      }
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

  private void setCommonSpanAttributes(Span span) {
    span.setAttribute("span.kind", Span.Kind.CLIENT.toString());
    if (jdbcUser != null) {
      span.setAttribute(DATABASE_USER, jdbcUser);
    }
    if (jdbcUrl != null) {
      span.setAttribute(DATABASE_CONNECTION_STRING, jdbcUrl);
    }
  }

  private void setCommonEventAttributes(Map<String, EventAttributeValue> attributeMap) {
    if (jdbcUser != null) {
      attributeMap.put(DATABASE_USER, EventAttribute.setValue(jdbcUser));
    }
    if (jdbcUrl != null) {
      attributeMap.put(DATABASE_CONNECTION_STRING, EventAttribute.setValue(jdbcUrl));
    }
  }
}
