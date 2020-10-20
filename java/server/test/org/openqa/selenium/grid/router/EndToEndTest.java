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

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameter;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.grid.commands.EventBusCommand;
import org.openqa.selenium.grid.commands.Hub;
import org.openqa.selenium.grid.commands.Standalone;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.distributor.httpd.DistributorServer;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.node.httpd.NodeServer;
import org.openqa.selenium.grid.router.httpd.RouterServer;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.httpd.SessionMapServer;
import org.openqa.selenium.grid.sessionqueue.httpd.NewSessionQueuerServer;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.TearDownFixture;

import java.io.StringReader;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;

import static java.time.Duration.ofSeconds;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

@RunWith(Parameterized.class)
public class EndToEndTest {

  private static final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private final Json json = new Json();

  @Parameterized.Parameters(name = "End to End {0}")
  public static Collection<Supplier<TestData>> buildGrids() {
    return ImmutableSet.of(
      EndToEndTest::createFullyDistributed,
      EndToEndTest::createHubAndNode,
      EndToEndTest::createStandalone);
  }

  @Parameter
  public Supplier<TestData> values;

  private Server<?> server;

  private HttpClient.Factory clientFactory;

  @Before
  public void setFields() {
    TestData data = values.get();
    this.server = data.server;
    this.clientFactory = HttpClient.Factory.createDefault();
  }

  @After
  public void stopServers() {
    Safely.safelyCall(values.get().fixtures);
  }


  private static TestData createStandalone() {
    StringBuilder rawCaps = new StringBuilder();
    try (JsonOutput out = new Json().newOutput(rawCaps)) {
      out.setPrettyPrint(false).write(CAPS);
    }

    String[] rawConfig = new String[]{
      "[network]",
      "relax-checks = true",
      "",
      "[node]",
      "detect-drivers = false",
      "driver-factories = [",
      String.format("\"%s\",", TestSessionFactoryFactory.class.getName()),
      String.format("\"%s\"", rawCaps.toString().replace("\"", "\\\"")),
      "]",
      "",
      "[server]",
      "port = " + PortProber.findFreePort(),
      "registration-secret = \"provolone\""
    };
    Config config = new MemoizedConfig(
      new TomlConfig(new StringReader(String.join("\n", rawConfig))));

    Server<?> server = new Standalone().asServer(config).start();

    waitUntilReady(server);

    return new TestData(server, server::stop);
  }

  private static TestData createHubAndNode() {
    StringBuilder rawCaps = new StringBuilder();
    try (JsonOutput out = new Json().newOutput(rawCaps)) {
      out.setPrettyPrint(false).write(CAPS);
    }

    int publish = PortProber.findFreePort();
    int subscribe = PortProber.findFreePort();

    String[] rawConfig = new String[] {
      "[events]",
      "publish = \"tcp://localhost:" + publish + "\"",
      "subscribe = \"tcp://localhost:" + subscribe + "\"",
      "",
      "[network]",
      "relax-checks = true",
      "",
      "[node]",
      "detect-drivers = false",
      "driver-factories = [",
      String.format("\"%s\",", TestSessionFactoryFactory.class.getName()),
      String.format("\"%s\"", rawCaps.toString().replace("\"", "\\\"")),
      "]",
    };

    TomlConfig baseConfig = new TomlConfig(new StringReader(String.join("\n", rawConfig)));
    Config hubConfig = new CompoundConfig(
      new MapConfig(ImmutableMap.of("events", ImmutableMap.of("bind", true))),
      baseConfig);

    Server<?> hub = new Hub().asServer(setRandomPort(hubConfig)).start();

    Server<?> node = new NodeServer().asServer(setRandomPort(baseConfig)).start();
    waitUntilReady(node);

    waitUntilReady(hub);

    return new TestData(hub, hub::stop, node::stop);
  }

