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

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import redis.embedded.RedisServer;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.openqa.selenium.testing.Safely.safelyCall;

public class RedisBackedSessionMapTest {

  private RedisServer server;
  private EventBus bus;
  private Tracer tracer = DefaultTestTracer.createTracer();
  private URI uri;
  private RedisBackedSessionMap sessions;

  @BeforeEach
  public void setUp() throws URISyntaxException {
    uri = new URI("redis://localhost:" + PortProber.findFreePort());
    server = RedisServer.builder().port(uri.getPort()).build();
    server.start();

    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    sessions = new RedisBackedSessionMap(tracer, uri, bus);
  }

  @AfterEach
  public void tearDownRedisServer() {
    sessions.getRedisClient().close();
    safelyCall(() -> server.stop());
  }

  @Test
  public void shouldThrowANoSuchSessionExceptionIfTheSessionDoesNotExist() {
    assertThrows(NoSuchSessionException.class, () -> {
      sessions.get(new SessionId(UUID.randomUUID()));
    });
  }

  @Test
  public void canGetTheUriOfASessionWithoutNeedingUrl() throws URISyntaxException {
    Session expected = new Session(
      new SessionId(UUID.randomUUID()),
      new URI("http://example.com/foo"),
      new ImmutableCapabilities(),
      new ImmutableCapabilities(),
      Instant.now());
    sessions.add(expected);

    URI seen = sessions.getUri(expected.getId());

    assertThat(seen).isEqualTo(expected.getUri());
  }

  @Test
  public void canCreateARedisBackedSessionMap() throws URISyntaxException {
    Session expected = new Session(
      new SessionId(UUID.randomUUID()),
      new URI("http://example.com/foo"),
      new ImmutableCapabilities(),
      new ImmutableCapabilities("cheese", "beyaz peynir"),
      Instant.now());
    sessions.add(expected);

    Session seen = sessions.get(expected.getId());

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  public void shouldBeAbleToRemoveSessions() throws URISyntaxException {
    Session expected = new Session(
      new SessionId(UUID.randomUUID()),
      new URI("http://example.com/foo"),
      new ImmutableCapabilities(),
      new ImmutableCapabilities("cheese", "beyaz peynir"),
      Instant.now());
    sessions.add(expected);

    sessions.remove(expected.getId());

    try {
      sessions.get(expected.getId());
      fail("Oh noes!");
    } catch (NoSuchSessionException ignored) {
      // This is expected
    }
  }
}
