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

import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES_EVENT;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID_EVENT;
import static org.openqa.selenium.remote.tracing.Tags.EXCEPTION;

import com.google.common.collect.ImmutableMap;
import io.lettuce.core.KeyValue;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
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

public class RedisBackedSessionMap extends SessionMap {

  private static final Logger LOG = Logger.getLogger(RedisBackedSessionMap.class.getName());
  private static final Json JSON = new Json();
  private static final String REDIS_URI_KEY = "session.uri_key";
  private static final String REDIS_URI_VALUE = "session.uri_value";
  private static final String REDIS_CAPABILITIES_KEY = "session.capabilities_key";
  private static final String REDIS_CAPABILITIES_VALUE = "session.capabilities_value";
  private static final String REDIS_START_KEY = "session.start";
  private static final String REDIS_START_VALUE = "session.start_value";
  private static final String DATABASE_SYSTEM = AttributeKey.DATABASE_SYSTEM.getKey();
  private static final String DATABASE_OPERATION = AttributeKey.DATABASE_OPERATION.getKey();
  private final GridRedisClient connection;
  private final EventBus bus;
  private final URI serverUri;

  public RedisBackedSessionMap(Tracer tracer, URI serverUri, EventBus bus) {
    super(tracer);

    Require.nonNull("Redis Server Uri", serverUri);
    this.bus = Require.nonNull("Event bus", bus);
    this.connection = new GridRedisClient(serverUri);
    this.serverUri = serverUri;
    this.bus.addListener(SessionClosedEvent.listener(this::remove));

    this.bus.addListener(
        NodeRemovedEvent.listener(
            nodeStatus ->
                nodeStatus.getSlots().stream()
                    .filter(slot -> slot.getSession() != null)
                    .map(slot -> slot.getSession().getId())
                    .forEach(this::remove)));

    bus.addListener(
        NodeRestartedEvent.listener(nodeStatus -> this.removeByUri(nodeStatus.getExternalUri())));
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

    try (Span span =
        tracer
            .getCurrentContext()
            .createSpan("MSET sessionUriKey <sessionUri> capabilitiesKey <capabilities> ")) {
      Map<String, EventAttributeValue> attributeMap = new HashMap<>();
      SESSION_ID.accept(span, session.getId());
      SESSION_ID_EVENT.accept(attributeMap, session.getId());
      CAPABILITIES.accept(span, session.getCapabilities());
      CAPABILITIES_EVENT.accept(attributeMap, session.getCapabilities());
      setCommonSpanAttributes(span);
      setCommonEventAttributes(attributeMap);

      String uriKey = uriKey(session.getId());
      String uriValue = session.getUri().toString();
      String stereotypeKey = stereotypeKey(session.getId());
      String stereotypeJson = JSON.toJson(session.getStereotype());
      String capabilitiesKey = capabilitiesKey(session.getId());
      String capabilitiesJson = JSON.toJson(session.getCapabilities());
      String startKey = startKey(session.getId());
      String startValue = JSON.toJson(session.getStartTime());

      span.setAttribute(REDIS_URI_KEY, uriKey);
      span.setAttribute(REDIS_URI_VALUE, uriValue);
      span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);
      span.setAttribute(REDIS_CAPABILITIES_VALUE, capabilitiesJson);
      span.setAttribute(DATABASE_OPERATION, "MSET");
      attributeMap.put(REDIS_URI_KEY, EventAttribute.setValue(uriKey));
      attributeMap.put(REDIS_URI_VALUE, EventAttribute.setValue(uriValue));
      attributeMap.put(REDIS_CAPABILITIES_KEY, EventAttribute.setValue(capabilitiesKey));
      attributeMap.put(REDIS_CAPABILITIES_VALUE, EventAttribute.setValue(capabilitiesJson));
      attributeMap.put(REDIS_START_KEY, EventAttribute.setValue(startKey));
      attributeMap.put(REDIS_START_VALUE, EventAttribute.setValue(startValue));
      attributeMap.put(DATABASE_OPERATION, EventAttribute.setValue("MSET"));

      span.addEvent("Inserted into the database", attributeMap);
      connection.mset(
          ImmutableMap.of(
              uriKey, uriValue,
              stereotypeKey, stereotypeJson,
              capabilitiesKey, capabilitiesJson,
              startKey, startValue));

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
      attributeMap.put(AttributeKey.SESSION_URI.getKey(), EventAttribute.setValue(uri.toString()));

      String capabilitiesKey = capabilitiesKey(id);
      String rawCapabilities = connection.get(capabilitiesKey);

      String stereotypeKey = stereotypeKey(id);
      String rawStereotype = connection.get(stereotypeKey);

      span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);
      attributeMap.put(REDIS_CAPABILITIES_KEY, EventAttribute.setValue(capabilitiesKey));

