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

import io.opentelemetry.OpenTelemetry;
import io.opentelemetry.trace.Tracer;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.SessionId;
import redis.embedded.RedisServer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class RedisBackedSessionMapTest {

  private static RedisServer server;
  private static Tracer tracer = OpenTelemetry.getTracerProvider().get("default");
  private static URI uri;

  @BeforeClass
  public static void startRedisServer() throws URISyntaxException {
    uri = new URI("redis://localhost:" + PortProber.findFreePort());
    server = RedisServer.builder().port(uri.getPort()).build();
    server.start();
  }

  @AfterClass
  public static void tearDownRedisServer() {
    safelyCall(() -> server.stop());
  }

  @Test(expected = NoSuchSessionException.class)
  public void shouldThrowANoSuchSessionExceptionIfTheSessionDoesNotExist() {
    SessionMap sessions = new RedisBackedSessionMap(tracer, uri);

    sessions.get(new SessionId(UUID.randomUUID()));
  }

  @Test
  public void canGetTheUriOfASessionWithoutNeedingUrl() throws URISyntaxException {
    SessionMap sessions = new RedisBackedSessionMap(tracer, uri);

    Session expected = new Session(
      new SessionId(UUID.randomUUID()),
      new URI("http://example.com/foo"),
      new ImmutableCapabilities());
    sessions.add(expected);

    SessionMap reader = new RedisBackedSessionMap(tracer, uri);

    URI seen = reader.getUri(expected.getId());

    assertThat(seen).isEqualTo(expected.getUri());
  }

  @Test
  public void canCreateARedisBackedSessionMap() throws URISyntaxException {
    SessionMap sessions = new RedisBackedSessionMap(tracer, uri);

    Session expected = new Session(
      new SessionId(UUID.randomUUID()),
      new URI("http://example.com/foo"),
      new ImmutableCapabilities("cheese", "beyaz peynir"));
    sessions.add(expected);

    SessionMap reader = new RedisBackedSessionMap(tracer, uri);

    Session seen = reader.get(expected.getId());

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  public void shouldBeAbleToRemoveSessions() throws URISyntaxException {
    SessionMap sessions = new RedisBackedSessionMap(tracer, uri);

    Session expected = new Session(
      new SessionId(UUID.randomUUID()),
      new URI("http://example.com/foo"),
      new ImmutableCapabilities("cheese", "beyaz peynir"));
    sessions.add(expected);

    SessionMap reader = new RedisBackedSessionMap(tracer, uri);

    reader.remove(expected.getId());

    try {
      reader.get(expected.getId());
      fail("Oh noes!");
    } catch (NoSuchSessionException ignored) {
      // This is expected
    }
  }
}
