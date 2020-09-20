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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeDrainComplete;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.Dialect;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static java.time.Duration.ofSeconds;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.openqa.selenium.grid.data.NodeDrainComplete.NODE_DRAIN_COMPLETE;
import static org.openqa.selenium.grid.data.NodeRemovedEvent.NODE_REMOVED;
import static org.openqa.selenium.grid.data.SessionClosedEvent.SESSION_CLOSED;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class NodeTest {

  private Tracer tracer;
  private EventBus bus;
  private LocalNode local;
  private Node node;
  private ImmutableCapabilities caps;
  private URI uri;

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();

    caps = new ImmutableCapabilities("browserName", "cheese");

    uri = new URI("http://localhost:1234");

    class Handler extends Session implements HttpHandler {

      private Handler(Capabilities capabilities) {
        super(new SessionId(UUID.randomUUID()), uri, capabilities);
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        return new HttpResponse();
      }
    }

    local = LocalNode.builder(tracer, bus, uri, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
        .maximumConcurrentSessions(2)
        .build();

    node = new RemoteNode(
        tracer,
        new PassthroughHttpClient.Factory(local),
        new NodeId(UUID.randomUUID()),
        uri,
        ImmutableSet.of(caps));
  }

  @Test
  public void shouldRefuseToCreateASessionIfNoFactoriesAttached() {
    Node local = LocalNode.builder(tracer, bus, uri, uri, null).build();
    HttpClient.Factory clientFactory = new PassthroughHttpClient.Factory(local);
    Node node = new RemoteNode(tracer, clientFactory, new NodeId(UUID.randomUUID()), uri, ImmutableSet.of());

    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);

    assertThat(session).isNotPresent();
  }

  @Test
  public void shouldCreateASessionIfTheCorrectCapabilitiesArePassedToIt() {
    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);

    assertThat(session).isPresent();
  }

  @Test
  public void shouldOnlyCreateAsManySessionsAsFactories() {
    Node node = LocalNode.builder(tracer, bus, uri, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, uri, c)))
        .build();

    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session).isPresent();

    session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session).isNotPresent();
  }

  @Test
  public void willRefuseToCreateMoreSessionsThanTheMaxSessionCount() {
    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session).isPresent();

    session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session).isPresent();

    session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session).isNotPresent();
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
  public void willRespondToWebDriverCommandsSentToOwnedSessions() {
    AtomicBoolean called = new AtomicBoolean(false);

    class Recording extends Session implements HttpHandler {

      private Recording() {
        super(new SessionId(UUID.randomUUID()), uri, caps);
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        called.set(true);
        return new HttpResponse();
      }
    }

    Node local = LocalNode.builder(tracer, bus, uri, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Recording()))
        .build();
    Node remote = new RemoteNode(
        tracer,
        new PassthroughHttpClient.Factory(local),
        new NodeId(UUID.randomUUID()),
        uri,
        ImmutableSet.of(caps));

    Session session = remote.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/url", session.getId()));
    remote.execute(req);

    assertThat(called.get()).isTrue();
  }

  @Test
  public void shouldOnlyRespondToWebDriverCommandsForSessionsTheNodeOwns() {
    Session session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
        .orElseThrow(() -> new RuntimeException("Session not created"));

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/url", session.getId()));
    assertThat(local.matches(req)).isTrue();
    assertThat(node.matches(req)).isTrue();

    req = new HttpRequest(POST, String.format("/session/%s/url", UUID.randomUUID()));
    assertThat(local.matches(req)).isFalse();
    assertThat(node.matches(req)).isFalse();
  }

  @Test
  public void aSessionThatTimesOutWillBeStoppedAndRemovedFromTheSessionMap() {
    AtomicReference<Instant> now = new AtomicReference<>(Instant.now());

    Clock clock = new MyClock(now);
    Node node = LocalNode.builder(tracer, bus, uri, uri, null)
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
    Node local = LocalNode.builder(tracer, bus, uri, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> {
          throw new SessionNotCreatedException("eeek");
        }))
        .build();

    Optional<Session> session = local.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);

    assertThat(session).isNotPresent();
  }

  @Test
  public void eachSessionShouldReportTheNodesUrl() throws URISyntaxException {
    URI sessionUri = new URI("http://cheese:42/peas");
    Node node = LocalNode.builder(tracer, bus, uri, uri, null)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, sessionUri, c)))
        .build();
    Optional<Session> session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession);
    assertThat(session).isPresent();
    assertThat(session.get().getUri()).isEqualTo(uri);
  }

  @Test
  public void quittingASessionShouldCauseASessionClosedEventToBeFired() {
    AtomicReference<Object> obj = new AtomicReference<>();
    bus.addListener(SESSION_CLOSED, event -> obj.set(event.getData(Object.class)));

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

  @Test
  public void canReturnStatus() {
    node.newSession(createSessionRequest(caps))
      .map(CreateSessionResponse::getSession)
      .orElseThrow(() -> new AssertionError("Cannot create session"));

    HttpRequest req = new HttpRequest(GET, "/status");
    HttpResponse res = node.execute(req);
    assertThat(res.getStatus()).isEqualTo(200);

    NodeStatus seen = null;
    try (JsonInput input = new Json().newInput(Contents.reader(res))) {
      input.beginObject();
      while (input.hasNext()) {
        switch (input.nextName()) {
          case "value":
            input.beginObject();
            while (input.hasNext()) {
              switch (input.nextName()) {
                case "node":
                  seen = input.read(NodeStatus.class);
                  break;

                default:
                  input.skipValue();
              }
            }
            input.endObject();
            break;

          default:
            input.skipValue();
            break;
        }
      }
    }

    NodeStatus expected = node.getStatus();

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  public void returns404ForAnUnknownCommand() {
    HttpRequest req = new HttpRequest(GET, "/foo");
    HttpResponse res = node.execute(req);
    assertThat(res.getStatus()).isEqualTo(404);
    Map<String, Object> content = new Json().toType(string(res), MAP_TYPE);
    assertThat(content).containsOnlyKeys("value")
        .extracting("value").asInstanceOf(MAP)
        .containsEntry("error", "unknown command")
        .containsEntry("message", "Unable to find handler for (GET) /foo");
  }

  @Test
  public void canUploadAFile() throws IOException {
    Session session = node.newSession(createSessionRequest(caps))
        .map(CreateSessionResponse::getSession)
        .orElseThrow(() -> new AssertionError("Cannot create session"));

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/file", session.getId()));
    String hello = "Hello, world!";
    String zip = Zip.zip(createTmpFile(hello));
    String payload = new Json().toJson(Collections.singletonMap("file", zip));
    req.setContent(() -> new ByteArrayInputStream(payload.getBytes()));
    node.execute(req);

    File baseDir = getTemporaryFilesystemBaseDir(local.getTemporaryFilesystem(session.getId()));
    assertThat(baseDir.listFiles()).hasSize(1);
    File uploadDir = baseDir.listFiles()[0];
    assertThat(uploadDir.listFiles()).hasSize(1);
    assertThat(new String(Files.readAllBytes(uploadDir.listFiles()[0].toPath()))).isEqualTo(hello);

    node.stop(session.getId());
    assertThat(baseDir).doesNotExist();
  }

  @Test
  public void shouldNotCreateSessionIfDraining() {
    node.drain();
    assertThat(local.isDraining()).isTrue();
    assertThat(node.isDraining()).isTrue();

    Optional<CreateSessionResponse> sessionResponse = node.newSession(createSessionRequest(caps));

    assertThat(sessionResponse.isPresent()).isFalse();
  }

  @Test
  public void shouldNotShutdownDuringOngoingSessionsIfDraining() throws InterruptedException {
    Optional<Session> firstSession =
        node.newSession(createSessionRequest(caps)).map(CreateSessionResponse::getSession);
    Optional<Session> secondSession =
        node.newSession(createSessionRequest(caps)).map(CreateSessionResponse::getSession);

    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NODE_DRAIN_COMPLETE, e -> latch.countDown());

    node.drain();
    assertThat(local.isDraining()).isTrue();
    assertThat(node.isDraining()).isTrue();

    Optional<CreateSessionResponse> sessionResponse = node.newSession(createSessionRequest(caps));
    assertThat(sessionResponse.isPresent()).isFalse();

    assertThat(firstSession.isPresent()).isTrue();
    assertThat(secondSession.isPresent()).isTrue();

    assertThat(local.getCurrentSessionCount()).isEqualTo(2);

    latch.await(1, SECONDS);

    assertThat(latch.getCount()).isEqualTo(1);
  }

  @Test
  public void shouldShutdownAfterSessionsCompleteIfDraining() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NODE_DRAIN_COMPLETE, e -> latch.countDown());

    Optional<Session> firstSession =
        node.newSession(createSessionRequest(caps)).map(CreateSessionResponse::getSession);
    Optional<Session> secondSession =
        node.newSession(createSessionRequest(caps)).map(CreateSessionResponse::getSession);

    node.drain();

    assertThat(firstSession.isPresent()).isTrue();
    assertThat(secondSession.isPresent()).isTrue();

    node.stop(firstSession.get().getId());
    node.stop(secondSession.get().getId());

    latch.await(5, SECONDS);

    assertThat(latch.getCount()).isEqualTo(0);
  }

  @Test
  public void shouldAllowsWebDriverCommandsForOngoingSessionIfDraining() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NODE_DRAIN_COMPLETE, e -> latch.countDown());

    Optional<Session> session =
        node.newSession(createSessionRequest(caps)).map(CreateSessionResponse::getSession);

    node.drain();

    SessionId sessionId = session.get().getId();
    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/url", sessionId));

    HttpResponse response = node.execute(req);

    assertThat(response.getStatus()).isEqualTo(200);

    assertThat(latch.getCount()).isEqualTo(1);
  }

  private File createTmpFile(String content) {
    try {
      File f = File.createTempFile("webdriver", "tmp");
      f.deleteOnExit();
      Files.write(f.toPath(), content.getBytes(StandardCharsets.UTF_8));
      return f;
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private File getTemporaryFilesystemBaseDir(TemporaryFilesystem tempFS) {
    File tmp = tempFS.createTempDir("tmp", "");
    File baseDir = tmp.getParentFile();
    tempFS.deleteTempDir(tmp);
    return baseDir;
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
