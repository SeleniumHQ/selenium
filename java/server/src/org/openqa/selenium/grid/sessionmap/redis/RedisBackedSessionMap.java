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

package org.openqa.selenium.grid.sessionmap.redis;

import static org.openqa.selenium.grid.data.SessionClosedEvent.SESSION_CLOSED;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES_EVENT;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

import com.google.common.collect.ImmutableMap;
import io.lettuce.core.KeyValue;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.AttributeKey;
import org.openqa.selenium.remote.tracing.EventAttribute;
import org.openqa.selenium.remote.tracing.EventAttributeValue;
import org.openqa.selenium.remote.tracing.Span;
import org.openqa.selenium.remote.tracing.Status;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

public class RedisBackedSessionMap extends SessionMap {

  private static final Logger LOG = Logger.getLogger(RedisBackedSessionMap.class.getName());
  private static final Json JSON = new Json();
  private static final String REDIS_URI_KEY = "session.uri_key";
  private static final String REDIS_URI_VALUE = "session.uri_value";
  private static final String REDIS_CAPABILITIES_KEY = "session.capabilities_key";
  private static final String REDIS_CAPABILITIES_VALUE = "session.capabilities_value";
  private static final String DATABASE_SYSTEM = AttributeKey.DATABASE_SYSTEM.toString();
  private static final String DATABASE_OPERATION = AttributeKey.DATABASE_OPERATION.toString();
  private final GridRedisClient connection;
  private final EventBus bus;
  private final URI serverUri;

  public RedisBackedSessionMap(Tracer tracer, URI serverUri, EventBus bus) {
    super(tracer);

    Require.nonNull("Redis Server Uri", serverUri);
    this.bus = Require.nonNull("Event bus", bus);
    this.connection = new GridRedisClient(serverUri);
    this.serverUri = serverUri;
    this.bus.addListener(SESSION_CLOSED, event -> {
      SessionId id = event.getData(SessionId.class);
      remove(id);
    });
  }

  public static SessionMap create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    EventBus bus = new EventBusOptions(config).getEventBus();
    URI sessionMapUri = new SessionMapOptions(config).getSessionMapUri();

