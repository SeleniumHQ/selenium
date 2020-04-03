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

import io.opentelemetry.OpenTelemetry;
import io.opentelemetry.trace.Tracer;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.component.HealthCheck;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class RouterTest {

  private Tracer tracer;
  private EventBus bus;
  private CombinedHandler handler;
  private HttpClient.Factory clientFactory;
  private SessionMap sessions;
  private Distributor distributor;
  private Router router;

  @Before
  public void setUp() {
    tracer = OpenTelemetry.getTracerProvider().get("default");
    bus = new GuavaEventBus();

    handler = new CombinedHandler();
    clientFactory = new PassthroughHttpClient.Factory(handler);

    sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    distributor = new LocalDistributor(tracer, bus, clientFactory, sessions, null);
    handler.addHandler(distributor);

    router = new Router(tracer, clientFactory, sessions, distributor);
  }

  @Test
  public void shouldListAnEmptyDistributorAsMeaningTheGridIsNotReady() {
    Map<String, Object> status = getStatus(router);
    assertFalse((Boolean) status.get("ready"));
  }

  @Test
  public void addingANodeThatIsDownMeansTheGridIsNotReady() throws URISyntaxException {
    Capabilities capabilities = new ImmutableCapabilities("cheese", "peas");
    URI uri = new URI("http://exmaple.com");

    AtomicBoolean isUp = new AtomicBoolean(false);

    Node node = LocalNode.builder(tracer, bus, clientFactory, uri, null)
        .add(capabilities, new TestSessionFactory((id, caps) -> new Session(id, uri, caps)))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
        .build();
    distributor.add(node);

    Map<String, Object> status = getStatus(router);
    assertFalse(status.toString(), (Boolean) status.get("ready"));
  }

  @Test
  public void aNodeThatIsUpAndHasSpareSessionsMeansTheGridIsReady() throws URISyntaxException {
    Capabilities capabilities = new ImmutableCapabilities("cheese", "peas");
    URI uri = new URI("http://exmaple.com");

    AtomicBoolean isUp = new AtomicBoolean(true);

    Node node = LocalNode.builder(tracer, bus, clientFactory, uri, null)
        .add(capabilities, new TestSessionFactory((id, caps) -> new Session(id, uri, caps)))
        .advanced()
        .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
        .build();
    distributor.add(node);

    Map<String, Object> status = getStatus(router);
    assertTrue(status.toString(), (Boolean) status.get("ready"));
  }

  @Test
  public void shouldListAllNodesTheDistributorIsAwareOf() {

  }

  @Test
  public void ifNodesHaveSpareSlotsButAlreadyHaveMaxSessionsGridIsNotReady() {

  }

  private Map<String, Object> getStatus(Router router) {
    HttpResponse response = router.execute(new HttpRequest(GET, "/status"));
    Map<String, Object> status = Values.get(response, MAP_TYPE);
    assertNotNull(status);
    return status;
  }
}
