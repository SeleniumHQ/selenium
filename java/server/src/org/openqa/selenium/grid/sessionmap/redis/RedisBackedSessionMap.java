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
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.config.SessionMapOptions;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.SessionId;

import java.io.Closeable;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;

public class RedisBackedSessionMap extends SessionMap implements Closeable {

  private static final Json JSON = new Json();
  private final RedisClient client;
  private final StatefulRedisConnection<String, String> connection;

  public RedisBackedSessionMap(Tracer tracer, URI serverUri) {
    super(tracer);

    client = RedisClient.create(RedisURI.create(serverUri));
    connection = client.connect();
  }

  public static SessionMap create(Config config) {
    Tracer tracer = new LoggingOptions(config).getTracer();
    URI sessionMapUri = new SessionMapOptions(config).getSessionMapUri();

    return new RedisBackedSessionMap(tracer, sessionMapUri);
  }

  @Override
  public boolean add(Session session) {
    Objects.requireNonNull(session, "Session to add must be set.");

    RedisCommands<String, String> commands = connection.sync();
    commands.mset(
      ImmutableMap.of(
        uriKey(session.getId()), session.getUri().toString(),
        capabilitiesKey(session.getId()), JSON.toJson(session.getCapabilities())));

    return true;
  }

  @Override
  public Session get(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID to use must be set.");

    URI uri = getUri(id);

    RedisCommands<String, String> commands = connection.sync();
    String rawCapabilities = commands.get(capabilitiesKey(id));
    Capabilities caps = rawCapabilities == null ?
      new ImmutableCapabilities() :
      JSON.toType(rawCapabilities, Capabilities.class);

    return new Session(id, uri, caps);
  }

  @Override
  public URI getUri(SessionId id) throws NoSuchSessionException {
    Objects.requireNonNull(id, "Session ID to use must be set.");

    RedisCommands<String, String> commands = connection.sync();

    List<KeyValue<String, String>> rawValues = commands.mget(uriKey(id), capabilitiesKey(id));

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
    Objects.requireNonNull(id, "Session ID to use must be set.");

    RedisCommands<String, String> commands = connection.sync();

    commands.del(uriKey(id), capabilitiesKey(id));
  }

  @Override
  public void close() {
    client.shutdown();
  }

  private String uriKey(SessionId id) {
    Objects.requireNonNull(id, "Session ID to use must be set.");

    return "session:" + id.toString() + ":uri";
  }

  private String capabilitiesKey(SessionId id) {
    Objects.requireNonNull(id, "Session ID to use must be set.");

    return "session:" + id.toString() + ":capabilities";
  }

}