    return new RedisBackedSessionMap(tracer, sessionMapUri, bus);
  }

  @Override
  public boolean add(Session session) {
    Require.nonNull("Session to add", session);

    try (Span span = tracer.getCurrentContext().createSpan("MSET sessionUriKey <sessionUri> capabilitiesKey <capabilities> ")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      SESSION_ID.accept(span, session.getId());
      SESSION_ID_EVENT.accept(attributeMap, session.getId());
      CAPABILITIES.accept(span, session.getCapabilities());
      CAPABILITIES_EVENT.accept(attributeMap, session.getCapabilities());
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      String uriKey = uriKey(session.getId());
      String uriValue = session.getUri().toString();
      String capabilitiesKey = capabilitiesKey(session.getId());
      String capabilitiesJSON = JSON.toJson(session.getCapabilities());

      span.setAttribute(REDIS_URI_KEY, uriKey);
      span.setAttribute(REDIS_URI_VALUE, uriValue);
      span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);
      span.setAttribute(REDIS_CAPABILITIES_VALUE, capabilitiesJSON);
      span.setAttribute(DATABASE_OPERATION, "MSET");
      attributeMap.put(REDIS_URI_KEY, EventAttribute.setValue(uriKey));
      attributeMap.put(REDIS_URI_VALUE, EventAttribute.setValue(uriValue));
      attributeMap.put(REDIS_CAPABILITIES_KEY, EventAttribute.setValue(capabilitiesKey));
      attributeMap.put(REDIS_CAPABILITIES_VALUE, EventAttribute.setValue(capabilitiesJSON));
      attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("MSET"));

      span.addEvent("Inserted into the database", attributeMap);
      connection.mset(
          ImmutableMap.of(
              uriKey, uriValue,
              capabilitiesKey, capabilitiesJSON));

      return true;
    }
  }

  @Override
  public Session get(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    try (Span span = tracer.getCurrentContext().createSpan("GET capabilitiesKey")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);
      span.setAttribute(DATABASE_OPERATION, "GET");
      attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("GET"));

      URI uri = getUri(id);

      attributeMap.put(REDIS_URI_KEY, EventAttribute.setValue(uriKey(id)));
      attributeMap
          .put(AttributeKey.SESSION_URI.toString(), EventAttribute.setValue(uri.toString()));

      String capabilitiesKey=capabilitiesKey(id);
      String rawCapabilities = connection.get(capabilitiesKey);

      span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);
      attributeMap.put(REDIS_CAPABILITIES_KEY, EventAttribute.setValue(capabilitiesKey));

      if(rawCapabilities!=null) {
        span.setAttribute(REDIS_CAPABILITIES_VALUE, rawCapabilities);
      }

      Capabilities caps = rawCapabilities == null ?
                          new ImmutableCapabilities() :
                          JSON.toType(rawCapabilities, Capabilities.class);

      CAPABILITIES.accept(span, caps);
      CAPABILITIES_EVENT.accept(attributeMap, caps);

      span.addEvent("Retrieved session from the database", attributeMap);
      return new Session(id, uri, caps);
    }
  }

  @Override
  public URI getUri(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    try (Span span = tracer.getCurrentContext().createSpan("GET sessionURI")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);
      span.setAttribute(DATABASE_OPERATION, "GET");
      attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("GET"));

      String uriKey = uriKey(id);
      List<KeyValue<String, String>> rawValues = connection.mget(uriKey);

      String rawUri = rawValues.get(0).getValueOrElse(null);

      span.setAttribute(REDIS_URI_KEY, uriKey);
      attributeMap.put(REDIS_URI_KEY, EventAttribute.setValue(uriKey));

      if (rawUri == null) {
        NoSuchSessionException exception = new NoSuchSessionException("Unable to find session.");
        span.setAttribute("error", true);
        span.setStatus(Status.NOT_FOUND);
        EXCEPTION.accept(attributeMap, exception);
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.toString(),
                         EventAttribute.setValue("Session URI does not exist in the database :" + exception.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.toString(), attributeMap);

        throw exception;
      }

      span.setAttribute(REDIS_URI_VALUE, rawUri);
      attributeMap.put(REDIS_URI_KEY, EventAttribute.setValue(uriKey));
      attributeMap.put(REDIS_URI_VALUE, EventAttribute.setValue(rawUri));

      try {
        return new URI(rawUri);
      } catch (URISyntaxException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.INTERNAL);
        EXCEPTION.accept(attributeMap, e);
        attributeMap.put(AttributeKey.SESSION_URI.toString(), EventAttribute.setValue(rawUri));
        attributeMap.put(AttributeKey.EXCEPTION_MESSAGE.toString(),
                         EventAttribute.setValue("Unable to convert session id to uri: " + e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.toString(), attributeMap);

        throw new NoSuchSessionException(String.format("Unable to convert session id (%s) to uri: %s", id, rawUri), e);
      }
    }
  }

  @Override
  public void remove(SessionId id) {
    Require.nonNull("Session ID", id);

    try (Span span = tracer.getCurrentContext().createSpan("DEL sessionUriKey capabilitiesKey")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      SESSION_ID.accept(span, id);
      SESSION_ID_EVENT.accept(attributeMap, id);
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);
      span.setAttribute(DATABASE_OPERATION, "DEL");
      attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("DEL"));

      String uriKey = uriKey(id);
      String capabilitiesKey = capabilitiesKey(id);
      span.setAttribute(REDIS_URI_KEY, uriKey);
      span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);
      attributeMap.put(REDIS_URI_KEY, EventAttribute.setValue(uriKey));
      attributeMap.put(REDIS_CAPABILITIES_KEY, EventAttribute.setValue(capabilitiesKey));

      span.addEvent("Deleted session from the database", attributeMap);
      connection.del(uriKey, capabilitiesKey);
    }
  }

  @Override
  public boolean isReady() {
    return connection.isOpen();
  }

  private String uriKey(SessionId id) {
    Require.nonNull("Session ID", id);

    return "session:" + id.toString() + ":uri";
  }

  private String capabilitiesKey(SessionId id) {
    Require.nonNull("Session ID", id);

    return "session:" + id.toString() + ":capabilities";
  }

  private void setCommonSpanAttributes(Span span) {
    span.setAttribute("span.kind", Span.Kind.CLIENT.toString());
    span.setAttribute(DATABASE_SYSTEM, "redis");
  }

  private void setCommonEventAttributes(Map<String, EventAttributeValue> map) {
    map.put(DATABASE_SYSTEM, EventAttribute.setValue("redis"));
    if (serverUri != null) {
      map.put(AttributeKey.DATABASE_CONNECTION_STRING.toString(),
              EventAttribute.setValue(serverUri.toString()));
    }
  }
}
