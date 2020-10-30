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

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.data.Slot;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class GraphqlHandlerTest {

  private final Secret registrationSecret = new Secret("stilton");
  private final URI publicUri = new URI("http://example.com/grid-o-matic");
  private Distributor distributor;
  private Tracer tracer;
  private EventBus events;
  private ImmutableCapabilities caps;
  private ImmutableCapabilities stereotype;
  private NewSessionPayload payload;

  public GraphqlHandlerTest() throws URISyntaxException {
  }

  @Before
  public void setupGrid() {
    tracer = DefaultTestTracer.createTracer();
    events = new GuavaEventBus();
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

    SessionMap sessions = new LocalSessionMap(tracer, events);
    distributor = new LocalDistributor(tracer, events, clientFactory, sessions, registrationSecret);
    stereotype = new ImmutableCapabilities("browserName", "cheese");
    caps = new ImmutableCapabilities("browserName", "cheese");
    payload = NewSessionPayload.create(caps);
  }

  @Test
  public void shouldBeAbleToGetGridUri() {
    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);

    Map<String, Object> topLevel = executeQuery(handler, "{ grid { uri } }");

    assertThat(topLevel).isEqualTo(Map.of("data", Map.of("grid", Map.of("uri", publicUri.toString()))));
  }

  @Test
  public void shouldReturnAnEmptyListForNodesIfNoneAreRegistered() {
    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);

    Map<String, Object> topLevel = executeQuery(handler, "{ grid { nodes { uri } } }");

    assertThat(topLevel)
      .describedAs(topLevel.toString())
      .isEqualTo(Map.of("data", Map.of("grid", Map.of("nodes", List.of()))));
  }

  @Test
  public void shouldBeAbleToGetUrlsOfAllNodes() throws URISyntaxException {
    Capabilities stereotype = new ImmutableCapabilities("cheese", "stilton");
    String nodeUri = "http://localhost:5556";
    Node node = LocalNode.builder(tracer, events, new URI(nodeUri), publicUri, registrationSecret)
      .add(stereotype, new SessionFactory() {
        @Override
        public Optional<ActiveSession> apply(CreateSessionRequest createSessionRequest) {
          return Optional.empty();
        }

        @Override
        public boolean test(Capabilities capabilities) {
          return false;
        }
      })
      .build();
    distributor.add(node);

    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);
    Map<String, Object> topLevel = executeQuery(handler, "{ grid { nodes { uri } } }");

    assertThat(topLevel)
      .describedAs(topLevel.toString())
      .isEqualTo(Map.of("data", Map.of("grid", Map.of("nodes", List.of(Map.of("uri", nodeUri))))));
  }

  @Test
  public void shouldBeAbleToGetSessionInfo() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, events, nodeUri, publicUri, registrationSecret)
        .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
            id,
            nodeUri,
            stereotype,
            caps,
            Instant.now()))).build();

    distributor.add(node);
    Session session = distributor.newSession(createRequest(payload)).getSession();

    assertThat(session).isNotNull();
    String sessionId = session.getId().toString();

    Set<Slot> slots = distributor.getStatus().getNodes().stream().findFirst().get().getSlots();

    Slot slot = slots.stream().findFirst().get();

    org.openqa.selenium.grid.graphql.Session graphqlSession =
        new org.openqa.selenium.grid.graphql.Session(sessionId,
                                                     session.getCapabilities(),
                                                     session.getStartTime(),
                                                     session.getUri(),
                                                     node.getId().toString(),
                                                     node.getUri(),
                                                     slot);
    String query = "{ session (id: \"" + sessionId + "\") { id, capabilities, startTime, uri } }";

    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);
    Map<String, Object> result = executeQuery(handler, query);

    assertThat(result)
        .describedAs(result.toString())
        .isEqualTo(Map.of(
            "data", Map.of("session",
                           Map.of("id", sessionId,
                                  "capabilities", graphqlSession.getCapabilities(),
                                  "startTime", graphqlSession.getStartTime(),
                                  "uri", graphqlSession.getUri().toString()))));
  }

  @Test
  public void shouldBeAbleToGetNodeInfoForSession() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, events, nodeUri, publicUri, registrationSecret)
        .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
            id,
            nodeUri,
            stereotype,
            caps,
            Instant.now()))).build();

    distributor.add(node);
    Session session = distributor.newSession(createRequest(payload)).getSession();

    assertThat(session).isNotNull();
    String sessionId = session.getId().toString();

    Set<Slot> slots = distributor.getStatus().getNodes().stream().findFirst().get().getSlots();

    Slot slot = slots.stream().findFirst().get();

    org.openqa.selenium.grid.graphql.Session graphqlSession =
        new org.openqa.selenium.grid.graphql.Session(sessionId,
                                                     session.getCapabilities(),
                                                     session.getStartTime(),
                                                     session.getUri(),
                                                     node.getId().toString(),
                                                     node.getUri(),
                                                     slot);
    String query = "{ session (id: \"" + sessionId + "\") { nodeId, nodeUri } }";

    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);
    Map<String, Object> result = executeQuery(handler, query);

    assertThat(result)
        .describedAs(result.toString())
        .isEqualTo(Map.of(
            "data", Map.of("session",
                           Map.of("nodeId", graphqlSession.getNodeId(),
                                  "nodeUri",
                                  graphqlSession.getNodeUri().toString()))));
  }

  @Test
  public void shouldBeAbleToGetSlotInfoForSession() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, events, nodeUri, publicUri, registrationSecret)
        .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
            id,
            nodeUri,
            stereotype,
            caps,
            Instant.now()))).build();

    distributor.add(node);
    Session session = distributor.newSession(createRequest(payload)).getSession();

    assertThat(session).isNotNull();
    String sessionId = session.getId().toString();

    Set<Slot> slots = distributor.getStatus().getNodes().stream().findFirst().get().getSlots();

    Slot slot = slots.stream().findFirst().get();

    org.openqa.selenium.grid.graphql.Session graphqlSession =
        new org.openqa.selenium.grid.graphql.Session(sessionId,
                                                     session.getCapabilities(),
                                                     session.getStartTime(),
                                                     session.getUri(),
                                                     node.getId().toString(),
                                                     node.getUri(),
                                                     slot);

    org.openqa.selenium.grid.graphql.Slot graphqlSlot = graphqlSession.getSlot();

    String query =
        "{ session (id: \"" + sessionId + "\") { slot { id, stereotype, lastStarted } } }";

    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);
    Map<String, Object> result = executeQuery(handler, query);

    assertThat(result)
        .describedAs(result.toString())
        .isEqualTo(Map.of(
            "data", Map.of("session",
                           Map.of("slot",
                                  Map.of("id", graphqlSlot.getId(),
                                         "stereotype", graphqlSlot.getStereotype(),
                                         "lastStarted",
                                         graphqlSlot.getLastStarted())))));
  }

  @Test
  public void shouldBeAbleToGetSessionDuration() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, events, nodeUri, publicUri, registrationSecret)
        .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
            id,
            nodeUri,
            stereotype,
            caps,
            Instant.now()))).build();

    distributor.add(node);
    Session session = distributor.newSession(createRequest(payload)).getSession();

    assertThat(session).isNotNull();
    String sessionId = session.getId().toString();

    String query = "{ session (id: \"" + sessionId + "\") { sessionDurationMillis } }";

    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);
    Map<String, Object> result = executeQuery(handler, query);

    Map<String, Object> dataMap = (Map<String, Object>) result.get("data");
    Map<String, Object> sessionMap = (Map<String, Object>) dataMap.get("session");

    assertThat(sessionMap.containsKey("sessionDurationMillis")).isTrue();
  }

  @Test
  public void shouldThrowExceptionWhenSessionNotFound() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, events, nodeUri, publicUri, registrationSecret)
        .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
            id,
            nodeUri,
            stereotype,
            caps,
            Instant.now()))).build();

    distributor.add(node);

    String randomSessionId = UUID.randomUUID().toString();
    String query = "{ session (id: \"" + randomSessionId + "\") { sessionDurationMillis } }";

    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);
    Map<String, Object> result = executeQuery(handler, query);
    assertThat(result.get("data")).isNull();

    List<Map<String, Object>> errors = (List<Map<String, Object>>) result.get("errors");

    assertThat(errors).isNotNull();
    assertThat(errors).element(0).isNotNull();

    Map<String, Object> error = errors.get(0);

    Map<String, Object> extensions = (Map<String, Object>) error.get("extensions");

    String sessionId = (String) extensions.get("sessionId");
    assertThat(sessionId).isEqualTo(randomSessionId);
  }

  @Test
  public void shouldThrowExceptionWhenSessionIsEmpty() throws URISyntaxException {
    String nodeUrl = "http://localhost:5556";
    URI nodeUri = new URI(nodeUrl);

    Node node = LocalNode.builder(tracer, events, nodeUri, publicUri, registrationSecret)
        .add(caps, new TestSessionFactory((id, caps) -> new org.openqa.selenium.grid.data.Session(
            id,
            nodeUri,
            stereotype,
            caps,
            Instant.now()))).build();

    distributor.add(node);

    String query = "{ session (id: \"\") { sessionDurationMillis } }";

    GraphqlHandler handler = new GraphqlHandler(distributor, publicUri);
    Map<String, Object> result = executeQuery(handler, query);
    assertThat(result.get("data")).isNull();

    List<Map<String, Object>> errors = (List<Map<String, Object>>) result.get("errors");

    assertThat(errors).isNotNull();
    assertThat(errors).element(0).isNotNull();
  }

  private Map<String, Object> executeQuery(HttpHandler handler, String query) {
    HttpResponse res = handler.execute(
      new HttpRequest(GET, "/graphql")
        .setContent(Contents.asJson(Map.of("query", query))));

    return new Json().toType(Contents.string(res), MAP_TYPE);
  }

  private HttpRequest createRequest(NewSessionPayload payload) {
    StringBuilder builder = new StringBuilder();
    try {
      payload.writeTo(builder);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }

    HttpRequest request = new HttpRequest(POST, "/se/grid/distributor/session");
    request.setContent(utf8String(builder.toString()));

    return request;
  }
}
