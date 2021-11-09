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

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.grid.commands.EventBusCommand;
import org.openqa.selenium.grid.commands.Hub;
import org.openqa.selenium.grid.commands.Standalone;
import org.openqa.selenium.grid.config.CompoundConfig;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.MemoizedConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.distributor.httpd.DistributorServer;
import org.openqa.selenium.grid.node.httpd.NodeServer;
import org.openqa.selenium.grid.router.httpd.RouterServer;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.httpd.SessionMapServer;
import org.openqa.selenium.grid.sessionqueue.httpd.NewSessionQueueServer;
import org.openqa.selenium.grid.web.Values;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.testing.Safely;
import org.openqa.selenium.testing.TearDownFixture;

import java.io.IOException;
import java.io.StringReader;
import java.io.UncheckedIOException;
import java.net.ConnectException;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public enum DeploymentTypes {

  STANDALONE {
    @Override
    public Deployment start(Capabilities capabilities, Config additionalConfig) {
      StringBuilder rawCaps = new StringBuilder();
      try (JsonOutput out = new Json().newOutput(rawCaps)) {
        out.setPrettyPrint(false).write(capabilities);
      }

      String[] rawConfig = new String[]{
        "[network]",
        "relax-checks = true",
        "",
        "[server]",
        "registration-secret = \"provolone\"",
        "",
        "[sessionqueue]",
        "session-request-timeout = 100",
        "session-retry-interval = 1"
      };
      Config config = new MemoizedConfig(
        new CompoundConfig(
          additionalConfig,
          new TomlConfig(new StringReader(String.join("\n", rawConfig)))));

      Server<?> server = new Standalone().asServer(new CompoundConfig(setRandomPort(), config)).start();
      waitUntilReady(server, Duration.ofSeconds(5));

      return new Deployment(server, server::stop);
    }
  },
  HUB_AND_NODE {
    @Override
    public Deployment start(Capabilities capabilities, Config additionalConfig) {
      StringBuilder rawCaps = new StringBuilder();
      try (JsonOutput out = new Json().newOutput(rawCaps)) {
        out.setPrettyPrint(false).write(capabilities);
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
        "[server]",
        "registration-secret = \"feta\"",
        "",
        "[sessionqueue]",
        "session-request-timeout = 100",
        "session-retry-interval = 1"
      };
      Config baseConfig = new MemoizedConfig(
        new CompoundConfig(
          additionalConfig,
          new TomlConfig(new StringReader(String.join("\n", rawConfig)))));

      Config hubConfig = new MemoizedConfig(
        new CompoundConfig(
          setRandomPort(),
          new MapConfig(Map.of("events", Map.of("bind", true))),
          baseConfig));

      Server<?> hub = new Hub().asServer(hubConfig).start();

      MapConfig additionalNodeConfig = new MapConfig(Map.of("node", Map.of("hub", hub.getUrl())));

      Config nodeConfig = new MemoizedConfig(
        new CompoundConfig(
          additionalNodeConfig,
          setRandomPort(),
          baseConfig));
      Server<?> node = new NodeServer().asServer(nodeConfig).start();
      waitUntilReady(node, Duration.ofSeconds(5));

      waitUntilReady(hub, Duration.ofSeconds(5));

      return new Deployment(hub, hub::stop, node::stop);
    }
  },
  DISTRIBUTED {
    @Override
    public Deployment start(Capabilities capabilities, Config additionalConfig) {
      StringBuilder rawCaps = new StringBuilder();
      try (JsonOutput out = new Json().newOutput(rawCaps)) {
        out.setPrettyPrint(false).write(capabilities);
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
        "[server]",
        "",
        "registration-secret = \"colby\"",
        "",
        "[sessionqueue]",
        "session-request-timeout = 100",
        "session-retry-interval = 1"
      };

      Config sharedConfig = new MemoizedConfig(
        new CompoundConfig(
          additionalConfig,
          new TomlConfig(new StringReader(String.join("\n", rawConfig)))));

      Server<?> eventServer = new EventBusCommand()
        .asServer(new MemoizedConfig(new CompoundConfig(
          new TomlConfig(new StringReader(String.join("\n", new String[] {
            "[events]",
            "publish = \"tcp://localhost:" + publish + "\"",
            "subscribe = \"tcp://localhost:" + subscribe + "\"",
            "bind = true"}))),
          setRandomPort(),
          sharedConfig)))
        .start();
      waitUntilReady(eventServer, Duration.ofSeconds(5));

      Server<?> newSessionQueueServer = new NewSessionQueueServer()
        .asServer(new MemoizedConfig(new CompoundConfig(setRandomPort(), sharedConfig))).start();
      waitUntilReady(newSessionQueueServer, Duration.ofSeconds(5));
      Config newSessionQueueServerConfig = new TomlConfig(new StringReader(String.join(
        "\n",
        new String[] {
          "[sessionqueue]",
          "hostname = \"localhost\"",
          "port = " + newSessionQueueServer.getUrl().getPort()
        }
      )));

      Server<?> sessionMapServer = new SessionMapServer()
        .asServer(new MemoizedConfig(new CompoundConfig(setRandomPort(), sharedConfig))).start();
      Config sessionMapConfig = new TomlConfig(new StringReader(String.join(
        "\n",
        new String[] {
          "[sessions]",
          "hostname = \"localhost\"",
          "port = " + sessionMapServer.getUrl().getPort()
        }
      )));

      Server<?> distributorServer = new DistributorServer()
        .asServer(new MemoizedConfig(new CompoundConfig(
          setRandomPort(),
          sessionMapConfig,
          newSessionQueueServerConfig,
          sharedConfig)))
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
        .asServer(new MemoizedConfig(new CompoundConfig(
          setRandomPort(),
          sessionMapConfig,
          distributorConfig,
          newSessionQueueServerConfig,
          sharedConfig)))
        .start();

      MapConfig nodeConfig = new MapConfig(Map.of("node", Map.of("hub", router.getUrl())));

      Server<?> nodeServer = new NodeServer()
        .asServer(new MemoizedConfig(new CompoundConfig(
          nodeConfig,
          setRandomPort(),
          sharedConfig,
          sessionMapConfig,
          distributorConfig,
          newSessionQueueServerConfig)))
        .start();
      waitUntilReady(nodeServer, Duration.ofSeconds(5));

      waitUntilReady(router, Duration.ofSeconds(5));

      return new Deployment(
        router,
        router::stop,
        nodeServer::stop,
        distributorServer::stop,
        sessionMapServer::stop,
        newSessionQueueServer::stop,
        eventServer::stop);
    }
  };

  private static Config setRandomPort() {
    return new MapConfig(Map.of("server", Map.of("port", PortProber.findFreePort())));
  }

  private static void waitUntilReady(Server<?> server, Duration duration) {
    HttpClient client = HttpClient.Factory.createDefault().createClient(server.getUrl());

    try {
      new FluentWait<>(client)
          .withTimeout(duration)
          .pollingEvery(Duration.ofMillis(250))
          .ignoring(IOException.class)
          .ignoring(UncheckedIOException.class)
          .ignoring(ConnectException.class)
          .until(
              c -> {
                HttpResponse response = c.execute(new HttpRequest(GET, "/status"));
                Map<String, Object> status = Values.get(response, MAP_TYPE);
                return Boolean.TRUE.equals(
                  status != null && Boolean.parseBoolean(status.get("ready").toString()));
              });
    } finally {
      Safely.safelyCall(client::close);
    }
  }

  public abstract Deployment start(Capabilities capabilities, Config additionalConfig);

  public static class Deployment implements TearDownFixture {
    private final Server<?> server;
    private final List<TearDownFixture> tearDowns;

    private Deployment(Server<?> server, TearDownFixture... tearDowns) {
      this.server = server;
      this.tearDowns = Arrays.asList(tearDowns);
    }

    public Server<?> getServer() {
      return server;
    }

    @Override
    public void tearDown() throws Exception {
      tearDowns.parallelStream().forEach(Safely::safelyCall);
    }
  }
}
