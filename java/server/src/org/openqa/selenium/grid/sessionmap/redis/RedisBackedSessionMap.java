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
  private static final String REDIS_URI_KEY="session.uri_key";
  private static final String REDIS_URI_VALUE="session.uri_value";
  private static final String REDIS_CAPABILITIES_KEY="session.capabilities_key";
  private static final String REDIS_CAPABILITIES_VALUE="session.capabilities_value";
  private final GridRedisClient connection;
  private final EventBus bus;

  public RedisBackedSessionMap(Tracer tracer, URI serverUri, EventBus bus) {
    super(tracer);

    Require.nonNull("Redis Server Uri", serverUri);
    this.bus = Require.nonNull("Event bus", bus);
    this.connection = new GridRedisClient(serverUri);
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
      setCommonSpanAttributes(span);

      String uriKey = uriKey(session.getId());
      String uriValue = session.getUri().toString();
      String capabilitiesKey = capabilitiesKey(session.getId());
      String capabilitiesJSON = JSON.toJson(session.getCapabilities());

      span.setAttribute(REDIS_URI_KEY, uriKey);
      span.setAttribute(REDIS_URI_VALUE, uriValue);
      span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);
      span.setAttribute(REDIS_CAPABILITIES_VALUE, capabilitiesJSON);

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
      setCommonSpanAttributes(span);

      URI uri = getUri(id);

      String capabilitiesKey=capabilitiesKey(id);
      String rawCapabilities = connection.get(capabilitiesKey);

      if(rawCapabilities!=null) {
        span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);
        span.setAttribute(REDIS_CAPABILITIES_VALUE, rawCapabilities);
      }
      else
      {
        span.addEvent("Capabilities do not exist. Received null value from Redis.");
      }

      Capabilities caps = rawCapabilities == null ?
                          new ImmutableCapabilities() :
                          JSON.toType(rawCapabilities, Capabilities.class);

      return new Session(id, uri, caps);
    }
  }

  @Override
  public URI getUri(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    try (Span span = tracer.getCurrentContext().createSpan("GET sessionURI")) {
      setCommonSpanAttributes(span);

      String uriKey = uriKey(id);
      List<KeyValue<String, String>> rawValues = connection.mget(uriKey);

      String rawUri = rawValues.get(0).getValueOrElse(null);

      if (rawUri == null) {
        span.setAttribute("error", true);
        span.setStatus(Status.NOT_FOUND);
        Map<String, EventAttributeValue> attributeValueMap = new HashMap<>();
        attributeValueMap.put("Session Id", EventAttribute.setValue(id.toString()));
        span.addEvent("Session id does not exist in Redis.");

        throw new NoSuchSessionException("Unable to find URI for session " + id);
      }

      span.setAttribute(REDIS_URI_KEY, uriKey);
      span.setAttribute(REDIS_URI_VALUE, rawUri);

      try {
        return new URI(rawUri);
      } catch (URISyntaxException e) {
        span.setAttribute("error", true);
        span.setStatus(Status.INTERNAL);
        Map<String, EventAttributeValue> attributeValueMap = new HashMap<>();
        attributeValueMap.put("Error Message", EventAttribute.setValue(e.getMessage()));
        span.addEvent("Unable to convert session id to uri.", attributeValueMap);

        throw new NoSuchSessionException(String.format("Unable to convert session id (%s) to uri: %s", id, rawUri), e);
      }
    }
  }

  @Override
  public void remove(SessionId id) {
    Require.nonNull("Session ID", id);

    try (Span span = tracer.getCurrentContext().createSpan("DEL sessionUriKey capabilitiesKey")) {
      setCommonSpanAttributes(span);

      String uriKey = uriKey(id);
      String capabilitiesKey = capabilitiesKey(id);
      span.setAttribute(REDIS_URI_KEY, uriKey);
      span.setAttribute(REDIS_CAPABILITIES_KEY, capabilitiesKey);

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
    span.setAttribute("db.system", "redis");
  }

}
