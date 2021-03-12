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
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.RetrySessionRequestException;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeDrainComplete;
import org.openqa.selenium.grid.data.NodeId;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionClosedEvent;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.testing.EitherAssert;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
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
import java.util.Collections;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

public class NodeTest {

  private Tracer tracer;
  private EventBus bus;
  private LocalNode local;
  private Node node;
  private ImmutableCapabilities stereotype;
  private ImmutableCapabilities caps;
  private URI uri;
  private Secret registrationSecret;

  private static <A, B> EitherAssert<A, B> assertThatEither(Either<A, B> either) {
    return new EitherAssert<>(either);
  }

  @Before
  public void setUp() throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();

    registrationSecret = new Secret("sussex charmer");

    stereotype = new ImmutableCapabilities("browserName", "cheese");
    caps = new ImmutableCapabilities("browserName", "cheese");

    uri = new URI("http://localhost:1234");

    class Handler extends Session implements HttpHandler {
      private Handler(Capabilities capabilities) {
        super(new SessionId(UUID.randomUUID()), uri, stereotype, capabilities, Instant.now());
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        return new HttpResponse();
      }
    }

    local = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
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
        registrationSecret,
        ImmutableSet.of(caps));
  }

  @Test
  public void shouldRefuseToCreateASessionIfNoFactoriesAttached() {
    Node local = LocalNode.builder(tracer, bus, uri, uri, registrationSecret).build();
    HttpClient.Factory clientFactory = new PassthroughHttpClient.Factory(local);
    Node node = new RemoteNode(
      tracer,
      clientFactory,
      new NodeId(UUID.randomUUID()),
      uri,
      registrationSecret,
      ImmutableSet.of());

    Either<WebDriverException, CreateSessionResponse> response = node.newSession(
      createSessionRequest(caps));

    assertThatEither(response).isLeft();
  }

  @Test
  public void shouldCreateASessionIfTheCorrectCapabilitiesArePassedToIt() {
    Either<WebDriverException, CreateSessionResponse> response = node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();

    CreateSessionResponse sessionResponse = response.right();
    assertThat(sessionResponse.getSession()).isNotNull();
  }

  @Test
  public void shouldRetryIfNoMatchingSlotIsAvailable() {
    Node local = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
      .add(caps, new SessionFactory() {
        @Override
        public Either<WebDriverException, ActiveSession> apply(
          CreateSessionRequest createSessionRequest) {
          return Either.left(new SessionNotCreatedException("HelperFactory for testing"));
        }

        @Override
        public boolean test(Capabilities capabilities) {
          return false;
        }
      })
      .build();

    HttpClient.Factory clientFactory = new PassthroughHttpClient.Factory(local);
    Node node = new RemoteNode(
      tracer,
      clientFactory,
      new NodeId(UUID.randomUUID()),
      uri,
      registrationSecret,
      ImmutableSet.of(caps));

    ImmutableCapabilities wrongCaps = new ImmutableCapabilities("browserName", "burger");
    Either<WebDriverException, CreateSessionResponse> sessionResponse = node.newSession(createSessionRequest(wrongCaps));

    assertThatEither(sessionResponse).isLeft();
    assertThat(sessionResponse.left()).isInstanceOf(RetrySessionRequestException.class);
  }

  @Test
  public void shouldOnlyCreateAsManySessionsAsFactories() {
    Node node = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, uri, stereotype, c, Instant.now())))
        .build();

    Either<WebDriverException, CreateSessionResponse> response =
      node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    assertThat(session).isNotNull();

    Either<WebDriverException, CreateSessionResponse> secondSession =
      node.newSession(createSessionRequest(caps));

    assertThatEither(secondSession).isLeft();
  }

  @Test
  public void willRefuseToCreateMoreSessionsThanTheMaxSessionCount() {
    Either<WebDriverException, CreateSessionResponse> response = node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();

    response = node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();

    response = node.newSession(createSessionRequest(caps));
    assertThatEither(response).isLeft();
  }

  @Test
  public void stoppingASessionReducesTheNumberOfCurrentlyActiveSessions() {
    assertThat(local.getCurrentSessionCount()).isEqualTo(0);

    Either<WebDriverException, CreateSessionResponse> response = local.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();

    assertThat(local.getCurrentSessionCount()).isEqualTo(1);

    local.stop(session.getId());

    assertThat(local.getCurrentSessionCount()).isEqualTo(0);
  }

  @Test
  public void sessionsThatAreStoppedWillNotBeReturned() {
    Either<WebDriverException, CreateSessionResponse> response = node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session expected = response.right().getSession();

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
        super(new SessionId(UUID.randomUUID()), uri, stereotype, caps, Instant.now());
      }

      @Override
      public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
        called.set(true);
        return new HttpResponse();
      }
    }

    Node local = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
        .add(caps, new TestSessionFactory((id, c) -> new Recording()))
        .build();
    Node remote = new RemoteNode(
        tracer,
        new PassthroughHttpClient.Factory(local),
        new NodeId(UUID.randomUUID()),
        uri,
        registrationSecret,
        ImmutableSet.of(caps));

    Either<WebDriverException, CreateSessionResponse> response =
      remote.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();

    Session session = response.right().getSession();

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/url", session.getId()));
    remote.execute(req);

    assertThat(called.get()).isTrue();
  }

  @Test
  public void shouldOnlyRespondToWebDriverCommandsForSessionsTheNodeOwns() {
    Either<WebDriverException, CreateSessionResponse> response =
      node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();

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
    Node node = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, uri, stereotype, c, Instant.now())))
        .sessionTimeout(Duration.ofMinutes(3))
        .advanced()
        .clock(clock)
        .build();
    Either<WebDriverException, CreateSessionResponse> response =
      node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();

    now.set(now.get().plus(Duration.ofMinutes(5)));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(session.getId()));
  }

  @Test
  public void shouldNotPropagateExceptionsWhenSessionCreationFails() {
    Node local = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
        .add(caps, new TestSessionFactory((id, c) -> {
          throw new SessionNotCreatedException("eeek");
        }))
        .build();

    Either<WebDriverException, CreateSessionResponse> response =
      local.newSession(createSessionRequest(caps));

    assertThatEither(response).isLeft();
  }

  @Test
  public void eachSessionShouldReportTheNodesUrl() throws URISyntaxException {
    URI sessionUri = new URI("http://cheese:42/peas");
    Node node = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
        .add(caps, new TestSessionFactory((id, c) -> new Session(id, sessionUri, stereotype, c, Instant.now())))
        .build();

    Either<WebDriverException, CreateSessionResponse> response =
      node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();

    assertThat(session).isNotNull();
    assertThat(session.getUri()).isEqualTo(uri);
  }

  @Test
  public void quittingASessionShouldCauseASessionClosedEventToBeFired() {
    AtomicReference<Object> obj = new AtomicReference<>();
    bus.addListener(SessionClosedEvent.listener(obj::set));

    Either<WebDriverException, CreateSessionResponse> response =
      node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    node.stop(session.getId());

    // Because we're using the event bus, we can't expect the event to fire instantly. We're using
    // an inproc bus, so in reality it's reasonable to expect the event to fire synchronously, but
    // let's play it safe.
    Wait<AtomicReference<Object>> wait = new FluentWait<>(obj).withTimeout(ofSeconds(2));
    wait.until(ref -> ref.get() != null);
  }

  @Test
  public void canReturnStatus() {
    Either<WebDriverException, CreateSessionResponse> response =
      node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();

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
    Either<WebDriverException, CreateSessionResponse> response =
      node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();

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

    Either<WebDriverException, CreateSessionResponse> sessionResponse = node.newSession(createSessionRequest(caps));
    assertThatEither(sessionResponse).isLeft();
  }

  @Test
  public void shouldNotShutdownDuringOngoingSessionsIfDraining() throws InterruptedException {
    Either<WebDriverException, CreateSessionResponse> firstResponse =
      node.newSession(createSessionRequest(caps));
    assertThatEither(firstResponse).isRight();
    Session firstSession = firstResponse.right().getSession();

    Either<WebDriverException, CreateSessionResponse> secondResponse =
      node.newSession(createSessionRequest(caps));
    assertThatEither(secondResponse).isRight();
    Session secondSession = secondResponse.right().getSession();

    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NodeDrainComplete.listener(ignored -> latch.countDown()));

    node.drain();
    assertThat(local.isDraining()).isTrue();
    assertThat(node.isDraining()).isTrue();

    Either<WebDriverException, CreateSessionResponse> thirdResponse = node.newSession(createSessionRequest(caps));
    assertThatEither(thirdResponse).isLeft();

    assertThat(firstSession).isNotNull();
    assertThat(secondSession).isNotNull();

    assertThat(local.getCurrentSessionCount()).isEqualTo(2);

    latch.await(1, SECONDS);

    assertThat(latch.getCount()).isEqualTo(1);
  }

  @Test
  public void shouldShutdownAfterSessionsCompleteIfDraining() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NodeDrainComplete.listener(ignored -> latch.countDown()));

    Either<WebDriverException, CreateSessionResponse> firstResponse =
      node.newSession(createSessionRequest(caps));
    assertThatEither(firstResponse).isRight();
    Session firstSession = firstResponse.right().getSession();

    Either<WebDriverException, CreateSessionResponse> secondResponse =
      node.newSession(createSessionRequest(caps));
    assertThatEither(secondResponse).isRight();
    Session secondSession = secondResponse.right().getSession();

    node.drain();

    node.stop(firstSession.getId());
    node.stop(secondSession.getId());

    latch.await(5, SECONDS);

    assertThat(latch.getCount()).isEqualTo(0);
  }

  @Test
  public void shouldAllowsWebDriverCommandsForOngoingSessionIfDraining() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(1);
    bus.addListener(NodeDrainComplete.listener(ignored -> latch.countDown()));

    Either<WebDriverException, CreateSessionResponse> sessionResponse =
      node.newSession(createSessionRequest(caps));
    assertThatEither(sessionResponse).isRight();
    Session session = sessionResponse.right().getSession();

    node.drain();

    SessionId sessionId = session.getId();
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
