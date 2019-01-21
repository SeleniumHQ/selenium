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

package org.openqa.selenium.grid.node;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableSet;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.grid.web.PassthroughHttpClient;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

public class NodeTest {

  private DistributedTracer tracer;
  private HttpClient.Factory clientFactory;
  private LocalNode local;
  private Node node;
  private ImmutableCapabilities caps;
  private URI uri;
  private SessionMap sessions;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DistributedTracer.builder().build();

    clientFactory = HttpClient.Factory.createDefault();

    caps = new ImmutableCapabilities("browserName", "cheese");

    uri = new URI("http://localhost:1234");

    sessions = new LocalSessionMap(tracer);

    class Handler extends Session implements CommandHandler {

      private Handler(Capabilities capabilities) {
        super(new SessionId(UUID.randomUUID()), uri, capabilities);
      }

      @Override
      public void execute(HttpRequest req, HttpResponse resp) {
        // Does nothing
      }
    }

    local = LocalNode.builder(tracer, clientFactory, uri, sessions)
        .add(caps, c -> new Handler(c))
        .add(caps, c -> new Handler(c))
        .add(caps, c -> new Handler(c))
        .maximumConcurrentSessions(2)
        .build();

    HttpClient client = new PassthroughHttpClient<>(local);
    node = new RemoteNode(
        tracer,
        UUID.randomUUID(),
        uri,
        ImmutableSet.of(caps),
        client);
  }

  @Test
  public void shouldRefuseToCreateASessionIfNoFactoriesAttached() {
    Node local = LocalNode.builder(tracer, clientFactory, uri, sessions).build();
    HttpClient client = new PassthroughHttpClient<>(local);
    Node node = new RemoteNode(tracer, UUID.randomUUID(), uri, ImmutableSet.of(), client);

    Optional<Session> session = node.newSession(caps);

    assertThat(session.isPresent()).isFalse();
  }

  @Test
  public void shouldCreateASessionIfTheCorrectCapabilitiesArePassedToIt() {
    Optional<Session> session = node.newSession(caps);

    assertThat(session.isPresent()).isTrue();
  }

  @Test
  public void shouldOnlyCreateAsManySessionsAsFactories() {
    Node node = LocalNode.builder(tracer, clientFactory, uri, sessions)
        .add(caps, (c) -> new Session(new SessionId(UUID.randomUUID()), uri, c))
        .build();

    Optional<Session> session = node.newSession(caps);
    assertThat(session.isPresent()).isTrue();

    session = node.newSession(caps);
    assertThat(session.isPresent()).isFalse();
  }

  @Test
  public void willRefuseToCreateMoreSessionsThanTheMaxSessionCount() {
    Optional<Session> session = node.newSession(caps);
    assertThat(session.isPresent()).isTrue();

    session = node.newSession(caps);
    assertThat(session.isPresent()).isTrue();

    session = node.newSession(caps);
    assertThat(session.isPresent()).isFalse();
  }

  @Test
  public void newlyCreatedSessionsAreAddedToTheSessionMap() {
    Session expected = node.newSession(caps)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    Session seen = sessions.get(expected.getId());

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  public void stoppingASessionReducesTheNumberOfCurrentlyActiveSessions() {
    assertThat(local.getCurrentSessionCount()).isEqualTo(0);

    Session session = local.newSession(caps)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    assertThat(local.getCurrentSessionCount()).isEqualTo(1);

    local.stop(session.getId());

    assertThat(local.getCurrentSessionCount()).isEqualTo(0);
  }


  @Test
  public void sessionsThatAreStoppedWillNotBeReturned() {
    Session expected = node.newSession(caps)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    assertThat(sessions.get(expected.getId())).isEqualTo(expected);

    node.stop(expected.getId());

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> local.getSession(expected.getId()));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(expected.getId()));
  }

  @Test
  public void stoppingASessionWillRemoveItFromTheSessionMap() {
    Session expected = node.newSession(caps)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    assertThat(sessions.get(expected.getId())).isEqualTo(expected);

    node.stop(expected.getId());

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> sessions.get(expected.getId()));
  }

  @Test
  public void stoppingASessionThatDoesNotExistWillThrowAnException() {
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> local.stop(new SessionId(UUID.randomUUID())));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.stop(new SessionId(UUID.randomUUID())));
  }

  @Test
  public void attemptingToGetASessionThatDoesNotExistWillCauseAnExceptionToBeThrown() {
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> local.getSession(new SessionId(UUID.randomUUID())));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(new SessionId(UUID.randomUUID())));
  }

  @Test
  public void willRespondToWebDriverCommandsSentToOwnedSessions() throws IOException {
    AtomicBoolean called = new AtomicBoolean(false);

    class Recording extends Session implements CommandHandler {

      private Recording() {
        super(new SessionId(UUID.randomUUID()), uri, caps);
      }

      @Override
      public void execute(HttpRequest req, HttpResponse resp) {
        called.set(true);
      }
    }

    Node local = LocalNode.builder(tracer, clientFactory, uri, sessions)
        .add(caps, c -> new Recording())
        .build();
    Node remote = new RemoteNode(
        tracer,
        UUID.randomUUID(),
        uri,
        ImmutableSet.of(caps),
        new PassthroughHttpClient<>(local));

    Session session = remote.newSession(caps)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/url", session.getId()));
    remote.execute(req, new HttpResponse());

    assertThat(called.get()).isTrue();
  }

  @Test
  public void shouldOnlyRespondToWebDriverCommandsForSessionsTheNodeOwns() {
    Session session = node.newSession(caps)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/url", session.getId()));
    assertThat(local.test(req)).isTrue();
    assertThat(node.test(req)).isTrue();

    req = new HttpRequest(POST, String.format("/session/%s/url", UUID.randomUUID()));
    assertThat(local.test(req)).isFalse();
    assertThat(node.test(req)).isFalse();
  }

  @Test
  public void aSessionThatTimesOutWillBeStoppedAndRemovedFromTheSessionMap() {
    AtomicReference<Instant> now = new AtomicReference<>(Instant.now());

    Clock clock = new MyClock(now);
    Node node = LocalNode.builder(tracer, clientFactory, uri, sessions)
        .add(caps, c -> new Session(new SessionId(UUID.randomUUID()), uri, c))
        .sessionTimeout(Duration.ofMinutes(3))
        .advanced()
        .clock(clock)
        .build();
    Session session = node.newSession(caps)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    now.set(now.get().plus(Duration.ofMinutes(5)));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(session.getId()));
  }

  @Test
  public void shouldNotPropagateExceptionsWhenSessionCreationFails() {
    Node local = LocalNode.builder(tracer, clientFactory, uri, sessions)
        .add(caps, c -> {
          throw new SessionNotCreatedException("eeek");
        })
        .build();

    Optional<Session> session = local.newSession(caps);

    assertThat(session.isPresent()).isFalse();
  }

  private static class MyClock extends Clock {

    private final AtomicReference<Instant> now;

    public MyClock(AtomicReference<Instant> now) {
      this.now = now;
    }

    @Override
    public ZoneId getZone() {
      return ZoneId.systemDefault();
    }

    @Override
    public Clock withZone(ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return now.get();
    }
  }
}
