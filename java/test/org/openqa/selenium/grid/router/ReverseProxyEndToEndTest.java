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

import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import com.google.common.collect.ImmutableSet;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.data.Session;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.testing.TestSessionFactory;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
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

class ReverseProxyEndToEndTest {

  private static final Capabilities CAPS = new ImmutableCapabilities("browserName", "cheese");
  private static final String SUB_PATH = "/acme";

  public static Stream<Arguments> data() {
    StringBuilder rawCaps = new StringBuilder();
    try (JsonOutput out = new Json().newOutput(rawCaps)) {
      out.setPrettyPrint(false).write(CAPS);
    }

    Config additionalConfig =
        new TomlConfig(
            new StringReader(
                "[network]\n"
                    + "sub-path = \""
                    + SUB_PATH
                    + "\"\n"
                    + "[node]\n"
                    + "detect-drivers = false\n"
                    + "driver-factories = [\n"
                    + String.format("\"%s\",", TestSessionFactoryFactory.class.getName())
                    + "\n"
                    + String.format("\"%s\"", rawCaps.toString().replace("\"", "\\\""))
                    + "\n"
                    + "]\n"
                    + "[sessionqueue]\n"
                    + "session-request-timeout = 5"));

    Supplier<Deployment> s1 = () -> DeploymentTypes.DISTRIBUTED.start(CAPS, additionalConfig);
    Supplier<Deployment> s2 = () -> DeploymentTypes.HUB_AND_NODE.start(CAPS, additionalConfig);
    Supplier<Deployment> s3 = () -> DeploymentTypes.STANDALONE.start(CAPS, additionalConfig);

    return ImmutableSet.of(s1, s2, s3).stream().map(Arguments::of);
  }

  private Server<?> server;
  private TearDownFixture fixtures;

  private HttpClient client;

  public void setFields(Supplier<Deployment> values) {
    Deployment data = values.get();
    this.server = data.getServer();
    this.fixtures = data;
    HttpClient.Factory clientFactory = HttpClient.Factory.createDefault();
    this.client = clientFactory.createClient(url(server));
  }

  @AfterEach
  public void stopServers() {
    Safely.safelyCall(() -> client.close());
    Safely.safelyCall(() -> fixtures.tearDown());
  }

  private static void waitUntilReady(Server<?> server, Duration duration) {
    try (HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl())) {
      new FluentWait<>(client)
          .withTimeout(duration)
          .pollingEvery(Duration.ofSeconds(1))
          .until(
              c -> {
                HttpResponse response = c.execute(new HttpRequest(GET, "/status"));
                System.out.println(Contents.string(response));
                Map<String, Object> status = Values.get(response, MAP_TYPE);
                return Boolean.TRUE.equals(
                    status != null && Boolean.parseBoolean(status.get("ready").toString()));
              });
    }
  }

  public static class TestSessionFactoryFactory {
    public static SessionFactory create(Config config, Capabilities stereotype) {
      BaseServerOptions serverOptions = new BaseServerOptions(config);
      String hostname = serverOptions.getHostname().orElse("localhost");
      int port = serverOptions.getPort();
      URI serverUri;
      try {
        serverUri = new URI("http", null, hostname, port, SUB_PATH, null, null);
      } catch (URISyntaxException e) {
        throw new RuntimeException(e);
      }
      return new TestSessionFactory(stereotype, (id, caps) -> new SpoofSession(serverUri, caps));
    }
  }

  private static class SpoofSession extends Session implements HttpHandler {

    private SpoofSession(URI serverUri, Capabilities capabilities) {
      super(
          new SessionId(UUID.randomUUID()),
          serverUri,
          new ImmutableCapabilities(),
          capabilities,
          Instant.now());
    }

    @Override
    public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
      return new HttpResponse();
    }
  }

  private static URL url(Server<?> server) {
    try {
      return new URL(server.getUrl().toString() + SUB_PATH);
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  private static String gridUi(Server<?> server) {
    try {
      return new URL(server.getUrl().toString() + SUB_PATH + "/ui").toString();
    } catch (MalformedURLException e) {
      throw new RuntimeException(e);
    }
  }

  @ParameterizedTest
  @MethodSource("data")
  void success(Supplier<Deployment> values) {
    setFields(values);

    // The node added only has a single node. Make sure we can start and stop sessions.
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese", "se:type", "cheddar");
    URL url = url(server);
    WebDriver driver = new RemoteWebDriver(url, caps);
    driver.get(gridUi(server));

    // Kill the session, and wait until the grid says it's ready
    driver.quit();

    waitUntilReady(server, Duration.ofSeconds(20));
  }
}
