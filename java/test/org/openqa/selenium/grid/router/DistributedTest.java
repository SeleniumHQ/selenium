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

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.StringReader;
import java.time.Duration;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.BiDiProvider;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.router.DeploymentTypes.Deployment;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.ConnectionFailedException;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.TearDownFixture;
import org.openqa.selenium.testing.drivers.Browser;

class DistributedTest {

  private final List<TearDownFixture> tearDowns = new LinkedList<>();
  private Server<?> server;
  private Browser browser;
  private Server<?> appServer;

  @BeforeEach
  public void setupServers() {
    browser = Objects.requireNonNull(Browser.detect());

    Deployment deployment =
        DeploymentTypes.DISTRIBUTED.start(
            browser.getCapabilities(),
            new TomlConfig(
                new StringReader(
                    "[node]\n"
                        + "driver-implementation = "
                        + String.format("\"%s\"", browser.displayName())
                        + "\n"
                        + "session-timeout = 240"
                        + "\n"
                        + "override-max-sessions = true"
                        + "\n"
                        + "max-sessions = 2"
                        + "\n"
                        + "connection-limit-per-session = 3")));
    tearDowns.add(deployment);

    server = deployment.getServer();

    appServer =
        new NettyServer(
            new BaseServerOptions(new MemoizedConfig(new MapConfig())),
            req -> {
              try {
                Thread.sleep(2000);
              } catch (InterruptedException e) {
                throw new RuntimeException(e);
              }
              return new HttpResponse().setContent(Contents.string("<h1>Cheese</h1>", UTF_8));
            });

    tearDowns.add(() -> appServer.stop());
    appServer.start();
  }

  @AfterEach
  public void tearDown() {
    tearDowns.parallelStream().forEach(Safely::safelyCall);
  }

  @Test
  void clientTimeoutDoesNotLeakARunningBrowser() throws Exception {
    assertThat(server.isStarted()).isTrue();

    // using nanoTime is intentionally, the clock in WSL2 is jumping
    var start = System.nanoTime();

    // one healthy to ensure the distributed grid is working as expected
    WebDriver healthy =
        RemoteWebDriver.builder()
            .oneOf(browser.getCapabilities())
            .config(
                ClientConfig.defaultConfig()
                    .baseUrl(server.getUrl())
                    // ensures the time taken * 2 is smaller than session-timeout
                    .readTimeout(Duration.ofSeconds(90)))
            .build();

    var end = System.nanoTime();

    try {
      // provoke the client to run into a http timeout
      assertThatThrownBy(
              () ->
                  RemoteWebDriver.builder()
                      .oneOf(browser.getCapabilities())
                      .config(
                          ClientConfig.defaultConfig()
                              .baseUrl(server.getUrl())
                              .readTimeout(Duration.ofMillis(600)))
                      .build())
          .isInstanceOf(SessionNotCreatedException.class)
          .hasMessageContaining("TimeoutException");

      // ensure the grid has some time to start the browser and shutdown the browser
      Thread.sleep(Duration.ofNanos((end - start) * 3).toMillis());

      HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());
      try {
        HttpRequest request = new HttpRequest(HttpMethod.POST, "/graphql");
        request.setContent(Contents.utf8String("{\"query\": \"{grid { sessionCount }}\"}"));
        HttpResponse response = client.execute(request);

        JsonInput input = new Json().newInput(Contents.reader(response));
        int sessionCount = -1;

        input.beginObject();
        while (input.hasNext()) {
          switch (input.nextName()) {
            case "data":
              input.beginObject();
              while (input.hasNext()) {
                switch (input.nextName()) {
                  case "grid":
                    input.beginObject();
                    while (input.hasNext()) {
                      switch (input.nextName()) {
                        case "sessionCount":
                          sessionCount = input.read(Integer.class);
                          break;
                        default:
                          input.skipValue();
                          break;
                      }
                    }
                    input.endObject();
                    break;
                  default:
                    input.skipValue();
                    break;
                }
              }
              input.endObject();
              break;
            default:
              input.skipValue();
              break;
          }
        }

        assertThat(sessionCount).isEqualTo(1);
      } finally {
        Safely.safelyCall(client::close);
      }
    } finally {
      Safely.safelyCall(healthy::quit);
    }
  }

  @Test
  void connectionLimitIsRespected() {
    assertThat(server.isStarted()).isTrue();

    // don't use the RemoteWebDriver.builder here, using it does create an unknown number of
    // connections
    WebDriver driver = new RemoteWebDriver(server.getUrl(), browser.getCapabilities());

    try {
      Capabilities caps = ((HasCapabilities) driver).getCapabilities();
      BiDiProvider biDiProvider = new BiDiProvider();

      BiDi cnn1 = biDiProvider.getImplementation(caps, null).getBiDi();
      BiDi cnn2 = biDiProvider.getImplementation(caps, null).getBiDi();
      BiDi cnn3 = biDiProvider.getImplementation(caps, null).getBiDi();

      assertThatThrownBy(() -> biDiProvider.getImplementation(caps, null).getBiDi())
          .isInstanceOf(ConnectionFailedException.class)
          .hasMessageStartingWith("JdkWebSocket initial request execution error");
      cnn1.close();
      BiDi cnn4 = biDiProvider.getImplementation(caps, null).getBiDi();

      assertThatThrownBy(() -> biDiProvider.getImplementation(caps, null).getBiDi())
          .isInstanceOf(ConnectionFailedException.class)
          .hasMessageStartingWith("JdkWebSocket initial request execution error");
      cnn2.close();
      cnn3.close();
      BiDi cnn5 = biDiProvider.getImplementation(caps, null).getBiDi();
      BiDi cnn6 = biDiProvider.getImplementation(caps, null).getBiDi();

      assertThatThrownBy(() -> biDiProvider.getImplementation(caps, null).getBiDi())
          .isInstanceOf(ConnectionFailedException.class)
          .hasMessageStartingWith("JdkWebSocket initial request execution error");

      cnn4.close();
      cnn5.close();
      cnn6.close();
    } finally {
      Safely.safelyCall(driver::quit);
    }
  }
}
