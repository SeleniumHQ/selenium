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

package org.openqa.selenium.grid.router;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.HealthCheck;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;

class RouterTest {

  private Tracer tracer;
  private EventBus bus;
  private Distributor distributor;
  private Router router;
  private Secret registrationSecret;

  private static Map<String, Object> getStatus(Router router) {
    HttpResponse response = router.execute(new HttpRequest(GET, "/status"));
    Map<String, Object> status = Values.get(response, MAP_TYPE);
    assertNotNull(status);
    return status;
  }

  private static void waitUntilReady(Router router, Duration duration) {
    waitUntilStatus(router, duration, Boolean.TRUE);
  }

  private static void waitUntilNotReady(Router router, Duration duration) {
    waitUntilStatus(router, duration, Boolean.FALSE);
  }

  private static void waitUntilStatus(Router router, Duration duration, Boolean ready) {
    new FluentWait<>(router)
        .withTimeout(duration)
        .pollingEvery(Duration.ofMillis(100))
        .until(
            r -> {
              Map<String, Object> status = getStatus(router);
              return ready.equals(status.get("ready"));
            });
  }

  @BeforeEach
  public void setUp() {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();

    CombinedHandler handler = new CombinedHandler();
    HttpClient.Factory clientFactory = new PassthroughHttpClient.Factory(handler);

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    registrationSecret = new Secret("stinking bishop");

    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(2),
            registrationSecret,
            5);
    handler.addHandler(queue);

    distributor =
        new LocalDistributor(
            tracer,
            bus,
            clientFactory,
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofSeconds(1),
            false,
            Duration.ofSeconds(5),
            Runtime.getRuntime().availableProcessors(),
            new DefaultSlotMatcher());
    handler.addHandler(distributor);

    router = new Router(tracer, clientFactory, sessions, queue, distributor);
  }

  @Test
  void shouldListAnEmptyDistributorAsMeaningTheGridIsNotReady() {
    Map<String, Object> status = getStatus(router);
    assertFalse((Boolean) status.get("ready"));
  }

  @Test
  void addingANodeThatIsDownMeansTheGridIsNotReady() throws URISyntaxException {
    Capabilities capabilities = new ImmutableCapabilities("cheese", "amsterdam");
    URI uri = new URI("https://example.com");

    AtomicReference<Availability> isUp = new AtomicReference<>(UP);
    Node node = getNode(capabilities, uri, isUp);
    distributor.add(node);

    waitUntilReady(router, Duration.ofSeconds(5));
    isUp.set(DOWN);
    waitUntilNotReady(router, Duration.ofSeconds(5));

    Map<String, Object> status = getStatus(router);
    assertFalse((Boolean) status.get("ready"), status.toString());
  }

  @Test
  void aNodeThatIsUpAndHasSpareSessionsMeansTheGridIsReady() throws URISyntaxException {
    Capabilities capabilities = new ImmutableCapabilities("cheese", "peas");
    URI uri = new URI("https://example.com");

    Node node = getNode(capabilities, uri, new AtomicReference<>(UP));
    distributor.add(node);

    waitUntilReady(router, Duration.ofSeconds(5));
  }

  @Test
  void shouldListAllNodesTheDistributorIsAwareOf() throws URISyntaxException {
    Capabilities chromeCapabilities = new ImmutableCapabilities("browser", "chrome");
    Capabilities firefoxCapabilities = new ImmutableCapabilities("browser", "firefox");
    URI firstNodeUri = new URI("https://example1.com");
    URI secondNodeUri = new URI("https://example2.com");

    AtomicReference<Availability> isUp = new AtomicReference<>(UP);

    Node firstNode =
        LocalNode.builder(tracer, bus, firstNodeUri, firstNodeUri, registrationSecret)
            .add(
                chromeCapabilities,
                new TestSessionFactory(
                    (id, caps) ->
                        new Session(
                            id, firstNodeUri, new ImmutableCapabilities(), caps, Instant.now())))
            .advanced()
            .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
            .build();

    Node secondNode =
        LocalNode.builder(tracer, bus, secondNodeUri, secondNodeUri, registrationSecret)
            .add(
                firefoxCapabilities,
                new TestSessionFactory(
                    (id, caps) ->
                        new Session(
                            id, secondNodeUri, new ImmutableCapabilities(), caps, Instant.now())))
            .advanced()
            .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
            .build();

    distributor.add(firstNode);
    distributor.add(secondNode);

    waitUntilReady(router, Duration.ofSeconds(5));

    Map<String, Object> status = getStatus(router);
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> nodes = (List<Map<String, Object>>) status.get("nodes");

    assertEquals(2, nodes.size());

    String firstNodeId = (String) nodes.get(0).get("id");
    String secondNodeId = (String) nodes.get(1).get("id");

    assertNotEquals(firstNodeId, secondNodeId);
  }

  @Test
  void ifNodesHaveSpareSlotsButAlreadyHaveMaxSessionsGridIsNotReady() throws URISyntaxException {
    Capabilities chromeCapabilities = new ImmutableCapabilities("browser", "chrome");
    Capabilities firefoxCapabilities = new ImmutableCapabilities("browser", "firefox");
    URI uri = new URI("https://example.com");

    AtomicReference<Availability> isUp = new AtomicReference<>(UP);

    Node node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                chromeCapabilities,
                new TestSessionFactory(
                    (id, caps) ->
                        new Session(id, uri, new ImmutableCapabilities(), caps, Instant.now())))
            .add(
                firefoxCapabilities,
                new TestSessionFactory(
                    (id, caps) ->
                        new Session(id, uri, new ImmutableCapabilities(), caps, Instant.now())))
            .maximumConcurrentSessions(1)
            .advanced()
            .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
            .build();
    distributor.add(node);

    waitUntilReady(router, Duration.ofSeconds(5));

    Map<String, Object> status = getStatus(router);
    assertTrue((Boolean) status.get("ready"), status.toString());

    SessionRequest sessionRequest =
        new SessionRequest(
            new RequestId(UUID.randomUUID()),
            Instant.now(),
            ImmutableSet.of(W3C),
            ImmutableSet.of(chromeCapabilities),
            ImmutableMap.of(),
            ImmutableMap.of());

    Either<SessionNotCreatedException, CreateSessionResponse> response =
        distributor.newSession(sessionRequest);

    assertTrue(response.isRight());
    Session session = response.right().getSession();
    assertThat(session).isNotNull();

    waitUntilNotReady(router, Duration.ofSeconds(5));
  }

  private Node getNode(
      Capabilities capabilities, URI uri, AtomicReference<Availability> availability) {
    return LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
        .add(
            capabilities,
            new TestSessionFactory(
                (id, caps) ->
                    new Session(id, uri, new ImmutableCapabilities(), caps, Instant.now())))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(availability.get(), "TL;DR"))
        .build();
  }
}