  private static TestData createFullyDistributed() {
    StringBuilder rawCaps = new StringBuilder();
    try (JsonOutput out = new Json().newOutput(rawCaps)) {
      out.setPrettyPrint(false).write(CAPS);
    }

    int publish = PortProber.findFreePort();
    int subscribe = PortProber.findFreePort();

    String[] rawConfig = new String[] {
      "[events]",
      "publish = \"tcp://localhost:" + publish + "\"",
      "subscribe = \"tcp://localhost:" + subscribe + "\"",
      "bind = false",
      "",
      "[network]",
      "relax-checks = true",
      "",
      "[node]",
      "detect-drivers = false",
      "driver-factories = [",
      String.format("\"%s\",", TestSessionFactoryFactory.class.getName()),
      String.format("\"%s\"", rawCaps.toString().replace("\"", "\\\"")),
      "]",
    };

    Config sharedConfig = new MemoizedConfig(new TomlConfig(new StringReader(String.join("\n", rawConfig))));

    Server<?> eventServer = new EventBusCommand()
      .asServer(new CompoundConfig(
        new TomlConfig(new StringReader(String.join("\n", new String[] {
          "[events]",
          "publish = \"tcp://localhost:" + publish + "\"",
          "subscribe = \"tcp://localhost:" + subscribe + "\"",
          "bind = true"}))),
        setRandomPort(sharedConfig)))
      .start();
    waitUntilReady(eventServer);

    Server<?> newSessionQueueServer = new NewSessionQueuerServer().asServer(setRandomPort(sharedConfig)).start();
    waitUntilReady(newSessionQueueServer);

    Server<?> sessionMapServer = new SessionMapServer().asServer(setRandomPort(sharedConfig)).start();
    Config sessionMapConfig = new TomlConfig(new StringReader(String.join(
      "\n",
      new String[] {
        "[sessions]",
        "hostname = \"localhost\"",
        "port = " + sessionMapServer.getUrl().getPort()
      }
    )));

    Server<?> distributorServer = new DistributorServer()
      .asServer(setRandomPort(new CompoundConfig(sharedConfig, sessionMapConfig)))
      .start();
    Config distributorConfig = new TomlConfig(new StringReader(String.join(
      "\n",
      new String[] {
        "[distributor]",
        "hostname = \"localhost\"",
        "port = " + distributorServer.getUrl().getPort()
      }
    )));

    Server<?> router = new RouterServer()
      .asServer(setRandomPort(new CompoundConfig(sharedConfig, sessionMapConfig, distributorConfig)))
      .start();

    Server<?> nodeServer = new NodeServer()
      .asServer(setRandomPort(new CompoundConfig(sharedConfig, sessionMapConfig, distributorConfig)))
      .start();
    waitUntilReady(nodeServer);

    waitUntilReady(router);

    return new TestData(
      router,
      router::stop,
      nodeServer::stop,
      distributorServer::stop,
      sessionMapServer::stop,
      newSessionQueueServer::stop,
      eventServer::stop);
  }

  private static void waitUntilReady(Server<?> server) {
    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

    new FluentWait<>(client)
      .withTimeout(Duration.ofSeconds(5))
      .until(c -> {
        HttpResponse response = c.execute(new HttpRequest(GET, "/status"));
        Map<String, Object> status = Values.get(response, MAP_TYPE);
        return Boolean.TRUE.equals(status.get("ready"));
      });
  }

  private static Config setRandomPort(Config config) {
    return new MemoizedConfig(
      new CompoundConfig(
        new MapConfig(ImmutableMap.of("server", ImmutableMap.of("port", PortProber.findFreePort()))),
        config));
  }

  // Hahahaha. Java naming.
  public static class TestSessionFactoryFactory {
    public static SessionFactory create(Config config, Capabilities stereotype) {
      BaseServerOptions serverOptions = new BaseServerOptions(config);
      String hostname = serverOptions.getHostname().orElse("localhost");
      int port = serverOptions.getPort();
      URI serverUri;
      try {
         serverUri = new URI("http", null, hostname, port, null, null, null);
      } catch (URISyntaxException e) {
        throw new RuntimeException(e);
      }

      return new TestSessionFactory(stereotype, (id, caps) -> new SpoofSession(serverUri, caps));
    }
  }

  private static class SpoofSession extends Session implements HttpHandler {

