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

import static java.time.Duration.ofSeconds;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.grid.data.SessionClosedEvent.SESSION_CLOSED;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.zeromq.ZeroMqEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CommandHandler;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DistributedTracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;
import org.zeromq.ZContext;

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
  private EventBus bus;
  private HttpClient.Factory clientFactory;
  private LocalNode local;
  private Node node;
  private ImmutableCapabilities caps;
  private URI uri;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DistributedTracer.builder().build();

    bus = ZeroMqEventBus.create(
        new ZContext(),
        "inproc://node-test-pub",
        "inproc://node-test-sub",
        true);

    clientFactory = HttpClient.Factory.createDefault();

    caps = new ImmutableCapabilities("browserName", "cheese");

    uri = new URI("http://localhost:1234");

    class Handler extends Session implements CommandHandler {

      private Handler(Capabilities capabilities) {
        super(new SessionId(UUID.randomUUID()), uri, capabilities);
      }

      @Override
      public void execute(HttpRequest req, HttpResponse resp) {
        // Does nothing
      }
    }

    local = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .maximumConcurrentSessions(2)
        .build();

    node = new RemoteNode(
        tracer,
        new PassthroughHttpClient.Factory<>(local),
        UUID.randomUUID(),
        uri,
        ImmutableSet.of(caps));
  }

  @Test
  public void shouldRefuseToCreateASessionIfNoFactoriesAttached() {
    Node local = LocalNode.builder(tracer, bus, clientFactory, uri).build();
    HttpClient.Factory clientFactory = new PassthroughHttpClient.Factory<>(local);
    Node node = new RemoteNode(tracer, clientFactory, UUID.randomUUID(), uri, ImmutableSet.of());

    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);

    assertThat(session.isPresent()).isFalse();
  }

  @Test
  public void shouldCreateASessionIfTheCorrectCapabilitiesArePassedToIt() {
    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);

    assertThat(session.isPresent()).isTrue();
  }

  @Test
  public void shouldOnlyCreateAsManySessionsAsFactories() {
    Node node = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, uri, c)))
        .build();

    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session.isPresent()).isTrue();

    session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session.isPresent()).isFalse();
  }

  @Test
  public void willRefuseToCreateMoreSessionsThanTheMaxSessionCount() {
    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session.isPresent()).isTrue();

    session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session.isPresent()).isTrue();

    session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session.isPresent()).isFalse();
  }

  @Test
  public void stoppingASessionReducesTheNumberOfCurrentlyActiveSessions() {
    assertThat(local.getCurrentSessionCount()).isEqualTo(0);

    Session session = local.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    assertThat(local.getCurrentSessionCount()).isEqualTo(1);

    local.stop(session.getId());

    assertThat(local.getCurrentSessionCount()).isEqualTo(0);
  }

  @Test
  public void sessionsThatAreStoppedWillNotBeReturned() {
    Session expected = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    node.stop(expected.getId());

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> local.getSession(expected.getId()));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(expected.getId()));
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

    Node local = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, new TestSessionFactory((id, c) -> new Recording()))
        .build();
    Node remote = new RemoteNode(
        tracer,
        new PassthroughHttpClient.Factory<>(local),
        UUID.randomUUID(),
        uri,
        ImmutableSet.of(caps));

    Session session = remote.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/url", session.getId()));
    remote.execute(req, new HttpResponse());

    assertThat(called.get()).isTrue();
  }

  @Test
  public void shouldOnlyRespondToWebDriverCommandsForSessionsTheNodeOwns() {
    Session session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
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
    Node node = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, uri, c)))
        .sessionTimeout(Duration.ofMinutes(3))
        .advanced()
        .clock(clock)
        .build();
    Session session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    now.set(now.get().plus(Duration.ofMinutes(5)));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(session.getId()));
  }

  @Test
  public void shouldNotPropagateExceptionsWhenSessionCreationFails() {
    Node local = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, new TestSessionFactory((id, c) -> {
          throw new SessionNotCreatedException("eeek");
        }))
        .build();

    Optional<Session> session = local.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);

    assertThat(session.isPresent()).isFalse();
  }

  @Test
  public void eachSessionShouldReportTheNodesUrl() throws URISyntaxException {
    URI sessionUri = new URI("http://cheese:42/peas");
    Node node = LocalNode.builder(tracer, bus, clientFactory, uri)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, sessionUri, c)))
        .build();
    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session.isPresent()).isTrue();
    assertThat(session.get().getUri()).isEqualTo(uri);
  }

  @Test
  public void quitingASessionShouldCauseASessionClosedEventToBeFired() {
    AtomicReference<Object> obj = new AtomicReference<>();
    bus.addListener(SESSION_CLOSED, event -> {
      obj.set(event.getData(Object.class));
    });

    Session session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
        .orElseThrow(() -> new AssertionError("Cannot create session"));
    node.stop(session.getId());

    // Because we're using the event bus, we can't expect the event to fire instantly. We're using
    // an inproc bus, so in reality it's reasonable to expect the event to fire synchronously, but
    // let's play it safe.
    Wait<AtomicReference<Object>> wait = new FluentWait<>(obj).withTimeout(ofSeconds(2));
    wait.until(ref -> ref.get() != null);
  }

  private CreateSessionRequest createSessionRequest(Capabilities caps) {
    return new CreateSessionRequest(
            ImmutableSet.copyOf(Dialect.values()),
            caps,
            ImmutableMap.of());
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
