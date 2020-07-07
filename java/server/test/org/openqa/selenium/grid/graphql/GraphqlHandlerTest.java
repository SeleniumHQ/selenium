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
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class GraphqlHandlerTest {

  private final URI publicUri = new URI("http://example.com/grid-o-matic");
  private Distributor distributor;
  private Tracer tracer;
  private EventBus events;

  public GraphqlHandlerTest() throws URISyntaxException {
  }

  @Before
  public void setupGrid() {
    tracer = DefaultTestTracer.createTracer();
    events = new GuavaEventBus();
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();

    SessionMap sessions = new LocalSessionMap(tracer, events);
    distributor = new LocalDistributor(tracer, events, clientFactory, sessions, null);
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
    Node node = LocalNode.builder(tracer, events, new URI(nodeUri), publicUri, null)
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

  private Map<String, Object> executeQuery(HttpHandler handler, String query) {
    HttpResponse res = handler.execute(
      new HttpRequest(GET, "/graphql")
        .setContent(Contents.asJson(Map.of("query", query))));

    return new Json().toType(Contents.string(res), MAP_TYPE);
  }
}
