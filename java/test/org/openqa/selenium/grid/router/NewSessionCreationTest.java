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

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.DefaultSlotMatcher;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.distributor.selector.DefaultSlotSelector;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.testing.PassthroughHttpClient;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.EnsureSpecCompliantHeaders;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.testing.drivers.Browser;

class NewSessionCreationTest {

  private static final int newSessionThreadPoolSize = Runtime.getRuntime().availableProcessors();
  private Tracer tracer;
  private EventBus bus;
  private HttpClient.Factory clientFactory;
  private Secret registrationSecret;
  private Server<?> server;

  @BeforeEach
  public void setup() {
    tracer = DefaultTestTracer.createTracer();
    bus = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();
    registrationSecret = new Secret("hereford hop");
  }

  @AfterEach
  public void stopServer() {
    server.stop();
  }

  @Test
  void ensureJsCannotCreateANewSession() throws URISyntaxException {
    SessionMap sessions = new LocalSessionMap(tracer, bus);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(60),
            registrationSecret,
            5);

    Distributor distributor =
        new LocalDistributor(
            tracer,
            bus,
            clientFactory,
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());

    Routable router =
        new Router(tracer, clientFactory, sessions, queue, distributor)
            .with(new EnsureSpecCompliantHeaders(ImmutableList.of(), ImmutableSet.of()));

    server =
        new NettyServer(
                new BaseServerOptions(new MapConfig(ImmutableMap.of())),
                router,
                new ProxyWebsocketsIntoGrid(clientFactory, sessions))
            .start();

    URI uri = server.getUrl().toURI();
    Node node =
        LocalNode.builder(tracer, bus, uri, uri, registrationSecret)
            .add(
                Browser.detect().getCapabilities(),
                new TestSessionFactory(
                    (id, caps) ->
                        new Session(
                            id, uri, Browser.detect().getCapabilities(), caps, Instant.now())))
            .build();
    distributor.add(node);

    try (HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl())) {
      // Attempt to create a session with an origin header but content type set
      HttpResponse res =
          client.execute(
              new HttpRequest(POST, "/session")
                  .addHeader("Content-Type", JSON_UTF_8)
                  .addHeader("Origin", "localhost")
                  .setContent(
                      Contents.asJson(
                          ImmutableMap.of(
                              "capabilities",
                              ImmutableMap.of(
                                  "alwaysMatch", Browser.detect().getCapabilities())))));

      assertThat(res.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);

      // And now make sure the session is just fine
      res =
          client.execute(
              new HttpRequest(POST, "/session")
                  .addHeader("Content-Type", JSON_UTF_8)
                  .setContent(
                      Contents.asJson(
                          ImmutableMap.of(
                              "capabilities",
                              ImmutableMap.of(
                                  "alwaysMatch", Browser.detect().getCapabilities())))));

      assertThat(res.isSuccessful()).isTrue();
    }
  }

  @Test
  void shouldNotRetryNewSessionRequestOnUnexpectedError() throws URISyntaxException {
    Capabilities capabilities = new ImmutableCapabilities("browserName", "cheese");
    int nodePort = PortProber.findFreePort();
    URI nodeUri = new URI("http://localhost:" + nodePort);
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(2),
            Duration.ofSeconds(10),
            registrationSecret,
            5);
    handler.addHandler(queue);

    AtomicInteger count = new AtomicInteger();

    // First session creation attempt throws an error.
    // Does not reach second attempt.
    TestSessionFactory sessionFactory =
        new TestSessionFactory(
            (id, caps) -> {
              if (count.get() == 0) {
                count.incrementAndGet();
                throw new SessionNotCreatedException("Expected the exception");
              } else {
                return new Session(id, nodeUri, new ImmutableCapabilities(), caps, Instant.now());
              }
            });

    LocalNode localNode =
        LocalNode.builder(tracer, bus, nodeUri, nodeUri, registrationSecret)
            .add(capabilities, sessionFactory)
            .build();
    handler.addHandler(localNode);

    Distributor distributor =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(handler),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            false,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    handler.addHandler(distributor);

    distributor.add(localNode);

    Router router = new Router(tracer, clientFactory, sessions, queue, distributor);
    handler.addHandler(router);

    server = new NettyServer(new BaseServerOptions(new MapConfig(ImmutableMap.of())), handler);

    server.start();

    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(
        asJson(ImmutableMap.of("capabilities", ImmutableMap.of("alwaysMatch", capabilities))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    HttpResponse httpResponse = client.execute(request);
    assertThat(httpResponse.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
  }

  @Test
  @Timeout(10)
  void shouldRejectRequestForUnsupportedCaps() throws URISyntaxException {
    Capabilities capabilities = new ImmutableCapabilities("browserName", "cheese");
    int nodePort = PortProber.findFreePort();
    URI nodeUri = new URI("http://localhost:" + nodePort);
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    handler.addHandler(sessions);
    NewSessionQueue queue =
        new LocalNewSessionQueue(
            tracer,
            new DefaultSlotMatcher(),
            Duration.ofSeconds(5),
            Duration.ofSeconds(60),
            registrationSecret,
            5);
    handler.addHandler(queue);

    TestSessionFactory sessionFactory =
        new TestSessionFactory(
            (id, caps) ->
                new Session(id, nodeUri, new ImmutableCapabilities(), caps, Instant.now()));

    LocalNode localNode =
        LocalNode.builder(tracer, bus, nodeUri, nodeUri, registrationSecret)
            .add(capabilities, sessionFactory)
            .build();
    handler.addHandler(localNode);

    Distributor distributor =
        new LocalDistributor(
            tracer,
            bus,
            new PassthroughHttpClient.Factory(handler),
            sessions,
            queue,
            new DefaultSlotSelector(),
            registrationSecret,
            Duration.ofMinutes(5),
            true,
            Duration.ofSeconds(5),
            newSessionThreadPoolSize,
            new DefaultSlotMatcher());
    handler.addHandler(distributor);

    distributor.add(localNode);

    Router router = new Router(tracer, clientFactory, sessions, queue, distributor);
    handler.addHandler(router);

    server = new NettyServer(new BaseServerOptions(new MapConfig(ImmutableMap.of())), handler);

    server.start();

    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(
        asJson(
            ImmutableMap.of(
                "capabilities",
                ImmutableMap.of(
                    "alwaysMatch", new ImmutableCapabilities("browserName", "burger")))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    HttpResponse httpResponse = client.execute(request);
    assertThat(httpResponse.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);
  }
}
