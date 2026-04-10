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

package org.openqa.selenium.grid.node.local;

import static java.lang.System.currentTimeMillis;
import static java.util.Collections.emptyMap;
import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchSessionException;
import org.openqa.selenium.RetrySessionRequestException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.NodeStatus;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.testing.EitherAssert;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.HttpSessionId;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

class LocalNodeTest {

  private LocalNode node;
  private Session session;
  private Secret registrationSecret;

  private static <A, B> EitherAssert<A, B> assertThatEither(Either<A, B> either) {
    return new EitherAssert<>(either);
  }

  @BeforeEach
  public void setUp() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI uri = new URI("http://localhost:1234");
    Capabilities stereotype = new ImmutableCapabilities("cheese", "brie");
    registrationSecret = new Secret("red leicester");
    node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                stereotype,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())))
            .build();

    Either<WebDriverException, CreateSessionResponse> response =
        node.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));

    if (response.isRight()) {
      CreateSessionResponse sessionResponse = response.right();
      session = sessionResponse.getSession();
    } else {
      throw new AssertionError("Unable to create session" + response.left().getMessage());
    }
  }

  @Test
  void shouldThrowIfSessionIsNotPresent() {
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(new SessionId("12345")));
  }

  @Test
  void canRetrieveActiveSessionById() {
    assertThat(node.getSession(session.getId())).isEqualTo(session);
  }

  @Test
  void isOwnerOfAnActiveSession() {
    assertThat(node.isSessionOwner(session.getId())).isTrue();
  }

  @Test
  void canStopASession() {
    SessionId sessionId = session.getId();
    assertThat(node.getSession(sessionId)).isNotNull();

    node.stop(sessionId);

    waitUntilNodeStopped(sessionId);
    assertThatExceptionOfType(NoSuchSessionException.class)
        .isThrownBy(() -> node.getSession(sessionId));
  }

  @Test
  void isNotOwnerOfAStoppedSession() {
    node.stop(session.getId());

    waitUntilNodeStopped(session.getId());
    assertThat(node.isSessionOwner(session.getId())).isFalse();
  }

  @Test
  void cannotAcceptNewSessionsWhileDraining() {
    node.drain();
    assertThat(node.isDraining()).isTrue();

    node.stop(session.getId()); // stop the default session
    waitUntilNodeStopped(session.getId());

    Capabilities stereotype = new ImmutableCapabilities("cheese", "brie");
    Either<WebDriverException, CreateSessionResponse> sessionResponse =
        node.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
    assertThatEither(sessionResponse).isLeft();
    assertThat(sessionResponse.left()).isInstanceOf(RetrySessionRequestException.class);
  }

  @Test
  void cannotCreateNewSessionsOnMaxSessionCount() {
    Capabilities stereotype = new ImmutableCapabilities("cheese", "brie");
    Either<WebDriverException, CreateSessionResponse> sessionResponse =
        node.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));

    assertThatEither(sessionResponse).isLeft();
    assertThat(sessionResponse.left()).isInstanceOf(RetrySessionRequestException.class);
  }

  @Test
  void canReturnStatusInfo() {
    SessionId sessionId = session.getId();
    assertThat(findSession(sessionId)).isNotEmpty();

    node.stop(sessionId);
    waitUntilNodeStopped(sessionId);

    assertThat(findSession(sessionId)).isEmpty();
  }

  @Test
  void nodeStatusInfoIsImmutable() {
    SessionId sessionId = session.getId();
    NodeStatus status = node.getStatus();
    assertThat(findSession(status, sessionId)).isNotEmpty();

    node.stop(sessionId);
    waitUntilNodeStopped(sessionId);

    assertThat(findSession(status, sessionId)).isNotEmpty();
  }

  @Test
  void shouldBeAbleToCreateSessionsConcurrently() throws Exception {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI uri = new URI("http://localhost:1234");
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");

    class VerifyingHandler extends Session implements HttpHandler {
      private VerifyingHandler(SessionId id, Capabilities capabilities) {
        super(id, uri, new ImmutableCapabilities(), capabilities, Instant.now());
      }

      @Override
      public HttpResponse execute(HttpRequest req) {
        Optional<SessionId> id = HttpSessionId.getSessionId(req.getUri()).map(SessionId::new);
        assertThat(id).contains(getId());
        return new HttpResponse();
      }
    }

    Node node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(caps, new TestSessionFactory(VerifyingHandler::new))
            .add(caps, new TestSessionFactory(VerifyingHandler::new))
            .add(caps, new TestSessionFactory(VerifyingHandler::new))
            .maximumConcurrentSessions(3)
            .build();

    List<Callable<SessionId>> callables = new ArrayList<>();
    for (int i = 0; i < 3; i++) {
      callables.add(
          () -> {
            Either<WebDriverException, CreateSessionResponse> response =
                node.newSession(new CreateSessionRequest(Set.of(W3C), caps, emptyMap()));
            if (response.isRight()) {
              CreateSessionResponse res = response.right();
              assertThat(res.getSession().getCapabilities().getBrowserName()).isEqualTo("cheese");
              return res.getSession().getId();
            } else {
              throw new AssertionError("Unable to create session" + response.left().getMessage());
            }
          });
    }

    List<Future<SessionId>> futures = Executors.newFixedThreadPool(3).invokeAll(callables);

    for (Future<SessionId> future : futures) {
      SessionId id = future.get(2, SECONDS);

      // Now send a random command.
      HttpResponse res = node.execute(new HttpRequest(GET, String.format("/session/%s/url", id)));
      assertThat(res.isSuccessful()).isTrue();
    }
  }

  @Test
  void nodeDrainsAfterSessionCountIsReached() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI uri = new URI("http://localhost:5678");
    Capabilities stereotype = new ImmutableCapabilities("browserName", "bread");

    LocalNode.Builder builder =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .maximumConcurrentSessions(10)
            .drainAfterSessionCount(5);
    for (int i = 0; i < 5; i++) {
      builder.add(
          stereotype,
          new TestSessionFactory(
              (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())));
    }
    LocalNode localNode = builder.build();

    assertThat(localNode.isDraining()).isFalse();

    for (int i = 0; i < 5; i++) {
      Either<WebDriverException, CreateSessionResponse> response =
          localNode.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
      assertThat(response.isRight()).isTrue();
    }

    assertThat(localNode.isDraining()).isTrue();
  }

  @Test
  void seVncCdpUrlCapabilityWhenGridUrlWithSubPath() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    String gridUrl = "http://localhost:7890/subPath";
    URI uri = new URI(gridUrl);
    Capabilities stereotype =
        new ImmutableCapabilities(
            "se:vncLocalAddress", "ws://localhost:7900",
            "se:cdp", "ws://localhost:9222/devtools/browser/1a2b3c4d5e6f");

    LocalNode.Builder builder =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .enableCdp(true)
            .add(
                stereotype,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())));
    LocalNode localNode = builder.build();

    Either<WebDriverException, CreateSessionResponse> response =
        localNode.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
    assertThat(response.isRight()).isTrue();

    CreateSessionResponse sessionResponse = response.right();
    Capabilities capabilities = sessionResponse.getSession().getCapabilities();
    Object seVnc = capabilities.getCapability("se:vnc");
    assertThat(seVnc).isNotNull();
    assertThat(seVnc.toString().contains(gridUrl.replace("http", "ws"))).isTrue();

    Object seCdp = capabilities.getCapability("se:cdp");
    assertThat(seCdp).isNotNull();
    assertThat(seCdp.toString().contains(gridUrl.replace("http", "ws"))).isTrue();
  }

  @Test
  void seVncCdpUrlCapabilityWhenGridUrlWithTrailingSlash() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI uri = new URI("https://my.domain.com/");
    Capabilities stereotype =
        new ImmutableCapabilities(
            "se:vncLocalAddress", "ws://localhost:7900",
            "se:cdp", "ws://localhost:9222/devtools/browser/1a2b3c4d5e6f");

    LocalNode.Builder builder =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .enableCdp(true)
            .add(
                stereotype,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())));
    LocalNode localNode = builder.build();

    Either<WebDriverException, CreateSessionResponse> response =
        localNode.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
    assertThat(response.isRight()).isTrue();

    CreateSessionResponse sessionResponse = response.right();
    Capabilities capabilities = sessionResponse.getSession().getCapabilities();
    Object seVnc = capabilities.getCapability("se:vnc");
    assertThat(seVnc).isNotNull();
    assertThat(seVnc.toString().contains("wss://my.domain.com/session")).isTrue();

    Object seCdp = capabilities.getCapability("se:cdp");
    assertThat(seCdp).isNotNull();
    assertThat(seCdp.toString().contains("wss://my.domain.com/session")).isTrue();
  }

  @Test
  void responseCapsShowContainerName() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();

    String gridUrl = "http://localhost:7890/subPath";
    URI uri = new URI(gridUrl);
    Capabilities stereotype = new ImmutableCapabilities("se:containerName", "container-1");

    LocalNode.Builder builder =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                stereotype,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())));
    LocalNode localNode = builder.build();

    Either<WebDriverException, CreateSessionResponse> response =
        localNode.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
    assertThat(response.isRight()).isTrue();

    CreateSessionResponse sessionResponse = response.right();
    Capabilities capabilities = sessionResponse.getSession().getCapabilities();
    Object seContainerName = capabilities.getCapability("se:containerName");
    assertThat(seContainerName).isNotNull();
    assertThat(seContainerName).isEqualTo("container-1");
  }

  @Test
  void cdpIsDisabledAndResponseCapsShowThat() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI uri = new URI("http://localhost:7890");
    Capabilities stereotype = new ImmutableCapabilities("browserName", "cheese");

    LocalNode.Builder builder =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .enableCdp(false)
            .add(
                stereotype,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())));
    LocalNode localNode = builder.build();

    Either<WebDriverException, CreateSessionResponse> response =
        localNode.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
    assertThat(response.isRight()).isTrue();

    CreateSessionResponse sessionResponse = response.right();
    Capabilities capabilities = sessionResponse.getSession().getCapabilities();
    Object cdpEnabled = capabilities.getCapability("se:cdpEnabled");
    assertThat(cdpEnabled).isNotNull();
    assertThat(Boolean.parseBoolean(cdpEnabled.toString())).isFalse();
  }

  @Test
  void bidiIsDisabledAndResponseCapsShowThat() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI uri = new URI("http://localhost:7890");
    Capabilities stereotype = new ImmutableCapabilities("browserName", "cheese");

    LocalNode.Builder builder =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .enableBiDi(false)
            .add(
                stereotype,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())));
    LocalNode localNode = builder.build();

    Either<WebDriverException, CreateSessionResponse> response =
        localNode.newSession(new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
    assertThat(response.isRight()).isTrue();

    CreateSessionResponse sessionResponse = response.right();
    Capabilities capabilities = sessionResponse.getSession().getCapabilities();
    Object bidiEnabled = capabilities.getCapability("se:bidiEnabled");
    assertThat(bidiEnabled).isNotNull();
    assertThat(Boolean.parseBoolean(bidiEnabled.toString())).isFalse();
  }

  @Test
  void extractsFileNameFromRequestUri() {
    assertThat(node.extractFileName("/session/1234/se/files/logo.png")).isEqualTo("logo.png");
    assertThat(node.extractFileName("/session/1234/se/files/файл+with+tähtedega.png"))
        .isEqualTo("файл+with+tähtedega.png");
  }

  @Test
  void commandInterceptorIsCalledForEachWebDriverCommand() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI uri = new URI("http://localhost:1234");
    Capabilities stereotype = new ImmutableCapabilities("cheese", "brie");
    List<String> interceptedCommands = new ArrayList<>();

    LocalNode nodeWithInterceptor =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                stereotype,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())))
            .addInterceptor(
                new org.openqa.selenium.grid.node.NodeCommandInterceptor() {
                  @Override
                  public boolean isEnabled(org.openqa.selenium.grid.config.Config config) {
                    return true;
                  }

                  @Override
                  public void initialize(
                      org.openqa.selenium.grid.config.Config config, EventBus bus) {}

                  @Override
                  public HttpResponse intercept(
                      SessionId id, HttpRequest req, Callable<HttpResponse> next) throws Exception {
                    interceptedCommands.add(req.getMethod() + " " + req.getUri());
                    return next.call();
                  }
                })
            .build();

    Either<WebDriverException, CreateSessionResponse> response =
        nodeWithInterceptor.newSession(
            new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
    assertThat(response.isRight()).isTrue();

    SessionId sessionId = response.right().getSession().getId();
    nodeWithInterceptor.executeWebDriverCommand(
        new HttpRequest(GET, "/session/" + sessionId + "/title"));

    assertThat(interceptedCommands).hasSize(1);
    assertThat(interceptedCommands.get(0)).contains("/title");
  }

  @Test
  void multipleInterceptorsAreChainedOuterToInner() throws URISyntaxException {
    Tracer tracer = DefaultTestTracer.createTracer();
    EventBus bus = new GuavaEventBus();
    URI uri = new URI("http://localhost:1234");
    Capabilities stereotype = new ImmutableCapabilities("cheese", "brie");
    List<String> callOrder = new ArrayList<>();

    org.openqa.selenium.grid.node.NodeCommandInterceptor outer =
        new org.openqa.selenium.grid.node.NodeCommandInterceptor() {
          @Override
          public boolean isEnabled(org.openqa.selenium.grid.config.Config config) {
            return true;
          }

          @Override
          public void initialize(org.openqa.selenium.grid.config.Config config, EventBus bus) {}

          @Override
          public HttpResponse intercept(SessionId id, HttpRequest req, Callable<HttpResponse> next)
              throws Exception {
            callOrder.add("outer-before");
            HttpResponse resp = next.call();
            callOrder.add("outer-after");
            return resp;
          }
        };

    org.openqa.selenium.grid.node.NodeCommandInterceptor inner =
        new org.openqa.selenium.grid.node.NodeCommandInterceptor() {
          @Override
          public boolean isEnabled(org.openqa.selenium.grid.config.Config config) {
            return true;
          }

          @Override
          public void initialize(org.openqa.selenium.grid.config.Config config, EventBus bus) {}

          @Override
          public HttpResponse intercept(SessionId id, HttpRequest req, Callable<HttpResponse> next)
              throws Exception {
            callOrder.add("inner-before");
            HttpResponse resp = next.call();
            callOrder.add("inner-after");
            return resp;
          }
        };

    LocalNode nodeWithInterceptors =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                stereotype,
                new TestSessionFactory(
                    (id, caps) -> new Session(id, uri, stereotype, caps, Instant.now())))
            .addInterceptor(outer)
            .addInterceptor(inner)
            .build();

    Either<WebDriverException, CreateSessionResponse> response =
        nodeWithInterceptors.newSession(
            new CreateSessionRequest(Set.of(W3C), stereotype, emptyMap()));
    assertThat(response.isRight()).isTrue();
    SessionId sessionId = response.right().getSession().getId();

    nodeWithInterceptors.executeWebDriverCommand(
        new HttpRequest(GET, "/session/" + sessionId + "/title"));

    assertThat(callOrder)
        .containsExactly("outer-before", "inner-before", "inner-after", "outer-after");
  }

  private void waitUntilNodeStopped(SessionId sessionId) {
    long timeout = Duration.ofSeconds(5).toMillis();

    for (long start = currentTimeMillis(); currentTimeMillis() - start < timeout; ) {
      if (findSession(sessionId).isEmpty()) {
        break;
      }
    }
  }

  private Optional<Session> findSession(SessionId sessionId) {
    NodeStatus status = node.getStatus();
    return findSession(status, sessionId);
  }

  private Optional<Session> findSession(NodeStatus status, SessionId sessionId) {
    return status.getSlots().stream()
        .map(Slot::getSession)
        .filter(Objects::nonNull)
        .filter(s -> s.getId().equals(sessionId))
        .findAny();
  }
}
