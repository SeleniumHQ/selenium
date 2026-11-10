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

import static java.util.UUID.randomUUID;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.openqa.selenium.testing.Safely.safelyCall;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeRemovedEvent;
import org.openqa.selenium.grid.data.NodeRestartedEvent;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.data.SlotId;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.testcontainers.containers.GenericContainer;

class RedisBackedSessionMapTest {

  @SuppressWarnings("resource")
  private GenericContainer<?> redis =
      new GenericContainer<>("redis:8-alpine").withExposedPorts(6379);

  private EventBus bus;
  private RedisBackedSessionMap sessions;
  private URI redisUri;
  private Tracer tracer;

  @BeforeEach
  public void setUp() throws URISyntaxException {
    redis.start();
    redisUri = new URI("redis://" + redis.getHost() + ":" + redis.getMappedPort(6379));

    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    sessions = new RedisBackedSessionMap(tracer, redisUri, bus);
  }

  @AfterEach
  public void tearDownRedisServer() {
    sessions.getRedisClient().close();
    safelyCall(() -> redis.stop());
    bus.close();
  }

  @Test
  void shouldThrowANoSuchSessionExceptionIfTheSessionDoesNotExist() {
    String sessionId = randomUUID().toString();
    assertThatThrownBy(() -> sessions.get(new SessionId(sessionId)))
        .isInstanceOf(NoSuchSessionException.class)
        .hasMessageContaining(sessionId);
  }

  @Test
  void canGetTheUriOfASessionWithoutNeedingUrl() throws URISyntaxException {
    Session expected =
        new Session(
            new SessionId(randomUUID()),
            new URI("http://example.com/foo"),
            new ImmutableCapabilities(),
            new ImmutableCapabilities(),
            Instant.now());
    sessions.add(expected);

    URI seen = sessions.getUri(expected.getId());

    assertThat(seen).isEqualTo(expected.getUri());
  }

