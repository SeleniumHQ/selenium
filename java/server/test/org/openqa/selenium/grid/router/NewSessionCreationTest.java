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

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriverInfo;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.events.local.GuavaEventBus;
import org.openqa.selenium.firefox.GeckoDriverInfo;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueuer;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueuer;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.EnsureSpecCompliantHeaders;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.tracing.DefaultTestTracer;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.testing.drivers.Browser;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assumptions.assumeThat;
import static org.junit.Assert.fail;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class NewSessionCreationTest {

  private Tracer tracer;
  private EventBus events;
  private HttpClient.Factory clientFactory;
  private Secret registrationSecret;
  private Server<?> server;

  @Before
  public void setup() {
    tracer = DefaultTestTracer.createTracer();
    events = new GuavaEventBus();
    clientFactory = HttpClient.Factory.createDefault();
    registrationSecret = new Secret("hereford hop");
  }

  @After
  public void stopServer() {
    server.stop();
  }

  @Test
  public void ensureJsCannotCreateANewSession() throws URISyntaxException {
    ChromeDriverInfo chromeDriverInfo = new ChromeDriverInfo();
    assumeThat(chromeDriverInfo.isAvailable()).isTrue();
    GeckoDriverInfo geckoDriverInfo = new GeckoDriverInfo();
    assumeThat(geckoDriverInfo.isAvailable()).isTrue();

    SessionMap sessions = new LocalSessionMap(tracer, events);
    LocalNewSessionQueue localNewSessionQueue = new LocalNewSessionQueue(
      tracer,
      events,
      Duration.ofSeconds(2),
      Duration.ofSeconds(2));
    NewSessionQueuer queuer = new LocalNewSessionQueuer(tracer, events, localNewSessionQueue);

    Distributor distributor = new LocalDistributor(
        tracer,
        events,
        clientFactory,
        sessions,
        queuer,
        registrationSecret);

    Routable router = new Router(tracer, clientFactory, sessions, queuer, distributor)
      .with(new EnsureSpecCompliantHeaders(ImmutableList.of(), ImmutableSet.of()));

    server = new NettyServer(
      new BaseServerOptions(new MapConfig(ImmutableMap.of())),
      router,
      new ProxyCdpIntoGrid(clientFactory, sessions))
      .start();

    URI uri = server.getUrl().toURI();
    Node node = LocalNode.builder(
      tracer,
      events,
      uri,
      uri,
      registrationSecret)
      .add(Browser.detect().getCapabilities(), new TestSessionFactory((id, caps) -> new Session(id, uri, Browser.detect().getCapabilities(), caps, Instant.now())))
      .build();
    distributor.add(node);

    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

    // Attempt to create a session without setting the content type
    HttpResponse res = client.execute(
      new HttpRequest(POST, "/session")
        .setContent(Contents.asJson(ImmutableMap.of(
          "capabilities", ImmutableMap.of(
            "alwaysMatch", Browser.detect().getCapabilities())))));

    assertThat(res.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);

    // Attempt to create a session with an origin header but content type set
    res = client.execute(
      new HttpRequest(POST, "/session")
        .addHeader("Content-Type", JSON_UTF_8)
        .addHeader("Origin", "localhost")
        .setContent(Contents.asJson(ImmutableMap.of(
          "capabilities", ImmutableMap.of(
            "alwaysMatch", Browser.detect().getCapabilities())))));

    assertThat(res.getStatus()).isEqualTo(HTTP_INTERNAL_ERROR);

    // And now make sure the session is just fine
    res = client.execute(
      new HttpRequest(POST, "/session")
        .addHeader("Content-Type", JSON_UTF_8)
        .setContent(Contents.asJson(ImmutableMap.of(
          "capabilities", ImmutableMap.of(
            "alwaysMatch", Browser.detect().getCapabilities())))));

    assertThat(res.isSuccessful()).isTrue();
  }

  @Test
  public void exerciseDriver() throws URISyntaxException {
    ChromeDriverInfo chromeDriverInfo = new ChromeDriverInfo();
    assumeThat(chromeDriverInfo.isAvailable()).isTrue();
    GeckoDriverInfo geckoDriverInfo = new GeckoDriverInfo();
    assumeThat(geckoDriverInfo.isAvailable()).isTrue();

    SessionMap sessions = new LocalSessionMap(tracer, events);
    LocalNewSessionQueue localNewSessionQueue = new LocalNewSessionQueue(
      tracer,
      events,
      Duration.ofSeconds(2),
      Duration.ofSeconds(2));
    NewSessionQueuer queuer = new LocalNewSessionQueuer(tracer, events, localNewSessionQueue);

    Distributor distributor = new LocalDistributor(
      tracer,
      events,
      clientFactory,
      sessions,
      queuer,
      registrationSecret);

    Routable router = new Router(tracer, clientFactory, sessions, queuer, distributor);

    server = new NettyServer(
      new BaseServerOptions(new MapConfig(ImmutableMap.of())), router).start();

    Capabilities capabilities = Browser.detect().getCapabilities();

    URI uri = server.getUrl().toURI();
    TestSessionFactory sessionFactory =
      new TestSessionFactory((id, caps) -> new Session(
        id,
        uri,
        capabilities,
        caps,
        Instant.now()));

    Node node = LocalNode.builder(
      tracer,
      events,
      uri,
      uri,
      registrationSecret)
      .add(capabilities, sessionFactory)
      .build();
    distributor.add(node);

    WebDriver driver = new RemoteWebDriver(server.getUrl(), capabilities);
    driver.get("http://www.google.com");

    // The node is still open. Now create a second session. It will be added to the queue.
    // The session request will timeout.
    try {
      WebDriver disposable = new RemoteWebDriver(server.getUrl(), capabilities);
      disposable.quit();
      fail("Should not have been able to create driver");
    } catch (SessionNotCreatedException expected) {
      // Fall through
    }

    // Kill the session
    driver.quit();

    // And now we're good to go.
    driver = new RemoteWebDriver(server.getUrl(), capabilities);
    driver.get("http://www.google.com");
    driver.quit();
  }

  @Test
  public void shouldRetryNewSessionRequestOnUnexpectedError() throws URISyntaxException {
    Capabilities capabilities = new ImmutableCapabilities("browserName", "cheese");
    URI nodeUri = new URI("http://localhost:4444");
    CombinedHandler handler = new CombinedHandler();

    SessionMap sessions = new LocalSessionMap(tracer, events);
    handler.addHandler(sessions);
    NewSessionQueue localNewSessionQueue = new LocalNewSessionQueue(
      tracer,
      events,
      Duration.ofSeconds(2),
      Duration.ofSeconds(10));
    NewSessionQueuer queuer = new LocalNewSessionQueuer(tracer, events, localNewSessionQueue);
    handler.addHandler(queuer);

    Distributor distributor = new LocalDistributor(
      tracer,
      events,
      clientFactory,
      sessions,
      queuer,
      registrationSecret);
    handler.addHandler(distributor);

    AtomicInteger count = new AtomicInteger();

    // First session creation attempt throws an error.
    // Second attempt creates a session.
    TestSessionFactory sessionFactory = new TestSessionFactory((id, caps) -> {
      if (count.get() == 0) {
        count.incrementAndGet();
        throw new SessionNotCreatedException("Expected the exception");
      } else {
        return new Session(
          id,
          nodeUri,
          new ImmutableCapabilities(),
          caps,
          Instant.now());
      }
    });

    LocalNode localNode = LocalNode.builder(tracer, events, nodeUri, nodeUri, registrationSecret)
      .add(capabilities, sessionFactory).build();
    handler.addHandler(localNode);
    distributor.add(localNode);

    Router router = new Router(tracer, clientFactory, sessions, queuer, distributor);
    handler.addHandler(router);

    server = new NettyServer(
      new BaseServerOptions(
        new MapConfig(ImmutableMap.of())),
      handler);

    server.start();

    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(asJson(
      ImmutableMap.of(
        "capabilities", ImmutableMap.of(
          "alwaysMatch", capabilities))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    HttpResponse httpResponse = client.execute(request);
    assertThat(httpResponse.getStatus()).isEqualTo(HTTP_OK);
  }

}
