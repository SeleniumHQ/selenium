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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import java.util.function.Function;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;
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
import org.openqa.selenium.grid.node.local.LocalNode.Builder;
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

class NodeTest {

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

  @BeforeEach
  public void setUp(TestInfo testInfo) throws URISyntaxException {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();

    registrationSecret = new Secret("sussex charmer");
    boolean isDownloadsTestCase = testInfo.getDisplayName().equalsIgnoreCase("DownloadsTestCase");

    stereotype = new ImmutableCapabilities("browserName", "cheese");
    caps = new ImmutableCapabilities("browserName", "cheese");
    if (isDownloadsTestCase) {
      stereotype = new ImmutableCapabilities("browserName", "chrome", "se:downloadsEnabled", true);
      caps = new ImmutableCapabilities("browserName", "chrome", "se:downloadsEnabled", true);
    }

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

    Builder builder =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
            .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
            .add(caps, new TestSessionFactory((id, c) -> new Handler(c)))
            .maximumConcurrentSessions(2);
    if (isDownloadsTestCase) {
      builder = builder.enableManagedDownloads(true).sessionTimeout(Duration.ofSeconds(1));
    }
    local = builder.build();

    node =
        new RemoteNode(
            tracer,
            new PassthroughHttpClient.Factory(local),
            new NodeId(UUID.randomUUID()),
            uri,
            registrationSecret,
            ImmutableSet.of(caps));
  }