  @Test
  void canCreateARedisBackedSessionMap() throws URISyntaxException {
    Session expected =
        new Session(
            new SessionId(randomUUID()),
            new URI("http://example.com/foo"),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("cheese", "beyaz peynir"),
            Instant.now());
    sessions.add(expected);

    Session seen = sessions.get(expected.getId());

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  void shouldBeAbleToRemoveSessions() throws URISyntaxException {
    Session expected =
        new Session(
            new SessionId(randomUUID()),
            new URI("http://example.com/foo"),
            new ImmutableCapabilities(),
            new ImmutableCapabilities("cheese", "beyaz peynir"),
            Instant.now());
    sessions.add(expected);

    sessions.remove(expected.getId());

    assertThatThrownBy(() -> sessions.get(expected.getId()))
        .isInstanceOf(NoSuchSessionException.class);
  }

  @Test
  void secondRedisBackedSessionMapCanReadSessionAddedByFirst() throws URISyntaxException {
    Session expected = createSession(new URI("http://example.com/foo"));
    sessions.add(expected);

    RedisBackedSessionMap reader = new RedisBackedSessionMap(tracer, redisUri, bus);
    try {
      assertThat(reader.get(expected.getId())).isEqualTo(expected);
    } finally {
      reader.getRedisClient().close();
    }
  }

  @Test
  void sessionClosedEventRemovesSession() throws URISyntaxException {
    Session expected = createSession(new URI("http://example.com/foo"));
    sessions.add(expected);

    bus.fire(new SessionClosedEvent(expected.getId()));

    assertThatThrownBy(() -> sessions.get(expected.getId()))
        .isInstanceOf(NoSuchSessionException.class);
  }

  @Test
  void nodeRemovedEventRemovesOnlySessionsInRemovedNodeSlots() throws URISyntaxException {
    URI removedNodeUri = new URI("http://example.com/removed");
    URI survivingNodeUri = new URI("http://example.com/surviving");
    Session removed = createSession(removedNodeUri);
    Session surviving = createSession(survivingNodeUri);
    sessions.add(removed);
    sessions.add(surviving);

    bus.fire(new NodeRemovedEvent(createNodeStatus(removedNodeUri, removed)));

    assertThatThrownBy(() -> sessions.get(removed.getId()))
        .isInstanceOf(NoSuchSessionException.class);
    assertThat(sessions.get(surviving.getId())).isEqualTo(surviving);
  }

  @Test
  void nodeRestartedEventRemovesAllSessionsByPreviousNodeUri() throws URISyntaxException {
    URI restartedNodeUri = new URI("http://example.com/restarted");
    URI survivingNodeUri = new URI("http://example.com/surviving");
    Session first = createSession(restartedNodeUri);
    Session second = createSession(restartedNodeUri);
    Session surviving = createSession(survivingNodeUri);
    sessions.add(first);
    sessions.add(second);
    sessions.add(surviving);

    bus.fire(new NodeRestartedEvent(createNodeStatus(restartedNodeUri, null)));

    assertThatThrownBy(() -> sessions.get(first.getId()))
        .isInstanceOf(NoSuchSessionException.class);
    assertThatThrownBy(() -> sessions.get(second.getId()))
        .isInstanceOf(NoSuchSessionException.class);
    assertThat(sessions.get(surviving.getId())).isEqualTo(surviving);
  }

  @Test
  void removeByUriDoesNothingWhenNoSessionsMatch() throws URISyntaxException {
    Session expected = createSession(new URI("http://example.com/foo"));
    sessions.add(expected);

    sessions.removeByUri(new URI("http://example.com/other"));

    assertThat(sessions.get(expected.getId())).isEqualTo(expected);
  }

  @Test
  void removeDeletesAllSessionKeys() throws URISyntaxException {
    Session expected = createSession(new URI("http://example.com/foo"));
    SessionId id = expected.getId();
    sessions.add(expected);

    sessions.remove(id);

    assertThat(sessions.getRedisClient().get("session:" + id + ":uri")).isNull();
    assertThat(sessions.getRedisClient().get("session:" + id + ":capabilities")).isNull();
    assertThat(sessions.getRedisClient().get("session:" + id + ":stereotype")).isNull();
    assertThat(sessions.getRedisClient().get("session:" + id + ":start")).isNull();
  }

  @Test
  void isReadyReflectsRedisConnectionState() {
    assertThat(sessions.isReady()).isTrue();

    sessions.getRedisClient().close();

    assertThat(sessions.isReady()).isFalse();
  }

  private Session createSession(URI uri) {
    return new Session(
        new SessionId(randomUUID()),
        uri,
        new ImmutableCapabilities("browserName", "cheese"),
        new ImmutableCapabilities("cheese", "beyaz peynir"),
        Instant.now());
  }

  @Test
  void addReturnsTrue() throws URISyntaxException {
    Session session = createSession(new URI("http://example.com/foo"));
    assertThat(sessions.add(session)).isTrue();
  }

  @Test
  void getUriThrowsForMalformedUriStoredInRedis() {
    SessionId id = new SessionId(randomUUID());
    sessions.getRedisClient().mset(Map.of("session:" + id + ":uri", "not a valid uri"));
    assertThatThrownBy(() -> sessions.getUri(id))
        .isInstanceOf(NoSuchSessionException.class)
        .hasMessageContaining(id.toString());
  }

  @Test
  void getSucceedsWhenStartKeyIsMissing() throws URISyntaxException {
    Session expected = createSession(new URI("http://example.com/foo"));
    sessions.add(expected);
    sessions.getRedisClient().del("session:" + expected.getId() + ":start");

    Session seen = sessions.get(expected.getId());

    assertThat(seen.getId()).isEqualTo(expected.getId());
    assertThat(seen.getUri()).isEqualTo(expected.getUri());
    assertThat(seen.getStartTime()).isEqualTo(Instant.EPOCH);
  }

  @Test
  void removeIsIdempotent() {
    SessionId id = new SessionId(randomUUID());
    assertThatNoException().isThrownBy(() -> sessions.remove(id));
  }

  @Test
  void removeByUriIsNoOpWhenRedisIsEmpty() throws URISyntaxException {
    assertThatNoException()
        .isThrownBy(() -> sessions.removeByUri(new URI("http://example.com/foo")));
  }

  @Test
  void nodeRemovedEventIgnoresSlotsWithNullSession() throws URISyntaxException {
    URI nodeUri = new URI("http://example.com/node");
    Session activeSession = createSession(nodeUri);
    sessions.add(activeSession);

    bus.fire(new NodeRemovedEvent(createNodeStatusWithNullSlot(nodeUri, activeSession)));

    assertThatThrownBy(() -> sessions.get(activeSession.getId()))
        .isInstanceOf(NoSuchSessionException.class);
  }

  @Test
  void createFromConfigBuildsWorkingSessionMap() throws URISyntaxException {
    Config config =
        new MapConfig(
            Map.of(
                "sessions", Map.of("host", redisUri.toString()),
                "events",
                    Map.of("implementation", "org.openqa.selenium.events.local.GuavaEventBus")));

    SessionMap sessionMap = RedisBackedSessionMap.create(config);
    try {
      Session expected = createSession(new URI("http://example.com/foo"));
      sessionMap.add(expected);
      assertThat(((RedisBackedSessionMap) sessionMap).get(expected.getId())).isEqualTo(expected);
    } finally {
      ((RedisBackedSessionMap) sessionMap).getRedisClient().close();
    }
  }

  private org.openqa.selenium.grid.data.NodeStatus createNodeStatus(URI nodeUri, Session session) {
    NodeId nodeId = new NodeId(UUID.randomUUID());
    return new org.openqa.selenium.grid.data.NodeStatus(
        nodeId,
        nodeUri,
        1,
        Set.of(
            new Slot(
                new SlotId(nodeId, UUID.randomUUID()),
                new ImmutableCapabilities("browserName", "cheese"),
                Instant.now(),
                session)),
        Availability.UP,
        Duration.ofSeconds(30),
        Duration.ofSeconds(30),
        "test",
        Map.of());
  }

  private org.openqa.selenium.grid.data.NodeStatus createNodeStatusWithNullSlot(
      URI nodeUri, Session activeSession) {
    NodeId nodeId = new NodeId(UUID.randomUUID());
    return new org.openqa.selenium.grid.data.NodeStatus(
        nodeId,
        nodeUri,
        2,
        Set.of(
            new Slot(
                new SlotId(nodeId, UUID.randomUUID()),
                new ImmutableCapabilities("browserName", "cheese"),
                Instant.now(),
                activeSession),
            new Slot(
                new SlotId(nodeId, UUID.randomUUID()),
                new ImmutableCapabilities("browserName", "cheese"),
                Instant.now(),
                null)),
        Availability.UP,
        Duration.ofSeconds(30),
        Duration.ofSeconds(30),
        "test",
        Map.of());
  }
}