    private SpoofSession(URI serverUri, Capabilities capabilities) {
      super(new SessionId(UUID.randomUUID()), serverUri, new ImmutableCapabilities(), capabilities, Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }

  @Test
  public void success() {
    // The node added only has a single node. Make sure we can start and stop sessions.
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese", "type", "cheddar");
    WebDriver driver = new RemoteWebDriver(server.getUrl(), caps);
    driver.get("http://www.google.com");

    // Kill the session, and wait until the grid says it's ready
    driver.quit();
  }

  @Test
  public void exerciseDriver() {
    // The node added only has a single node. Make sure we can start and stop sessions.
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese", "type", "cheddar");
    WebDriver driver = new RemoteWebDriver(server.getUrl(), caps);
    driver.get("http://www.google.com");

    // The node is still open. Now create a second session. This should fail
    try {
      WebDriver disposable = new RemoteWebDriver(server.getUrl(), caps);
      disposable.quit();
      fail("Should not have been able to create driver");
    } catch (SessionNotCreatedException expected) {
      // Fall through
    }

    // Kill the session, and wait until the grid says it's ready
    driver.quit();

    HttpClient client = clientFactory.createClient(server.getUrl());
    new FluentWait<>("").withTimeout(ofSeconds(200)).until(obj -> {
      try {
        HttpResponse response = client.execute(new HttpRequest(GET, "/status"));
        System.out.println(Contents.string(response));
        Map<String, Object> status = Values.get(response, MAP_TYPE);
        return Boolean.TRUE.equals(status.get("ready"));
      } catch (UncheckedIOException e) {
        e.printStackTrace();
        return false;
      }
    });

    // And now we're good to go.
    driver = new RemoteWebDriver(server.getUrl(), caps);
    driver.get("http://www.google.com");
    driver.quit();
  }

  @Test
  public void shouldAllowPassthroughForW3CMode() {
    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(asJson(
        ImmutableMap.of(
            "capabilities", ImmutableMap.of(
                "alwaysMatch", ImmutableMap.of("browserName", "cheese")))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    HttpResponse response = client.execute(request);

    assertEquals(200, response.getStatus());

    Map<String, Object> topLevel = json.toType(string(response), MAP_TYPE);

    // There should not be a numeric status field
    assertFalse(string(request), topLevel.containsKey("status"));

    // And the value should have all the good stuff in it: the session id and the capabilities
    Map<?, ?> value = (Map<?, ?>) topLevel.get("value");
    assertThat(value.get("sessionId")).isInstanceOf(String.class);

    Map<?, ?> caps = (Map<?, ?>) value.get("capabilities");
    assertEquals("cheese", caps.get("browserName"));
  }

  @Test
  public void shouldAllowPassthroughForJWPMode() {
    HttpRequest request = new HttpRequest(POST, "/session");
    request.setContent(asJson(
        ImmutableMap.of(
            "desiredCapabilities", ImmutableMap.of(
                "browserName", "cheese"))));

    HttpClient client = clientFactory.createClient(server.getUrl());
    HttpResponse response = client.execute(request);

    assertEquals(200, response.getStatus());

    Map<String, Object> topLevel = json.toType(string(response), MAP_TYPE);

    // There should be a numeric status field
    assertEquals(topLevel.toString(), 0L, topLevel.get("status"));
    // The session id
    assertTrue(string(request), topLevel.containsKey("sessionId"));

    // And the value should be the capabilities.
    Map<?, ?> value = (Map<?, ?>) topLevel.get("value");
    assertEquals(string(request), "cheese", value.get("browserName"));
  }

  @Test
  public void shouldDoProtocolTranslationFromW3CLocalEndToJWPRemoteEnd() {

  }

  @Test
  public void shouldDoProtocolTranslationFromJWPLocalEndToW3CRemoteEnd() {

  }

  private static class TestData {
    public final Server<?> server;
    public final TearDownFixture[] fixtures;

    public TestData(Server<?> server, TearDownFixture... fixtures) {
      this.server = server;
      this.fixtures = fixtures;
    }
  }
}
