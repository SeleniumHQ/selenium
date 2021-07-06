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

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.data.Availability;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.Session;
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
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.support.ui.FluentWait;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.openqa.selenium.grid.data.Availability.DOWN;
import static org.openqa.selenium.grid.data.Availability.UP;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

public class RouterTest {

  private Tracer tracer;
  private EventBus bus;
  private CombinedHandler handler;
  private SessionMap sessions;
  private NewSessionQueue queue;
  private Distributor distributor;
  private Router router;
  private Secret registrationSecret;

  @Before
  public void setUp() {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();

    handler = new CombinedHandler();
    HttpClient.Factory clientFactory = new PassthroughHttpClient.Factory(handler);

    sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);

    registrationSecret = new Secret("stinking bishop");

    queue = new LocalNewSessionQueue(
      tracer,
      bus,
      new DefaultSlotMatcher(),
      Duration.ofSeconds(2),
      Duration.ofSeconds(2),
      registrationSecret);
    handler.addHandler(queue);

    distributor = new LocalDistributor(
      tracer,
      bus,
      clientFactory,
      sessions,
      queue,
      new DefaultSlotSelector(),
      registrationSecret,
      Duration.ofMinutes(5),
      false);
    handler.addHandler(distributor);

    router = new Router(tracer, clientFactory, sessions, queue, distributor);
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

    AtomicReference<Availability> isUp = new AtomicReference<>(DOWN);

    Node node = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
      .add(capabilities, new TestSessionFactory((id, caps) -> new Session(id, uri, new ImmutableCapabilities(), caps, Instant.now())))
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

    AtomicReference<Availability> isUp = new AtomicReference<>(UP);

    Node node = LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
      .add(capabilities, new TestSessionFactory((id, caps) -> new Session(id, uri, new ImmutableCapabilities(), caps, Instant.now())))
      .advanced()
      .healthCheck(() -> new HealthCheck.Result(isUp.get(), "TL;DR"))
      .build();
    distributor.add(node);

    waitUntilReady(router, Duration.ofSeconds(5));
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

  private static void waitUntilReady(Router router, Duration duration) {
    new FluentWait<>(router)
      .withTimeout(duration)
      .pollingEvery(Duration.ofMillis(100))
      .until(r -> {
        HttpResponse response = r.execute(new HttpRequest(GET, "/status"));
        Map<String, Object> status = Values.get(response, MAP_TYPE);
        return Boolean.TRUE.equals(status.get("ready"));
      });
  }
}