  @Test
  void shouldRefuseToCreateASessionIfNoFactoriesAttached() {
    Node local = LocalNode.builder(tracer, bus, uri, uri, registrationSecret).build();
    HttpClient.Factory clientFactory = new PassthroughHttpClient.Factory(local);
    Node node =
        new RemoteNode(
            tracer,
            clientFactory,
            new NodeId(UUID.randomUUID()),
            uri,
            registrationSecret,
            ImmutableSet.of());

    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));

    assertThatEither(response).isLeft();
  }

  @Test
  void shouldCreateASessionIfTheCorrectCapabilitiesArePassedToIt() {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();

    CreateSessionResponse sessionResponse = response.right();
    assertThat(sessionResponse.getSession()).isNotNull();
  }

  @Test
  void shouldRetryIfNoMatchingSlotIsAvailable() {
    Node local =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new SessionFactory() {
                  @Override
                  public Capabilities getStereotype() {
                    return null;
                  }

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
    Node node =
        new RemoteNode(
            tracer,
            clientFactory,
            new NodeId(UUID.randomUUID()),
            uri,
            registrationSecret,
            ImmutableSet.of(caps));

    ImmutableCapabilities wrongCaps = new ImmutableCapabilities("browserName", "burger");
    Either<WebDriverException, CreateSessionResponse> sessionResponse =
        node.newSession(createSessionRequest(wrongCaps));

    assertThatEither(sessionResponse).isLeft();
    assertThat(sessionResponse.left()).isInstanceOf(RetrySessionRequestException.class);
  }

  @Test
  void shouldOnlyCreateAsManySessionsAsFactories() {
    Node node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, uri, stereotype, c, Instant.now())))
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
  void willRefuseToCreateMoreSessionsThanTheMaxSessionCount() {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();

    response = node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();

    response = node.newSession(createSessionRequest(caps));
    assertThatEither(response).isLeft();
  }

  @Test
  void stoppingASessionReducesTheNumberOfCurrentlyActiveSessions() {
    assertThat(local.getCurrentSessionCount()).isZero();

    Either<WebDriverException, CreateSessionResponse> response =
        local.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();

    assertThat(local.getCurrentSessionCount()).isEqualTo(1);

    local.stop(session.getId());

    assertThat(local.getCurrentSessionCount()).isZero();
  }

  @Test
  void sessionsThatAreStoppedWillNotBeReturned() {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session expected = response.right().getSession();

    node.stop(expected.getId());

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> local.getSession(expected.getId()));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(expected.getId()));
  }

  @Test
  void stoppingASessionThatDoesNotExistWillThrowAnException() {
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> local.stop(new SessionId(UUID.randomUUID())));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.stop(new SessionId(UUID.randomUUID())));
  }

  @Test
  void attemptingToGetASessionThatDoesNotExistWillCauseAnExceptionToBeThrown() {
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> local.getSession(new SessionId(UUID.randomUUID())));

    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(new SessionId(UUID.randomUUID())));
  }

  @Test
  void willRespondToWebDriverCommandsSentToOwnedSessions() {
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

    Node local =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(caps, new TestSessionFactory((id, c) -> new Recording()))
            .build();
    Node remote =
        new RemoteNode(
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
  void shouldOnlyRespondToWebDriverCommandsForSessionsTheNodeOwns() {
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
  void aSessionThatTimesOutWillBeStoppedAndRemovedFromTheSessionMap() {
    AtomicReference<Instant> now = new AtomicReference<>(Instant.now());

    Clock clock = new MyClock(now);
    Node node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, uri, stereotype, c, Instant.now())))
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
  void shouldNotPropagateExceptionsWhenSessionCreationFails() {
    Node local =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> {
                      throw new SessionNotCreatedException("eeek");
                    }))
            .build();

    Either<WebDriverException, CreateSessionResponse> response =
        local.newSession(createSessionRequest(caps));

    assertThatEither(response).isLeft();
  }

  @Test
  void eachSessionShouldReportTheNodesUrl() throws URISyntaxException {
    URI sessionUri = new URI("http://cheese:42/peas");
    Node node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                caps,
                new TestSessionFactory(
                    (id, c) -> new Session(id, sessionUri, stereotype, c, Instant.now())))
            .build();

    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();

    assertThat(session).isNotNull();
    assertThat(session.getUri()).isEqualTo(uri);
  }

  @Test
  void quittingASessionShouldCauseASessionClosedEventToBeFired() {
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
  void canReturnStatus() {
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
  void returns404ForAnUnknownCommand() {
    HttpRequest req = new HttpRequest(GET, "/foo");
    HttpResponse res = node.execute(req);
    assertThat(res.getStatus()).isEqualTo(404);
    Map<String, Object> content = new Json().toType(string(res), MAP_TYPE);
    assertThat(content)
        .containsOnlyKeys("value")
        .extracting("value")
        .asInstanceOf(MAP)
        .containsEntry("error", "unknown command")
        .containsEntry("message", "Unable to find handler for (GET) /foo");
  }

  @Test
  void canUploadAFile() throws IOException {
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

    File baseDir = getTemporaryFilesystemBaseDir(local.getUploadsFilesystem(session.getId()));
    assertThat(baseDir.listFiles()).hasSize(1);
    File uploadDir = baseDir.listFiles()[0];
    assertThat(uploadDir.listFiles()).hasSize(1);
    assertThat(new String(Files.readAllBytes(uploadDir.listFiles()[0].toPath()))).isEqualTo(hello);

    node.stop(session.getId());
    assertThat(baseDir).doesNotExist();
  }

  @Test
  @DisplayName("DownloadsTestCase")
  void canDownloadAFile() throws IOException {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    String hello = "Hello, world!";

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/se/files", session.getId()));

    // Let's simulate as if we downloaded a file via a test case
    String zip = simulateFileDownload(session.getId(), hello);

    String payload = new Json().toJson(Collections.singletonMap("name", zip));
    req.setContent(() -> new ByteArrayInputStream(payload.getBytes()));
    HttpResponse rsp = node.execute(req);
    Map<String, Object> raw = new Json().toType(string(rsp), Json.MAP_TYPE);
    try {
      assertThat(raw).isNotNull();
      File baseDir = getTemporaryFilesystemBaseDir(TemporaryFilesystem.getDefaultTmpFS());
      Map<String, Object> map =
          Optional.ofNullable(raw.get("value"))
              .map(data -> (Map<String, Object>) data)
              .orElseThrow(() -> new IllegalStateException("Could not find value attribute"));
      String encodedContents = map.get("contents").toString();
      Zip.unzip(encodedContents, baseDir);
      Path path = new File(baseDir.getAbsolutePath() + "/" + map.get("filename")).toPath();
      String decodedContents = String.join("", Files.readAllLines(path));
      assertThat(decodedContents).isEqualTo(hello);
    } finally {
      node.stop(session.getId());
    }
  }

  @Test
  @DisplayName("DownloadsTestCase")
  void canDownloadMultipleFile() throws IOException {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    String hello = "Hello, world!";

    HttpRequest req = new HttpRequest(POST, String.format("/session/%s/se/files", session.getId()));

    // Let's simulate as if we downloaded a file via a test case
    String zip = simulateFileDownload(session.getId(), hello);

    // This file we are going to leave in the downloads directory of the session
    // Just to check if we can clean up all the files for the session
    simulateFileDownload(session.getId(), "Goodbye, world!");

    String payload = new Json().toJson(Collections.singletonMap("name", zip));
    req.setContent(() -> new ByteArrayInputStream(payload.getBytes()));
    HttpResponse rsp = node.execute(req);
    Map<String, Object> raw = new Json().toType(string(rsp), Json.MAP_TYPE);
    try {
      assertThat(raw).isNotNull();
      File baseDir = getTemporaryFilesystemBaseDir(TemporaryFilesystem.getDefaultTmpFS());
      Map<String, Object> map =
          Optional.ofNullable(raw.get("value"))
              .map(data -> (Map<String, Object>) data)
              .orElseThrow(() -> new IllegalStateException("Could not find value attribute"));
      String encodedContents = map.get("contents").toString();
      Zip.unzip(encodedContents, baseDir);
      Path path = new File(baseDir.getAbsolutePath() + "/" + map.get("filename")).toPath();
      String decodedContents = String.join("", Files.readAllLines(path));
      assertThat(decodedContents).isEqualTo(hello);
    } finally {
      UUID downloadsId = local.getDownloadsIdForSession(session.getId());
      File someDir = getTemporaryFilesystemBaseDir(local.getDownloadsFilesystem(downloadsId));
      node.stop(session.getId());
      assertThat(someDir).doesNotExist();
    }
  }

  @Test
  @DisplayName("DownloadsTestCase")
  void canListFilesToDownload() throws IOException {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    String hello = "Hello, world!";
    String zip = simulateFileDownload(session.getId(), hello);
    HttpRequest req = new HttpRequest(GET, String.format("/session/%s/se/files", session.getId()));
    HttpResponse rsp = node.execute(req);
    Map<String, Object> raw = new Json().toType(string(rsp), Json.MAP_TYPE);
    try {
      assertThat(raw).isNotNull();
      Map<String, Object> map =
          Optional.ofNullable(raw.get("value"))
              .map(data -> (Map<String, Object>) data)
              .orElseThrow(() -> new IllegalStateException("Could not find value attribute"));
      List<String> files = (List<String>) map.get("names");
      assertThat(files).contains(zip);
    } finally {
      node.stop(session.getId());
    }
  }

  @Test
  @DisplayName("DownloadsTestCase")
  void ensureImmunityToSessionTimeOutsForFileDownloads() throws InterruptedException {
    Consumer<HttpResponse> DOWNLOAD_RSP_VALIDATOR =
        response -> {
          Map<String, Object> map = new Json().toType(string(response), Json.MAP_TYPE);
          assertThat(map).isNotNull();
          List<String> files =
              Optional.ofNullable(map.get("value"))
                  .map(data -> (Map<String, Object>) data)
                  .map(data -> (List<String>) data.get("names"))
                  .orElseThrow(() -> new IllegalStateException("Could not find value attribute"));
          assertThat(files).isEmpty();
        };

    Function<Session, HttpResponse> TRIGGER_LIST_FILES =
        session -> {
          HttpRequest req =
              new HttpRequest(GET, String.format("/session/%s/se/files", session.getId()));
          HttpResponse response = node.execute(req);
          assertThat(response.getStatus()).isEqualTo(200);
          return response;
        };

    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    try {
      HttpResponse rsp = TRIGGER_LIST_FILES.apply(session);
      // Totally we will try list files 3 times, each with a gap of 900 ms.
      // The session timeout is defined as 1 second. So we try and ensure that
      // even after trying to download 3 times, we don't hit any errors.
      for (int i = 0; i < 3; i++) {
        DOWNLOAD_RSP_VALIDATOR.accept(rsp);
        node.isSessionOwner(session.getId()); // Keep session active so that we dont timeout
        TimeUnit.MILLISECONDS.sleep(700);
      }
    } finally {
      node.stop(session.getId());
    }
  }

  @Test
  void canDownloadFileThrowsErrorMsgWhenDownloadsDirNotSpecified() {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    try {
      createTmpFile("Hello, world!");
      HttpRequest req =
          new HttpRequest(POST, String.format("/session/%s/se/files", session.getId()));
      String msg =
          "Please enable management of downloads via the command line arg "
              + "[--enable-managed-downloads] and restart the node";
      assertThatThrownBy(() -> node.execute(req)).hasMessageContaining(msg);
    } finally {
      node.stop(session.getId());
    }
  }

  @Test
  @DisplayName("DownloadsTestCase")
  void canDownloadFileThrowsErrorMsgWhenPayloadIsMissing() {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    try {
      createTmpFile("Hello, world!");

      HttpRequest req =
          new HttpRequest(POST, String.format("/session/%s/se/files", session.getId()));
      String msg = "Please specify file to download in payload as {\"name\": \"fileToDownload\"}";
      assertThatThrownBy(() -> node.execute(req)).hasMessageContaining(msg);
    } finally {
      node.stop(session.getId());
    }
  }

  @Test
  @DisplayName("DownloadsTestCase")
  void canDownloadFileThrowsErrorMsgWhenWrongPayloadIsGiven() {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    try {
      createTmpFile("Hello, world!");

      HttpRequest req =
          new HttpRequest(POST, String.format("/session/%s/se/files", session.getId()));
      String payload = new Json().toJson(Collections.singletonMap("my-file", "README.md"));
      req.setContent(() -> new ByteArrayInputStream(payload.getBytes()));

      String msg = "Please specify file to download in payload as {\"name\": \"fileToDownload\"}";
      assertThatThrownBy(() -> node.execute(req)).hasMessageContaining(msg);
    } finally {
      node.stop(session.getId());
    }
  }

  @Test
  @DisplayName("DownloadsTestCase")
  void canDownloadFileThrowsErrorMsgWhenFileNotFound() {
    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(createSessionRequest(caps));
    assertThatEither(response).isRight();
    Session session = response.right().getSession();
    try {
      createTmpFile("Hello, world!");

      HttpRequest req =
          new HttpRequest(POST, String.format("/session/%s/se/files", session.getId()));
      String payload = new Json().toJson(Collections.singletonMap("name", "README.md"));
      req.setContent(() -> new ByteArrayInputStream(payload.getBytes()));

      String msg = "Cannot find file [README.md] in directory";
      assertThatThrownBy(() -> node.execute(req)).hasMessageContaining(msg);
    } finally {
      node.stop(session.getId());
    }
  }

  @Test
  void shouldNotCreateSessionIfDraining() {
    node.drain();
    assertThat(local.isDraining()).isTrue();
    assertThat(node.isDraining()).isTrue();

    Either<WebDriverException, CreateSessionResponse> sessionResponse =
        node.newSession(createSessionRequest(caps));
    assertThatEither(sessionResponse).isLeft();
  }

  @Test
  void shouldNotShutdownDuringOngoingSessionsIfDraining() throws InterruptedException {
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

    Either<WebDriverException, CreateSessionResponse> thirdResponse =
        node.newSession(createSessionRequest(caps));
    assertThatEither(thirdResponse).isLeft();

    assertThat(firstSession).isNotNull();
    assertThat(secondSession).isNotNull();

    assertThat(local.getCurrentSessionCount()).isEqualTo(2);

    latch.await(1, SECONDS);

    assertThat(latch.getCount()).isEqualTo(1);
  }

  @Test
  void shouldShutdownAfterSessionsCompleteIfDraining() throws InterruptedException {
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

    assertThat(latch.getCount()).isZero();
  }

  @Test
  void shouldAllowsWebDriverCommandsForOngoingSessionIfDraining() throws InterruptedException {
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

  private File createFile(String content, File directory) {
    try {
      File f = new File(directory.getAbsolutePath(), UUID.randomUUID().toString());
      f.deleteOnExit();
      Files.write(directory.toPath(), content.getBytes(StandardCharsets.UTF_8));
      return f;
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
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
    return new CreateSessionRequest(ImmutableSet.copyOf(Dialect.values()), caps, ImmutableMap.of());
  }

  private String simulateFileDownload(SessionId id, String text) throws IOException {
    File zip = createTmpFile(text);
    UUID downloadsId = local.getDownloadsIdForSession(id);
    File someDir = getTemporaryFilesystemBaseDir(local.getDownloadsFilesystem(downloadsId));
    File downloadsDirectory = Optional.ofNullable(someDir.listFiles()).orElse(new File[] {})[0];
    File target = new File(downloadsDirectory, zip.getName());
    boolean renamed = zip.renameTo(target);
    if (!renamed) {
      throw new IllegalStateException(
          "Could not move "
              + zip.getName()
              + " to directory "
              + target.getParentFile().getAbsolutePath());
    }
    return zip.getName();
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
