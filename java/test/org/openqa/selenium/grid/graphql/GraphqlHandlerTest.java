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

package org.openqa.selenium.grid.graphql;

import com.google.common.collect.ImmutableMap;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.CreateSessionResponse;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.SessionRequest;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.internal.Either;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.Wait;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.Dialect.OSS;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class GraphqlHandlerTest {

  private static final Json JSON = new Json();
  private final Secret registrationSecret = new Secret("stilton");
  private final URI publicUri = new URI("http://example.com/grid-o-matic");
  private final String version = "4.0.0";
  private final Wait<Object> wait = new FluentWait<>(new Object()).withTimeout(Duration.ofSeconds(5));
  private Distributor distributor;
  private NewSessionQueue queue;
  private Tracer tracer;
  private EventBus bus;
  private ImmutableCapabilities caps;
  private ImmutableCapabilities stereotype;
  private SessionRequest sessionRequest;
  private SessionMap sessions;

  public GraphqlHandlerTest() throws URISyntaxException {
  }

  @BeforeEach
  public void setupGrid() {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

    sessions = new LocalSessionMap(tracer, bus);
    stereotype = new ImmutableCapabilities("browserName", "cheese");
    caps = new ImmutableCapabilities("browserName", "cheese");
    sessionRequest = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(OSS, W3C),
      Set.of(caps),
      Map.of(),
      Map.of());

    queue = new LocalNewSessionQueue(
      tracer,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);

    distributor = new LocalDistributor(
      tracer,
      bus,
      clientFactory,
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));
  }

  @Test
  public void shouldBeAbleToGetGridUri() {
    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);

    Map<String, Object> topLevel = executeQuery(handler, "{ grid { uri } }");

    assertThat(topLevel).isEqualTo(
      singletonMap(
        "data", singletonMap(
          "grid", singletonMap(
            "uri", publicUri.toString()))));
  }

  @Test
  public void shouldBeAbleToGetGridVersion() {
    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);

    Map<String, Object> topLevel = executeQuery(handler, "{ grid { version } }");

    assertThat(topLevel).isEqualTo(
      singletonMap(
        "data", singletonMap(
          "grid", singletonMap(
            "version", version))));
  }

  private void continueOnceAddedToQueue(SessionRequest request) {
    // Add to the queue in the background
    new Thread(() -> queue.addToQueue(request)).start();
    new FluentWait<>(request)
      .withTimeout(Duration.ofSeconds(5))
      .until(
        r -> queue.getQueueContents().stream()
          .anyMatch(sessionRequestCapability ->
                      sessionRequestCapability.getRequestId().equals(r.getRequestId())));
  }

  @Test
  public void shouldBeAbleToGetSessionQueueSize() {
    SessionRequest request = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(caps),
      Map.of(),
      Map.of());

    continueOnceAddedToQueue(request);
    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);

    Map<String, Object> topLevel = executeQuery(handler, "{ grid { sessionQueueSize } }");

    assertThat(topLevel).isEqualTo(
      singletonMap(
        "data", singletonMap(
          "grid", singletonMap(
            "sessionQueueSize", 1L))));
  }

  @Test
  public void shouldBeAbleToGetSessionQueueRequests() {
    SessionRequest request = new SessionRequest(
      new RequestId(UUID.randomUUID()),
      Instant.now(),
      Set.of(W3C),
      Set.of(caps),
      Map.of(),
      Map.of());

    continueOnceAddedToQueue(request);

    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);

    Map<String, Object> topLevel = executeQuery(handler,
      "{ sessionsInfo { sessionQueueRequests } }");

    assertThat(topLevel).isEqualTo(
      singletonMap(
        "data", singletonMap(
          "sessionsInfo", singletonMap(
            "sessionQueueRequests", singletonList(JSON.toJson(caps))))));
  }

  @Test
  public void shouldBeReturnAnEmptyListIfQueueIsEmpty() {
    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);

    Map<String, Object> topLevel = executeQuery(handler,
      "{ sessionsInfo { sessionQueueRequests } }");

    assertThat(topLevel).isEqualTo(
      singletonMap(
        "data", singletonMap(
          "sessionsInfo", singletonMap(
            "sessionQueueRequests", Collections.emptyList()))));
  }

  @Test
  public void shouldReturnAnEmptyListForNodesIfNoneAreRegistered() {
    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);

    Map<String, Object> topLevel = executeQuery(handler, "{ nodesInfo { nodes { uri } } }");

    assertThat(topLevel).describedAs(topLevel.toString()).isEqualTo(
      singletonMap(
        "data", singletonMap(
          "nodesInfo", singletonMap(
            "nodes", Collections.emptyList()))));
  }

  @Test
  public void shouldBeAbleToGetUrlsOfAllNodes() throws URISyntaxException {
    Capabilities stereotype = new ImmutableCapabilities("cheese", "stilton");
    String nodeUri = "http://localhost:5556";
    Node node = LocalNode.builder(tracer, bus, new URI(nodeUri), publicUri, registrationSecret)
      .add(stereotype, new SessionFactory() {
        @Override
        public Either<WebDriverException, ActiveSession> apply(
          CreateSessionRequest createSessionRequest) {
          return Either.left(new SessionNotCreatedException("Factory for testing"));
        }

        @Override
        public boolean test(Capabilities capabilities) {
          return false;
        }
      })
      .build();
    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);
    Map<String, Object> topLevel = executeQuery(handler, "{ nodesInfo { nodes { uri } } }");

    assertThat(topLevel).describedAs(topLevel.toString()).isEqualTo(
      singletonMap(
        "data", singletonMap(
          "nodesInfo", singletonMap(
            "nodes", singletonList(singletonMap("uri", nodeUri))))));
  }

  @Test
  public void shouldBeAbleToGetSessionCount() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, bus, nodeUri, publicUri, registrationSecret)
      .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
        id,
        nodeUri,
        stereotype,
        caps,
        Instant.now()))).build();

    distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    Either<SessionNotCreatedException, CreateSessionResponse> response = distributor.newSession(sessionRequest);
    if (response.isRight()) {
      Session session = response.right().getSession();

      assertThat(session).isNotNull();
      GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);
      Map<String, Object> topLevel = executeQuery(handler,
        "{ grid { sessionCount } }");

      assertThat(topLevel).isEqualTo(
        singletonMap(
          "data", singletonMap(
            "grid", singletonMap(
              "sessionCount", 1L ))));
    } else {
      fail("Session creation failed", response.left());
    }
  }

  @Test
  public void shouldBeAbleToGetSessionInfo() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, bus, nodeUri, publicUri, registrationSecret)
      .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
        id,
        nodeUri,
        stereotype,
        caps,
        Instant.now()))).build();

    distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    Either<SessionNotCreatedException, CreateSessionResponse> response = distributor.newSession(sessionRequest);
    if (response.isRight()) {
      Session session = response.right().getSession();

      assertThat(session).isNotNull();
      String sessionId = session.getId().toString();

      Set<Slot> slots = distributor.getStatus().getNodes().stream().findFirst().get().getSlots();

      Slot slot = slots.stream().findFirst().get();

      org.openqa.selenium.grid.graphql.Session graphqlSession =
        new org.openqa.selenium.grid.graphql.Session(
          sessionId,
          session.getCapabilities(),
          session.getStartTime(),
          session.getUri(),
          node.getId().toString(),
          node.getUri(),
          slot);
      String query = String.format(
        "{ session (id: \"%s\") { id, capabilities, startTime, uri } }", sessionId);

      GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);
      Map<String, Object> result = executeQuery(handler, query);

      assertThat(result).describedAs(result.toString()).isEqualTo(
        singletonMap(
          "data", singletonMap(
            "session", ImmutableMap.of(
              "id", sessionId,
              "capabilities", graphqlSession.getCapabilities(),
              "startTime", graphqlSession.getStartTime(),
              "uri", graphqlSession.getUri().toString()))));
    } else {
      fail("Session creation failed", response.left());
    }
  }

  @Test
  public void shouldBeAbleToGetNodeInfoForSession() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, bus, nodeUri, publicUri, registrationSecret)
      .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
        id,
        nodeUri,
        stereotype,
        caps,
        Instant.now()))).build();

    distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    Either<SessionNotCreatedException, CreateSessionResponse> response = distributor.newSession(sessionRequest);

    if (response.isRight()) {
      Session session = response.right().getSession();

      assertThat(session).isNotNull();
      String sessionId = session.getId().toString();

      Set<Slot> slots = distributor.getStatus().getNodes().stream().findFirst().get().getSlots();

      Slot slot = slots.stream().findFirst().get();

      org.openqa.selenium.grid.graphql.Session graphqlSession =
        new org.openqa.selenium.grid.graphql.Session(
          sessionId,
          session.getCapabilities(),
          session.getStartTime(),
          session.getUri(),
          node.getId().toString(),
          node.getUri(),
          slot);
      String query = String.format("{ session (id: \"%s\") { nodeId, nodeUri } }", sessionId);

      GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);
      Map<String, Object> result = executeQuery(handler, query);

      assertThat(result).describedAs(result.toString()).isEqualTo(
        singletonMap(
          "data", singletonMap(
            "session", ImmutableMap.of(
              "nodeId", graphqlSession.getNodeId(),
              "nodeUri", graphqlSession.getNodeUri().toString()))));
    } else {
      fail("Session creation failed", response.left());
    }
  }

  @Test
  public void shouldBeAbleToGetSlotInfoForSession() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, bus, nodeUri, publicUri, registrationSecret)
      .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
        id,
        nodeUri,
        stereotype,
        caps,
        Instant.now()))).build();

    distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    Either<SessionNotCreatedException, CreateSessionResponse> response = distributor.newSession(sessionRequest);

    if (response.isRight()) {
      Session session = response.right().getSession();

      assertThat(session).isNotNull();
      String sessionId = session.getId().toString();

      Set<Slot> slots = distributor.getStatus().getNodes().stream().findFirst().get().getSlots();

      Slot slot = slots.stream().findFirst().get();

      org.openqa.selenium.grid.graphql.Session graphqlSession =
        new org.openqa.selenium.grid.graphql.Session(
          sessionId,
          session.getCapabilities(),
          session.getStartTime(),
          session.getUri(),
          node.getId().toString(),
          node.getUri(),
          slot);

      org.openqa.selenium.grid.graphql.Slot graphqlSlot = graphqlSession.getSlot();

      String query = String.format(
        "{ session (id: \"%s\") { slot { id, stereotype, lastStarted } } }", sessionId);

      GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);
      Map<String, Object> result = executeQuery(handler, query);

      assertThat(result).describedAs(result.toString()).isEqualTo(
        singletonMap(
          "data", singletonMap(
            "session", singletonMap(
              "slot", ImmutableMap.of(
                "id", graphqlSlot.getId(),
                "stereotype", graphqlSlot.getStereotype(),
                "lastStarted", graphqlSlot.getLastStarted())))));
    } else {
      fail("Session creation failed", response.left());
    }
  }

  @Test
  public void shouldBeAbleToGetSessionDuration() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, bus, nodeUri, publicUri, registrationSecret)
      .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
        id,
        nodeUri,
        stereotype,
        caps,
        Instant.now()))).build();

    distributor = new LocalDistributor(
      tracer,
      bus,
      new PassthroughHttpClient.Factory(node),
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false,
      Duration.ofSeconds(5));

    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    Either<SessionNotCreatedException, CreateSessionResponse> response = distributor.newSession(sessionRequest);

    if (response.isRight()) {
      Session session = response.right().getSession();

      assertThat(session).isNotNull();
      String sessionId = session.getId().toString();

      String query = String.format("{ session (id: \"%s\") { sessionDurationMillis } }", sessionId);

      GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);
      Map<String, Object> result = executeQuery(handler, query);

      assertThat(result)
        .containsOnlyKeys("data")
        .extracting("data").asInstanceOf(MAP).containsOnlyKeys("session")
        .extracting("session").asInstanceOf(MAP).containsOnlyKeys("sessionDurationMillis");
    } else {
      fail("Session creation failed", response.left());
    }
  }

  @Test
  public void shouldThrowExceptionWhenSessionNotFound() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, bus, nodeUri, publicUri, registrationSecret)
      .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
        id,
        nodeUri,
        stereotype,
        caps,
        Instant.now()))).build();

    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    String randomSessionId = UUID.randomUUID().toString();
    String query = "{ session (id: \"" + randomSessionId + "\") { sessionDurationMillis } }";

    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);
    Map<String, Object> result = executeQuery(handler, query);
    assertThat(result)
      .containsEntry("data", null)
      .containsKey("errors")
      .extracting("errors").asInstanceOf(LIST).isNotEmpty()
      .element(0).asInstanceOf(MAP).containsKey("extensions")
      .extracting("extensions").asInstanceOf(MAP).containsKey("sessionId")
      .extracting("sessionId").isEqualTo(randomSessionId);
  }

  @Test
  public void shouldThrowExceptionWhenSessionIsEmpty() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, bus, nodeUri, publicUri, registrationSecret)
      .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
        id,
        nodeUri,
        stereotype,
        caps,
        Instant.now()))).build();

    distributor.add(node);
    wait.until(obj -> distributor.getStatus().hasCapacity());

    String query = "{ session (id: \"\") { sessionDurationMillis } }";

    GraphqlHandler handler = new GraphqlHandler(tracer, distributor, queue, publicUri, version);
    Map<String, Object> result = executeQuery(handler, query);
    assertThat(result)
      .containsEntry("data", null)
      .containsKey("errors")
      .extracting("errors").asInstanceOf(LIST).isNotEmpty();
  }

  private Map<String, Object> executeQuery(HttpHandler handler, String query) {
    HttpResponse res = handler.execute(
      new HttpRequest(GET, "/graphql")
        .setContent(Contents.asJson(singletonMap("query", query))));

    return new Json().toType(Contents.string(res), MAP_TYPE);
  }
}