      if (rawCapabilities != null) {
        span.setAttribute(REDIS_CAPABILITIES_VALUE, rawCapabilities);
      }

      Capabilities caps =
          rawCapabilities == null
              ? new ImmutableCapabilities()
              : JSON.toType(rawCapabilities, Capabilities.class);

      Capabilities stereotype =
          rawStereotype == null
              ? new ImmutableCapabilities()
              : JSON.toType(rawStereotype, Capabilities.class);

      String rawStart = connection.get(startKey(id));
      Instant start = JSON.toType(rawStart, Instant.class);

      CAPABILITIES.accept(span, caps);
      CAPABILITIES_EVENT.accept(attributeMap, caps);

      span.addEvent("Retrieved session from the database", attributeMap);
      return new Session(id, uri, stereotype, caps, start);
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
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            EventAttribute.setValue(
                "Session URI does not exist in the database :" + exception.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

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
        attributeMap.put(AttributeKey.SESSION_URI.getKey(), EventAttribute.setValue(rawUri));
        attributeMap.put(
            AttributeKey.EXCEPTION_MESSAGE.getKey(),
            EventAttribute.setValue("Unable to convert session id to uri: " + e.getMessage()));
        span.addEvent(AttributeKey.EXCEPTION_EVENT.getKey(), attributeMap);

        throw new NoSuchSessionException(
            String.format("Unable to convert session id (%s) to uri: %s", id, rawUri), e);
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
      String stereotypeKey = stereotypeKey(id);
      String startKey = startKey(id);
      span.setAttribute(REDIS_URI_KEY, uriKey);
      span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);
      span.setAttribute(REDIS_START_KEY, startKey);
      attributeMap.put(REDIS_URI_KEY, EventAttribute.setValue(uriKey));
      attributeMap.put(REDIS_CAPABILITIES_KEY, EventAttribute.setValue(capabilitiesKey));
      attributeMap.put(REDIS_START_KEY, EventAttribute.setValue(startKey));

      span.addEvent("Deleted session from the database", attributeMap);

      connection.del(uriKey, capabilitiesKey, stereotypeKey, startKey);
    }
  }

  public void removeByUri(URI uri) {
    List<String> uriKeys = connection.getKeysByPattern("session:*:uri");

    if (uriKeys.isEmpty()) {
      return;
    }

    String[] keys = new String[uriKeys.size()];
    keys = uriKeys.toArray(keys);

    List<KeyValue<String, String>> keyValues = connection.mget(keys);
    keyValues.stream()
        .filter(entry -> entry.getValue().equals(uri.toString()))
        .map(KeyValue::getKey)
        .map(
            key -> {
              String[] sessionKey = key.split(":");
              return new SessionId(sessionKey[1]);
            })
        .forEach(this::remove);
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

  private String startKey(SessionId id) {
    Require.nonNull("Session ID", id);

    return "session:" + id.toString() + ":start";
  }

  private String stereotypeKey(SessionId id) {
    Require.nonNull("Session ID", id);

    return "session:" + id.toString() + ":stereotype";
  }

  private void setCommonSpanAttributes(Span span) {
    span.setAttribute("span.kind", Span.Kind.CLIENT.toString());
    span.setAttribute(DATABASE_SYSTEM, "redis");
  }

  private void setCommonEventAttributes(Map<String, EventAttributeValue> map) {
    map.put(DATABASE_SYSTEM, EventAttribute.setValue("redis"));
    if (serverUri != null) {
      map.put(
          AttributeKey.DATABASE_CONNECTION_STRING.getKey(),
          EventAttribute.setValue(serverUri.toString()));
    }
  }

  public GridRedisClient getRedisClient() {
    return connection;
  }
}
