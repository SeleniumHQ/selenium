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

package org.openqa.selenium.grid.commands;

import com.google.auto.service.AutoService;
import com.google.common.collect.ImmutableSet;

import org.openqa.selenium.BuildInfo;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.cli.CliCommand;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.TemplateGridServerCommand;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.Role;
import org.openqa.selenium.grid.data.NodeDrainComplete;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.distributor.config.DistributorOptions;
import org.openqa.selenium.grid.distributor.local.LocalDistributor;
import org.openqa.selenium.grid.graphql.GraphqlHandler;
import org.openqa.selenium.grid.log.LoggingOptions;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.ProxyNodeWebsockets;
import org.openqa.selenium.grid.node.config.NodeOptions;
import org.openqa.selenium.grid.router.Router;
import org.openqa.selenium.grid.security.BasicAuthenticationFilter;
import org.openqa.selenium.grid.security.Secret;
import org.openqa.selenium.grid.security.SecretOptions;
import org.openqa.selenium.grid.server.BaseServerOptions;
import org.openqa.selenium.grid.server.EventBusOptions;
import org.openqa.selenium.grid.server.NetworkOptions;
import org.openqa.selenium.grid.server.Server;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.grid.sessionmap.local.LocalSessionMap;
import org.openqa.selenium.grid.sessionqueue.NewSessionQueue;
import org.openqa.selenium.grid.sessionqueue.config.NewSessionQueueOptions;
import org.openqa.selenium.grid.sessionqueue.local.LocalNewSessionQueue;
import org.openqa.selenium.grid.web.CombinedHandler;
import org.openqa.selenium.grid.web.GridUiRoute;
import org.openqa.selenium.grid.web.RoutableHttpClientFactory;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.http.Routable;
import org.openqa.selenium.remote.http.Route;
import org.openqa.selenium.remote.tracing.Tracer;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.util.Collections;
import java.util.Set;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_OK;
import static java.net.HttpURLConnection.HTTP_UNAVAILABLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.DISTRIBUTOR_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.NODE_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.ROUTER_ROLE;
import static org.openqa.selenium.grid.config.StandardGridRoles.SESSION_QUEUE_ROLE;
import static org.openqa.selenium.remote.http.Route.combine;

@AutoService(CliCommand.class)
public class Standalone extends TemplateGridServerCommand {

  private static final Logger LOG = Logger.getLogger("selenium");

  @Override
  public String getName() {
    return "standalone";
  }

  @Override
  public String getDescription() {
    return "The selenium server, running everything in-process.";
  }

  @Override
  public Set<Role> getConfigurableRoles() {
    return ImmutableSet.of(DISTRIBUTOR_ROLE, HTTPD_ROLE, NODE_ROLE, ROUTER_ROLE, SESSION_QUEUE_ROLE);
  }

  @Override
  public Set<Object> getFlagObjects() {
    return Collections.singleton(new StandaloneFlags());
  }

  @Override
  protected String getSystemPropertiesConfigPrefix() {
    return "selenium";
  }

  @Override
  protected Config getDefaultConfig() {
    return new DefaultStandaloneConfig();
  }

  @Override
  protected Handlers createHandlers(Config config) {
    LoggingOptions loggingOptions = new LoggingOptions(config);
    Tracer tracer = loggingOptions.getTracer();

    EventBusOptions events = new EventBusOptions(config);
    EventBus bus = events.getEventBus();

    BaseServerOptions serverOptions = new BaseServerOptions(config);
    SecretOptions secretOptions = new SecretOptions(config);
    Secret registrationSecret = secretOptions.getRegistrationSecret();

    URI localhost = serverOptions.getExternalUri();
    URL localhostUrl;
    try {
      localhostUrl = localhost.toURL();
    } catch (MalformedURLException e) {
      throw new IllegalArgumentException(e);
    }

    NetworkOptions networkOptions = new NetworkOptions(config);
    CombinedHandler combinedHandler = new CombinedHandler();
    HttpClient.Factory clientFactory = new RoutableHttpClientFactory(
      localhostUrl,
      combinedHandler,
      networkOptions.getHttpClientFactory(tracer));

    SessionMap sessions = new LocalSessionMap(tracer, bus);
    combinedHandler.addHandler(sessions);

    DistributorOptions distributorOptions = new DistributorOptions(config);
    NewSessionQueueOptions newSessionRequestOptions = new NewSessionQueueOptions(config);
    NewSessionQueue queue = new LocalNewSessionQueue(
      tracer,
      distributorOptions.getSlotMatcher(),
      newSessionRequestOptions.getSessionRequestRetryInterval(),
      newSessionRequestOptions.getSessionRequestTimeout(),
      registrationSecret);
    combinedHandler.addHandler(queue);

    Distributor distributor = new LocalDistributor(
      tracer,
      bus,
      clientFactory,
      sessions,
      queue,
      distributorOptions.getSlotSelector(),
      registrationSecret,
      distributorOptions.getHealthCheckInterval(),
      distributorOptions.shouldRejectUnsupportedCaps(),
      newSessionRequestOptions.getSessionRequestRetryInterval());
    combinedHandler.addHandler(distributor);

    Routable router = new Router(tracer, clientFactory, sessions, queue, distributor)
      .with(networkOptions.getSpecComplianceChecks());

    HttpHandler readinessCheck = req -> {
      boolean ready = sessions.isReady() && distributor.isReady() && bus.isReady();
      return new HttpResponse()
        .setStatus(ready ? HTTP_OK : HTTP_UNAVAILABLE)
        .setContent(Contents.utf8String("Standalone is " + ready));
    };

    GraphqlHandler graphqlHandler = new GraphqlHandler(
      tracer,
      distributor,
      queue,
      serverOptions.getExternalUri(),
      getFormattedVersion());

    Routable ui = new GridUiRoute();

    Routable httpHandler = combine(
      ui,
      router,
      Route.prefix("/wd/hub").to(combine(router)),
      Route.options("/graphql").to(() -> graphqlHandler),
      Route.post("/graphql").to(() -> graphqlHandler));

    UsernameAndPassword uap = secretOptions.getServerAuthentication();
    if (uap != null) {
      LOG.info("Requiring authentication to connect");
      httpHandler = httpHandler.with(new BasicAuthenticationFilter(uap.username(), uap.password()));
    }

    // Allow the liveness endpoint to be reached, since k8s doesn't make it easy to authenticate these checks
    httpHandler = combine(httpHandler, Route.get("/readyz").to(() -> readinessCheck));

    Node node = new NodeOptions(config).getNode();
    combinedHandler.addHandler(node);
    distributor.add(node);

    bus.addListener(NodeDrainComplete.listener(nodeId -> {
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
        "Standalone shutdown: " + nodeId)
        .start();
    }));

    return new Handlers(httpHandler, new ProxyNodeWebsockets(clientFactory, node));
  }

  @Override
  protected void execute(Config config) {
    Require.nonNull("Config", config);

    Server<?> server = asServer(config).start();

    LOG.info(String.format(
      "Started Selenium Standalone %s: %s",
      getFormattedVersion(),
      server.getUrl()));
  }

  private String getFormattedVersion() {
    BuildInfo info = new BuildInfo();
    return String.format("%s (revision %s)", info.getReleaseLabel(), info.getBuildRevision());
  }
}
