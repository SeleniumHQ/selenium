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

package org.openqa.selenium.grid.node.httpd;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableSet;
import com.google.common.net.MediaType;
import net.jodah.failsafe.Failsafe;
import net.jodah.failsafe.RetryPolicy;
import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.TemplateGridCommand;
import org.openqa.selenium.grid.component.HealthCheck;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.Role;
import org.openqa.selenium.grid.data.NodeStatusEvent;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.ProxyNodeCdp;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.netty.server.NettyServer;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.Tracer;

import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_NO_CONTENT;
import static org.openqa.selenium.grid.config.StandardGridRoles.EVENT_BUS_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.NODE_ROLE;
import static org.openqa.selenium.grid.data.NodeAddedEvent.NODE_ADDED;
import static org.openqa.selenium.grid.data.NodeDrainComplete.NODE_DRAIN_COMPLETE;
import static org.openqa.selenium.remote.http.Route.get;

@AutoService(CliCommand.class)
public class NodeServer extends TemplateGridCommand {

  private static final Logger LOG = Logger.getLogger(NodeServer.class.getName());

  @Override
  public String getName() {
    return "node";
  }

  @Override
  public String getDescription() {
    return "Adds this server as a node in the selenium grid.";
  }

  @Override
  public Set<Role> getConfigurableRoles() {
    return ImmutableSet.of(EVENT_BUS_ROLE, HTTPD_ROLE, NODE_ROLE);
  }

  @Override
  public Set<Object> getFlagObjects() {
    return Collections.emptySet();
  }

  @Override
  protected String getSystemPropertiesConfigPrefix() {
    return "node";
  }

  @Override
  protected Config getDefaultConfig() {
    return new DefaultNodeConfig();
  }

  @Override
  protected void execute(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    EventBusOptions events = new EventBusOptions(config);
    EventBus bus = events.getEventBus();

    NetworkOptions networkOptions = new NetworkOptions(config);
    HttpClient.Factory clientFactory = networkOptions.getHttpClientFactory(tracer);

    BaseServerOptions serverOptions = new BaseServerOptions(config);

    LOG.info("Reporting self as: " + serverOptions.getExternalUri());

    NodeOptions nodeOptions = new NodeOptions(config);

    Node node = nodeOptions.getNode();

    HttpHandler readinessCheck = req -> {
      if (node.getStatus().hasCapacity()) {
        return new HttpResponse().setStatus(HTTP_NO_CONTENT);
      }

      return new HttpResponse()
        .setStatus(HTTP_INTERNAL_ERROR)
        .setHeader("Content-Type", MediaType.PLAIN_TEXT_UTF_8.toString())
        .setContent(Contents.utf8String("No capacity available"));
    };

    bus.addListener(NODE_ADDED, event -> {
      UUID nodeId = event.getData(UUID.class);
      if (node.getId().equals(nodeId)) {
        LOG.info("Node has been added");
      }
    });

    bus.addListener(NODE_DRAIN_COMPLETE, event -> {
      UUID nodeId = event.getData(UUID.class);
      if (!node.getId().equals(nodeId)) {
        return;
      }

      // Wait a beat before shutting down so the final response from the
      // node can escape.
      new Thread(
        () -> {
          try {
            Thread.sleep(1000);
          } catch (InterruptedException e) {
            // Swallow, the next thing we're doing is shutting down
          }
          LOG.info("Shutting down");
          System.exit(0);
        },
        "Node shutdown: " + nodeId)
        .start();
    });

    Route httpHandler = Route.combine(
      node,
      get("/readyz").to(() -> readinessCheck));

    Server<?> server = new NettyServer(serverOptions, httpHandler, new ProxyNodeCdp(clientFactory, node));
    server.start();

    BuildInfo info = new BuildInfo();
    LOG.info(String.format(
      "Started Selenium node %s (revision %s): %s",
      info.getReleaseLabel(),
      info.getBuildRevision(),
      server.getUrl()));

    // Unlimited attempts, initial 5 seconds interval, backoff rate of 1.0005, max interval of 5 minutes
    RetryPolicy<Object> registrationPolicy =  new RetryPolicy<>()
      .withMaxAttempts(-1)
      .handleResultIf(result -> true)
    .withBackoff(Duration.ofSeconds(5).getSeconds(), Duration.ofMinutes(5).getSeconds(), ChronoUnit.SECONDS, 1.0005);

    LOG.info("Starting registration process for node id " + node.getId());
    Executors.newSingleThreadExecutor().submit(() -> {
      Failsafe.with(registrationPolicy).run(
        () -> {
          LOG.fine("Sending registration event");
          HealthCheck.Result check = node.getHealthCheck().check();
          if (!check.isAlive()) {
            LOG.severe("Node is not alive: " + check.getMessage());
            // Throw an exception to force another check sooner.
            throw new UnsupportedOperationException("Node cannot be registered");
          }
          bus.fire(new NodeStatusEvent(node.getStatus()));
        }
      );
    });
  }

}
