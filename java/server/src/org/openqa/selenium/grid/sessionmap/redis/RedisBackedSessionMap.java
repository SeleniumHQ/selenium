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

import com.google.common.collect.ImmutableMap;
import io.lettuce.core.KeyValue;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.redis.GridRedisClient;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

public class RedisBackedSessionMap extends SessionMap {

  private static final Json JSON = new Json();
  private final GridRedisClient connection;

  public RedisBackedSessionMap(Tracer tracer, URI serverUri) {
    super(tracer);

    connection = new GridRedisClient(serverUri);
  }

  public static SessionMap create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    URI sessionMapUri = new SessionMapOptions(config).getSessionMapUri();

    return new RedisBackedSessionMap(tracer, sessionMapUri);
  }

  @Override
  public boolean add(Session session) {
    Require.nonNull("Session to add", session);

    connection.mset(
      ImmutableMap.of(
        uriKey(session.getId()), session.getUri().toString(),
        capabilitiesKey(session.getId()), JSON.toJson(session.getCapabilities())));

    return true;
  }

  @Override
  public Session get(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    URI uri = getUri(id);

    String rawCapabilities = connection.get(capabilitiesKey(id));
    Capabilities caps = rawCapabilities == null ?
      new ImmutableCapabilities() :
      JSON.toType(rawCapabilities, Capabilities.class);

    return new Session(id, uri, caps);
  }

  @Override
  public URI getUri(SessionId id) throws NoSuchSessionException {
    Require.nonNull("Session ID", id);

    List<KeyValue<String, String>> rawValues = connection.mget(uriKey(id), capabilitiesKey(id));

    String rawUri = rawValues.get(0).getValueOrElse(null);
    if (rawUri == null) {
      throw new NoSuchSessionException("Unable to find URI for session " + id);
    }

    try {
      return new URI(rawUri);
    } catch (URISyntaxException e) {
      throw new NoSuchSessionException(String.format("Unable to convert session id (%s) to uri: %s", id, rawUri), e);
    }
  }

  @Override
  public void remove(SessionId id) {
    Require.nonNull("Session ID", id);

    connection.del(uriKey(id), capabilitiesKey(id));
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

}
